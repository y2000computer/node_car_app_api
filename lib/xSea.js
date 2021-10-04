var regex = require('../lib/regex');
var xSQL = require('../lib/xSQL');
var xCm = require('../lib/xCm');
var xTween = require('../lib/xTween');
var common = require('../lib/common');
var crypto = require('crypto');
var moment = require('moment');
var extend = require('extend');
var path = require('path');
var util = require('util');
var fs = require('fs');

var xSea = {
    ORDER_TIMEOUT_M: 20,                          // 逾時分鐘
    ORDER_TIMEOUT: 20 * 60 * 1000,                // 逾時ms
    ORDER_2_KM_DELAY: 0,                          // 2公里以下延時
    ORDER_24_KM_DELAY: 8 * 1000,                  // 2-4公里延時
    ORDER_48_KM_DELAY: 16 * 1000,                 // 4-8公里延時
    ORDER_8_KM_DELAY: 32 * 1000,                  // 8公里以上延時
    ORDER_KM_DELAY_BY_CURVE: true,                // 是否使用曲線延時
    ORDER_KM_DELAY_CURVE: xTween.Cubic.easeInOut, // 曲線圖及名稱: http://easings.net/zh-cn
    ORDER_KM_DELAY_CURVE_MAX_KM: 8,               // 曲線最大KM值
    ORDER_KM_DELAY_CURVE_MAX_TIME: 32 * 1000,     // 曲線最大時間值
    WAITLOAD_INTERVAL: 50,                        // 等候載入檢查間隔ms
    WAITLOAD_TIMEOUT: 10 * 1000,                  // 等候載入超時ms
    debug_log: true,                             // 是否顯示偵錯Log
    isLoading: false,                             // xSea是否正在載入中...
    list_driver: {},                              // 司機緩存區
    list_pool: [],                                // 大海訂單緩存區
    /** 當 伺服器 或 Node.js 起動時, 必須先執行一次 */
    Init: async () => {
        try {
            xSea.isLoading = true;
            console.log(`xSea.Init() ===> Start`); //打印Log
            xSea.ClearCache();                     //清理訂單池
            var cdis = {                           //初始化權重延時設定
                1: SeaOrderConfig.customer_delay_in_second.internal_reserved_delay,
                2: SeaOrderConfig.customer_delay_in_second.normal_reserved_delay,
                3: SeaOrderConfig.customer_delay_in_second.observation_reserved_delay,
                4: SeaOrderConfig.customer_delay_in_second.under_mark_reserved_delay
            };
            var SQL = new xSQL();                  //初始化 MySQL 接口
            SQL.ReadOrder = '`id` DESC';           //倒序排列
            SQL.ReadP('state_code', '=', 'YEL_WAIT_DRIVER_CONFIRM'); //等待司機的訂單
            SQL.ReadP('create_datetime', '>=', moment().add(-xSea.ORDER_TIMEOUT_M, 'm').format('YYYY-MM-DD HH:mm:ss')); //20分鐘內的訂單
            var r = await SQL.xRead('tbl_resv_order_flow');          //讀取 tbl_resv_order_flow 表到 r 變量
            if (!r.eof) {  //有找到訂單時
                for (var row of r.row) { //預處理所有資料
                    var create = moment(row.create_datetime).valueOf();
                    var timeout = new xSea.TimeOutIinstance(row.id);
                    row.timeout = setTimeout(timeout.Run, create + xSea.ORDER_TIMEOUT - Date.now());
                    row.timer = create + (cdis[row.order_priority] * 1000); //插入訂單權重延時
                    xSea.list_pool.push(row);  //插入至訂單池
                }
                console.log(`xSea.Init() ===> Loaded ${r.row.length} Records...`); //打印Log
            } else {       //沒有找到訂單時
                console.log(`xSea.Init() ===> Empty`); //打印Log
            }
            console.log(`xSea.Init() ===> End`);       //打印Log
            xSea.isLoading = false;
        } catch (error) {
            xSea.ClearCache();                     //清理訂單池
            xSea.isLoading = false;
            console.log(`xSea.Init() ===> Error`, {    //打印Log
                ErrorTarget: 'xSea.Init',
                ErrorDate: moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
                ErrorDetail: error
            });
            console.error(error); //打印Log
            return;
        }
    },
    TimeOutIinstance: function (id) { this.id == id; this.Run = () => { xSea.DeleteById(self.id); }; var self = this; },
    DeleteById: (id) => {
        xSea.isLoading = true;
        try {
            var index = xSea.list_pool.findIndex((e) => { return e.id == id; });
            clearTimeout(xSea.list_pool[index].timeout);
            xSea.list_pool.splice(index, 1);
        } catch (err) { console.log(`xSea.DeleteById(${id}) ===> Error`, err); }
        xSea.isLoading = false;
    },
    ClearCache: () => {
        var already = xSea.isLoading;
        xSea.isLoading = true;
        if (xSea.list_pool.length > 0) {
            for (var [i, row] of xSea.list_pool.entries()) {
                try { clearTimeout(row.timeout); } catch (err) { console.log(`xSea.ClearCache() ===> Error`, err); }
            }
        }
        xSea.list_pool = [];
        if (!already) xSea.isLoading = false;
    },
    /** xSea載入中的等待器 */
    WaitLoad: async () => {
        return new Promise((resolve, reject) => {
            var date = Date.now();
            (function sub() {
                if (Date.now() - date > xSea.WAITLOAD_TIMEOUT) { reject(new Error('xSea.WaitLoad() => xSea.Init TimeOut!')); return; }
                if (xSea.isLoading) { setTimeout(sub, xSea.WAITLOAD_INTERVAL); } else { xSea.isLoading = false; resolve(true); }
            })();
        });
    },
    /** 當數據庫資料有變時, 刷新一下緩存... */
    Update: async () => {
        await xSea.WaitLoad(); //如xSea載入中就等一下把
        await xSea.Init();     //開始刷新緩存...
        return true;           //完成後返回true
    },
    /**
     * 取得大海訂單
     * @param {number} driver_id 司機ID
     * @param {number} driver_lat 司機坐標
     * @param {number} driver_lng 司機坐標
     * @param {string} grade_sub_code 車輛類別
     * @param {boolean} down_to_x_is 是否降級至X
     * @param {number} priority 優先權 1~4
     */
    List: async (driver_id, driver_lat, driver_lng, grade_sub_code, down_to_x_is, priority) => {
        var _now = Date.now();      //暫存時間
        await xSea.WaitLoad();      //如xSea載入中就等一下把
        var match = {        //初始化配對設定
            HK_CAR_X_SEAT_4: { HK_CAR_X_SEAT_4: true },
            HK_CAR_BLACK_SEAT_4: { HK_CAR_X_SEAT_4: true, HK_CAR_BLACK_SEAT_4: true },
            HK_CAR_BLACK_SEAT_7: { HK_CAR_X_SEAT_4: true, HK_CAR_BLACK_SEAT_4: true, HK_CAR_BLACK_SEAT_7: true }
        }
        var priority_config = {};   //初始化優先權設定
        for (var i = 1; i <= 4; i++) { priority_config[i] = SeaOrderConfig.driver_delay_in_second[`order_priority_${i}`]; } //讀取優先權設定
        //tbl_resv_order_service_type_master
        //tbl_resv_order_panel_dispatch_to_driver
        // <!-- 開始進入非同步迴圈
        var _result = await xCm.xLoop(xSea.list_pool, [], (index, source, result) => {
            var now = _now;          //區域化變量
            var row = source[index]; //設定目標資料列
            if (down_to_x_is) { //可以降級至X
                if (!match[grade_sub_code][row.grade_sub_code]) return result; //配對不成功就處理下一筆資料
            } else {            //不可以降級至X
                if (row.grade_sub_code != grade_sub_code) return result;       //配對不成功就處理下一筆資料
            }
            var distance = common.getKM(driver_lat, driver_lng, row.pickup_latitude, row.pickup_longitude); //計算坐標距離
            if (xSea.ORDER_KM_DELAY_BY_CURVE) { //使用曲線延時
                var percent = distance / xSea.ORDER_KM_DELAY_CURVE_MAX_KM; //計算與最大KM值間的百分比
                var cdelay = xSea.ORDER_KM_DELAY_CURVE((percent > 1 ? 1 : percent), 0, xSea.ORDER_KM_DELAY_CURVE_MAX_TIME, 1).toFixed(0); //計算曲線延時時間
                now -= cdelay; //插入曲線延時
            } else {   //不使用曲線延時
                switch (true) { //為不同距離設定顯示延時
                    case (distance < 2): now -= xSea.ORDER_2_KM_DELAY; break;
                    case (distance >= 2 && distance < 4): now -= xSea.ORDER_24_KM_DELAY; break;
                    case (distance >= 4 && distance < 8): now -= xSea.ORDER_48_KM_DELAY; break;
                    case (distance >= 8): now -= xSea.ORDER_8_KM_DELAY; break;
                }
            }
            pdelay = priority_config[priority] * 1000; //計算優先權延時
            now -= pdelay;  //插入優先權延時
            if (now >= row.timer) { //配對成功
                //打印Debug記錄
                if (xSea.debug_log) { console.log(`\x1b[32mxSea.List() => Record Hit !!! => Distance: ${distance.toFixed(2)}km, TotalDelay: ${_now - now}ms, ${(xSea.ORDER_KM_DELAY_BY_CURVE ? `CurveDelay: ${cdelay}ms, ` : '')}PriorityDelay: ${pdelay}ms, fromNow: ${((now - row.timer) / 1000).toFixed(0)}s\x1b[0m`); }
                var data = extend(true, {}, row);
                delete data.timeout;
                data.pickup_nearly_is = distance < 2 ? true : false;
                data.pickup_distance_km = distance.toFixed(0);
                result.push(data); //為結果插入讓筆資料
            } else {  //配對失敗
                //打印Debug記錄
                if (xSea.debug_log) { console.log(`\x1b[2mxSea.List() => Record unMatch => Distance: ${distance.toFixed(2)}km, TotalDelay: ${_now - now}ms, ${(xSea.ORDER_KM_DELAY_BY_CURVE ? `CurveDelay: ${cdelay}ms, ` : '')}PriorityDelay: ${pdelay}ms, fromNow: ${((now - row.timer) / 1000).toFixed(0)}s\x1b[0m`); }
            }
            return result; //處理下一筆資料
        });
        // 結束非同步迴圈 -->
        console.log(`\x1b[33mxSea.List() => Scan Time: ${(Date.now() - _now)}ms, Scan Size: ${xSea.list_pool.length}, Match Count: ${_result.length}\x1b[0m`);
        var order_id_str = '';
        if (_result.length > 0) {
            for (var [i, row] of _result.entries()) { if (order_id_str != '') order_id_str += ','; order_id_str += row.id; }
        }
        var SQL = new xSQL('middle');
        await SQL.xQuery(
            'INSERT INTO `tbl_resv_order_panel_dispatch_to_driver` SET ? ON DUPLICATE KEY UPDATE ' +
            "lastUpdateAt = VALUES(lastUpdateAt)",
            {
                hash: xCm.md5(`${driver_id}-${order_id_str}`),
                driver_user_id: driver_id,
                order_id: order_id_str,
                lastUpdateAt: new Date()
            }
        );
        
        return _result; //輸出結果
    }
}
module.exports = xSea;