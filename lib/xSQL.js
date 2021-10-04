var mysql = require('mysql');
var extend = require('extend');
var moment = require('moment');
var xCfg = require('../lib/xCfg');
var xCm = require('../lib/xCm');
var regex = require('../lib/regex');

var QueryTimes = 0;
var poolCluster = mysql.createPoolCluster();
var dbs = xCfg.mysql.dbs;
(function () {
    for (var id in dbs) {
        poolCluster.add(id, {
            acquireTimeout: xCfg.mysql.acquireTimeout,
            connectionLimit: xCfg.mysql.connectionLimit,
            waitForConnections: xCfg.mysql.waitForConnections,
            host: xCfg.mysql.host,
            port: xCfg.mysql.port,
            user: xCfg.mysql.user,
            password: xCfg.mysql.password,
            database: xCfg.mysql.dbs[id]
        });
    }
})();
function xSQL(database) {
    this.db = database || xCfg.mysql.default;
    this.error = null;
    this.eof = true;
    this.top = 0;
    this.debug = '';
    this.debugp = '';
    this.log = true;    
    var me = this;
    this.EmptyPageDetail = {
        page: 1,
        count: 10,
        startPage: 1,
        endPage: 1,
        startIndex: 0,
        endIndex: 0,
        nextpage: false
    }
    var query = function () {
        var queryArgs = Array.prototype.slice.call(arguments), events = [], eventNameIndex = {};
        poolCluster.getConnection(me.db, function (err, conn) {
            if (err) { if (eventNameIndex.error) { eventNameIndex.error(err); } }
            if (conn) {
                if (me.log) console.log(queryArgs);
                var q = conn.query.apply(conn, queryArgs);
                q.on('end', function () { conn.release(); });
                events.forEach(function (args) { q.on.apply(q, args); });
            }
        });
        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
    /** ES7 Async xQuery */
    var xQuery = async function (sql, values) {
        var queryArgs = Array.prototype.slice.call(arguments), events = [];
        return new Promise((resolve, reject) => {
            poolCluster.getConnection(me.db, (err, conn) => {
                if (err) { reject(err); } else {
                    queryArgs.push((err, rows) => {
                        var end = new Date().getTime();
                        if (me.log) console.log(`\x1b[4m${end - me.Timer}ms\x1b[0m`, sql, values);
                        if (err) { reject(err); } else { resolve(rows); }
                        conn.release();
                    });
                    conn.query.apply(conn, queryArgs);
                }
            });
        });
    }
    /** ES7 Async xAdd */
    this.xQuery = async function (sql, data) { 
        try {
            me.Timer = new Date().getTime();
            return await xQuery(sql, data);
        } catch (error) {
            throw error;
        }
    };
        /** 
     *  ES7 Async SQL.xAddxEdit
     * ---
     * Insert or Update record
     * * * *
     * ``INSERT INTO `table` SET (`money` = 999`) ON DUPLICATE KEY UPDATE `money`=VALUES('money')``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xAddxEdit('table', { money: 999 });``
     * * * *
     * @param {string} table The name of the table.  
     * @param {Object} data The data object.
     */ 
    this.xAddxEdit = async function (table, data) { 
        me.Timer = new Date().getTime();
        var keys = Object.keys(data);
        var xCmd = '';
        for (var i in keys) { 
            if (xCmd != '') xCmd += ', ';
            xCmd += '' + keys[i] + '=VALUES(' + keys[i] + ')';
        }
        var cmd = 'INSERT INTO `' + table + '` SET ? ON DUPLICATE KEY UPDATE ' + xCmd;
        var result = {};
        try {
            result = await xQuery(cmd, data);
        } catch (err) {
            result.err = err;
        }
        return result;
    }
    /** 
     *  ES7 Async SQL.xAdd
     * ---
     * * * *
     * ``INSERT INTO `table` SET (`money` = 999`)``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xAdd('table', { money: 999 });``
     * * * *
     * @param {string} table The name of the table.  
     * @param {Object} data The data object.
     */ 
    this.xAdd = async function (table, data) {
        me.Timer = new Date().getTime();
        var cmd = 'INSERT INTO `' + table + '` SET ?';
        var result = {};
        try {
            result = await xQuery(cmd, data);
        } catch (err) {
            result.err = err;
        }
        return result;
    }
    /** 
     *  ES7 Async SQL.xEdit
     * ---
     * * * *
     * ``UPDATE `table` ``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xEdit('table');``
     * * * *
     * ``UPDATE `table` SET (`money` = 999`)``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xEdit('table', { money: 999 });``
     * * * *
     * ``UPDATE `table` SET (`money` = 999`) WHERE `num` = 123``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xEdit('table', 'num', 123, { money: 999 });``
     * * * *
     * @param {string} table The name of the table.  
     * @param {string|Object} col The name of the field or the data object.
     * @param {string} [val] The value of the field __(Optional)__.
     * @param {Object} data The data object __(Optional)__..
     */  
    this.xEdit = async function (table, col, val, data) {
        me.Timer = new Date().getTime();
        var cmd = '';
        var result = {};
        try {
            if (col && val && data) {
                var cmd = 'UPDATE `' + table + '` SET ? WHERE ?? = ?';
                result = await xQuery(cmd, [data, col, val]);
            } else if (col) {
                var cmd = 'UPDATE `' + table + '` SET ?';
                result = await xQuery(cmd, col);
            }
        } catch (err) {
            result.err = err;
        }
        return result;
    }
    /** 
     *  ES7 Async SQL.xDel
     * ---
     * * * *
     * ``DELETE FROM `table` ``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xDel('table');``
     * * * *
     * ``DELETE FROM `table` WHERE `num` = 123``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xDel('table', 'num', 123);``
     * * * *
     * @param {string} table The name of the table.  
     * @param {string} [col] The name of the field __(Optional)__.
     * @param {string} [val] The value of the field __(Optional)__.
     */   
    this.xDel = async function (table, col, val) {
        me.Timer = new Date().getTime();
        var cmd = '';
        var result = {};
        try {
            if (typeof col === 'object') {
                cmd = 'DELETE FROM `' + table + '` WHERE';
                var keys = Object.keys(col);
                var temp = [];
                var xcmd = '';
                for (var i in keys) { 
                    if (xcmd != '') xcmd += ' AND ';
                    xcmd += ' `' + keys[i] + '` = ? ';
                    temp.push(col[keys[i]]);
                }
                cmd += xcmd;
                result = await xQuery(cmd, temp);
            } else { 
                if (col && val) {
                    cmd = 'DELETE FROM `' + table + '` WHERE `' + col + '` = ?';
                    result = await xQuery(cmd, val);
                } else if (table) {
                    cmd = 'DELETE FROM `' + table + '`';
                    result = await xQuery(cmd);
                }
            }
        } catch (err) {
            result.err = err;
        }
        return result;
    }    
    this.PageDataOnly = false;    
    this.Timer = null;
    /** 
     *  ES7 Async SQL.xRead
     * ---
     * * * *
     * ``SELECT * FORM `table` ``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xRead('table');``
     * * * *
     * ``SELECT * FORM `table` WHERE `num` = 123``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``var r = await SQL.xRead('table', 'num', 123);``
     * * * *
     * ``SELECT * FORM `table` ORDER BY `num` DESC``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadOrder = '`num` DESC';``  
     * ``var r = await SQL.xRead('table');``  
     * * * *
     * ``SELECT * FORM `table` WHERE `date` between 123456 AND 654321 LIMIT 5``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadLimit = 5;``  
     * ``SQL.ReadP('date', 'between', [123456, 654321]);``  
     * ``var r = await SQL.xRead('table');``
     * * * *
     * ``SELECT `num`,`name` FORM `table` LIMIT 5 ORDER BY `num` DESC``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadSelect = '`num`,`name`';``  
     * ``SQL.ReadLimit = 5;``  
     * ``SQL.ReadOrder = '`num` DESC';``  
     * ``var r = await SQL.xRead('table');``
     * * * *
     * ``SELECT * FORM `table` WHERE `num` = 123 AND `name` LIKE `%ABC%` OR `enable` = 1``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadP('num', '=',123);``  
     * ``SQL.ReadP('name', 'LIKE', '%ABC%');``  
     * ``SQL.ReadP('enable', '=', 1, false);``  
     * ``var r = await SQL.xRead('table');``
     * * * *
     * @param {string} table The name of the table.  
     * @param {string} [col] The name of the field __(Optional)__.
     * @param {string} [val] The value of the field __(Optional)__.
     */   
    this.xRead = async function (table, col, val) { 
        me.Timer = new Date().getTime();
        var cmd = '';
        var select = me.ReadSelect == '' ? '*' : me.ReadSelect;
        var result = new me.ReadResult;
        if (!table) { table = me.ReadJoinAry; }
        try {
            if (Array.isArray(table)) {
                // Join Table
                var a = '', b = '';
                for (var i in table) {
                    var q = table[i];
                    if (a.length > 0) {
                        a += ', ';
                        b += ' ' + q.mode + ' JOIN ';
                    }
                    var key = xCm.numberABC(i);
                    a += table[i] + '.*';
                    if (!q.on) {
                        b += '`' + q.name + '` AS ' + q.id;
                    } else {
                        b += '`' + q.name + '` AS ' + q.id + ' ON ' + q.on;
                    }
                
                }
                cmd = 'SELECT ' + select + ' FROM ' + b;
            } else {
                // Normal
                cmd = 'SELECT ' + select + ' FROM `' + table + '`';
            }

            if (col && val != undefined && val != null) {
                if (Array.isArray(table)) {
                    // Join Table
                    cmd += ' WHERE ' + col + ' = ?';
                } else {
                    // Normal
                    cmd += ' WHERE `' + col + '` = ?';
                }
                if (me.ReadOrder != '') { cmd += ' ORDER BY ' + me.ReadOrder; }
                if (me.ReadLimit != '') { cmd += ' LIMIT ' + me.ReadLimit; }
                // console.log(cmd, val);
                result.row = await xQuery(cmd, val);
            } else if (me.ReadArray.length > 0) {
                cmd += ' WHERE ';
                var xVal = [], t1 = me.ReadArray, t2 = '', t3 = '', inGroup = false, inGroupFirst = true;
                for (var i in t1) {
                    var temp = t1[i];
                    if (temp.group == null) {
                        if (inGroup) {
                            if (!inGroupFirst) { if (temp.and) { t3 += ' AND '; } else { t3 += ' OR '; } }
                            inGroupFirst = false;
                            if (Array.isArray(table)) {
                                t3 += temp.name + ' ' + temp.equal + ' ?';
                            } else {
                                if (temp.equal.toLowerCase() == 'between') {
                                    t3 += '`' + temp.name + '` ' + temp.equal + ' ? AND ?';
                                } else { 
                                    t3 += '`' + temp.name + '` ' + temp.equal + ' ?';
                                }
                            }
                        } else {
                            if (t2 != '') { if (temp.and) { t2 += ' AND '; } else { t2 += ' OR '; } }
                            if (Array.isArray(table)) {
                                t2 += temp.name + ' ' + temp.equal + ' ?';
                            } else {
                                if (temp.name.startsWith('*')) {
                                    t2 += temp.name.replace(/^\*/g, '') + ' ' + temp.equal + ' ?';
                                } else {
                                    if (temp.equal.toLowerCase() == 'between') {
                                        t2 += '`' + temp.name + '` ' + temp.equal + ' ? AND ?';
                                    } else { 
                                        t2 += '`' + temp.name + '` ' + temp.equal + ' ?';
                                    }
                                }
                            }
                        }
                        if (Array.isArray(temp.val)) {
                            xVal.push(temp.val[0]);
                            xVal.push(temp.val[1]);
                        } else { 
                            xVal.push(temp.val);
                        }
                    } else {
                        if (temp.group) {
                            if (t2 != '') t2 += ' ' + temp.connect + ' ';
                            t3 += ' ( ';
                            inGroup = true;
                            inGroupFirst = true;
                        } else {
                            t3 += ' ) ';
                            //if (i + 1 <= t1.length - 1) { t3 += temp.connect; }
                            inGroup = false;
                            t2 += t3;
                            t3 = '';
                        }
                    }
                }
                cmd += t2;
                if (me.ReadOrder != '') { cmd += ' ORDER BY ' + me.ReadOrder; }
                if (me.ReadLimit != '') { cmd += ' LIMIT ' + me.ReadLimit; }
                // console.log(cmd, xVal);
                result.row = await xQuery(cmd, xVal);
            } else {
                // Select All
                if (me.ReadOrder != '') { cmd += ' ORDER BY ' + me.ReadOrder; }
                if (me.ReadLimit != '') { cmd += ' LIMIT ' + me.ReadLimit; }
                // console.log(cmd);
                result.row = await xQuery(cmd);
            }
            if (result.col.length == 0 && result.row.length > 0) {
                result.col = Object.keys(result.row[0]);
            }

            // Paging Loader
            (function processEnd() {
                if (pageOption.enable) {
                    function pageHandle() {
                        var r = result;
                        if (r.eof) { return false; }
                        var p = pageOption;
                        // r:86/c:10=8.6 => ceil:9
                        var hasPage = Math.ceil(r.row.length / p.count);
                        // ap:9+hp:9=18-2=16
                        p.bPage = p.aPage + hasPage - 1;
                        var aRow = 0, bRow = 0;
                        // p:3-1=2*c:10
                        aRow = ((p.page - 1) * p.count) - p.mPage * p.count * Math.floor((p.page - 1) / p.mPage);
                        if (aRow > r.row.length) { return false; }
                        bRow = aRow + p.count - 1;
                        bRow = bRow >= r.row.length ? r.row.length - 1 : bRow;
                        var row = [];
                        for (var i = aRow; i <= bRow; i++) { row.push(r.row[i]); }
                        r.row = row;
                        r.pagebar = me.PageBar();
                        return true;
                    }
                    if (!pageHandle()) {
                        if (pageOption.page > 1) {
                            if (me.PageDataOnly) { 
                                result.eof = true;
                                result.col = [];
                                result.row = [];
                                result.pagebar = { nextpage: false };
                            } else { 
                                var url = _req.originalUrl.split('?')[0] + '?';
                                var n = 0;
                                for (var i in _req.query) {
                                    if (i != 'page') {
                                        if (n > 0) url += '&';
                                        url += i + '=' + _req.query[i];
                                        n++;
                                    }
                                }
                                url += n > 0 ? '&' : '';
                                url += 'page=1,' + pageOption.count;
                                _res.writeHead(302, { 'Location': url });
                                _res.end();
                                return false;
                            }
                        }
                    };
                }
            })();
        } catch (err) { result.err.push(err); }
        me.ReadOrder = '';
        me.ReadSelect = '';
        me.ReadLimit = 0;
        me.ReadArray = [];
        me.ReadJoinAry = [];
        return result;
    }
    
    this.Add = function (table, data) {
        var cmd = 'INSERT INTO `' + table + '` SET ?';
        return query(cmd, data);
    }
    this.Edit = function (table, col, val, data) {
        var cmd = '';
        if (col && val && data) {
            var cmd = 'UPDATE `' + table + '` SET ? WHERE ?? = ?';
            return query(cmd, [data, col, val]);
        } else if (col) {
            var cmd = 'UPDATE `' + table + '` SET ?';
            return query(cmd, col);
        }
    }
    var pageOption = {
        enable: false,
        page: 1,
        count: 20,
        aLimit: 0,
        bLimit: 0,
        aPage: 0,
        bPage: 0,
        mPage: 0,
        view: 'xPageBar'
    }
    /**
     * The paging settings
     * ---
     * @namespace
     * @property {object}  PageData 分頁欄設定
     * @property {boolean}  PageData.enable 開關分頁功能.
     * @property {number}  PageData.page 要顯示的頁.
     * @property {number}  PageData.count 每頁要顯示的筆數.
     * @property {number}  PageData.aLimit SQL LIMIT 指令碼起始筆數.
     * @property {number}  PageData.bLimit SQL LIMIT 指令碼結束筆數.
     * @property {number}  PageData.aPage 表示返回資料所包含的起始頁碼.
     * @property {number}  PageData.bPage 表示返回資料所包含的結束頁碼.
     * @property {number}  PageData.mPage 設定每一組分頁欄要顯示的頁碼數量.  
     *
     * __頁碼數量:例子A__  
     * page(頁碼):4,mPage(頁碼數量):8  
     * 分頁欄: 1,2,3,__4__,5,6,7,8
     *
     * __頁碼數量:例子B__  
     * page(頁碼):3,mPage(頁碼數量):4  
     * 分頁欄: 1,2,3,__4__
     *
     * __頁碼數量:例子C__  
     * page(頁碼):3,mPage(頁碼數量):2  
     * 分頁欄: 3,__4__
     * @property {string}  PageData.view 樣式板名稱. (暫時只支援 xView framework)
     * 
     */
    this.PageData = pageOption;
    var _req = null;
    var _res = null;
    /**
     * Reading DB by paging
     * ---
     * * * *
     * Doing paging with JSON format.  
     * ``SQL.SQL.PageDataOnly = true;``  
     * ``SQL.ReadByPage(req, res, 20);``  
     * ``var r = await SQL.xRead('tableName');``  
     * * * *
     * Doing paging with xView HTML format.  
     * Please make sure you had installed handlebars and setuped the xView framework.
     * ``SQL.ReadByPage(req, res, 20);``  
     * ``var r = await SQL.xRead('tableName');``  
     * * * *
     * @param {Request} req Request object of Express.
     * @param {Response} res Response object of Express.
     * @param {number} count 設定每頁要顯示的筆數.
     */
    this.ReadByPage = function (req, res, count) {
        _req = req;
        _res = res;
        var v = [1, 10];
        var val = '1,' + count;
        if (typeof req.body.page === 'number') { 
            var vc = typeof req.body.count === 'number' ? req.body.count : count;
            v = [req.body.page, vc];
        } else { 
            if (req.method == 'GET') {
                val = regex.IsPageParam(req.query.page) ? req.query.page : val;
            } else {
                val = regex.IsPageParam(req.body.page) ? req.body.page : val;
            }
            v = val.split(',');
        }

        // 一開始需要9頁, 之後需要10頁資料製作 PageBar
        var page = parseInt(v[0]);
        var count = parseInt(v[1]);
        var aLimit = 0; //數據庫開始位置
        var bLimit = 0; //數據庫結束位置
        var aPage = 0;  //頁面開始頁碼
        var bPage = 0;  //頁面結束頁碼
        var mPage = 8;  //每組分頁欄最大分頁數量
        if (page <= mPage) {
            aLimit = 0;
            bLimit = count * (mPage + 1);
            aPage = 1;
            bPage = mPage;
        } else {
            // p=13: 13/8=1.625 => floor=1
            // p=25: 25/8=3.125 => floor=3
            // floor=1: 1*8*10+10=90
            // floor=3: 3*8*10+10=250
            aLimit = (Math.floor((page - 1) / mPage) * mPage * count);
            // 8*10+10*1=90
            bLimit = mPage * count + count * 1;
            // p=13: 13/8=1.625 => floor=1
            // p=25: 25/8=3.125 => floor=3
            // floor=1: 1*8+1=9
            // floor=3: 3*8+1=25
            aPage = (Math.floor((page - 1) / mPage) * mPage) + 1;
            // 9: 9+8-1=16
            // 25: 25+8-1=32
            bPage = aPage + mPage - 1;
        }
        pageOption.enable = true;
        pageOption.page = page;
        pageOption.count = count;
        pageOption.aLimit = aLimit;
        pageOption.bLimit = bLimit;
        pageOption.aPage = aPage;
        pageOption.bPage = bPage;
        pageOption.mPage = mPage;
        me.ReadLimit = aLimit + ',' + bLimit;
    }
    function pageUrl(page, count) {
        page = page || 1;
        count = count || pageOption.count;
        var url = _req.originalUrl.split('?')[0] + '?';
        var n = 0;
        for (var i in _req.query) {
            if (i != 'page') {
                if (n > 0) url += '&';
                url += i + '=' + _req.query[i];
                n++;
            }
        }
        url += n > 0 ? '&' : '';
        url += 'page=' + page + ',' + count;
        return url;
    }
    /**內部使用 */
    this.PageBar = function () {
        if (me.PageDataOnly) {
            if (!pageOption.enable) return null;
            var p = extend(true, {}, pageOption);
            p.nextpage = p.page >= p.bPage ? false : true;
            return p;
        } else {
            if (!pageOption.enable) return '';
            var list = [];
            var p = extend(true, {}, pageOption);
            var tmpCount = [10, 20, 40, 80, 100, 200, 400, 800];
            p.nCount = '顯示 ' + p.count + ' 筆資料';
            p.aCount = [];
            for (var i in tmpCount) {
                p.aCount.push({
                    disable: tmpCount[i] == p.count ? true : false,
                    text: '顯示 ' + tmpCount[i] + ' 筆資料',
                    href: pageUrl(p.page, tmpCount[i])
                });
            }
            p.aLink = [];
            p.aLink.push({
                disable: p.page == 1 ? true : false,
                text: '«',
                href: p.page == 1 ? 'javascript:;' : pageUrl(p.page - 1)
            });
            if ((p.page) / p.mPage > 1) {
                p.aLink.push({
                    disable: false,
                    text: '...',
                    href: pageUrl(p.aPage - 1)
                });
            }
            for (var i = p.aPage; i <= p.bPage && i <= p.mPage * (Math.floor((p.page - 1) / p.mPage) + 1); i++) {
                p.aLink.push({
                    active: p.page == i ? true : false,
                    text: i,
                    href: pageUrl(i)
                });
            }
            if (p.bPage - p.aPage >= p.mPage) {
                p.aLink.push({
                    disable: false,
                    text: '...',
                    href: pageUrl(p.bPage)
                });
            }
            p.aLink.push({
                disable: p.page == p.bPage ? true : false,
                text: '»',
                href: p.page == p.bPage ? 'javascript:;' : pageUrl(p.page + 1)
            });
            p.link = pageUrl("'+t+'");
            //console.log(p);
            var xView = require('../lib/xView');
            return xView.views[p.view].Render(p);
        }
    }
    /**內部使用 */
    this.ReadArray = [];
    /**
     * ``ORDER BY `num` DESC```  
     * 　　⇣　⇣　⇣　⇣  
     * ``SQL.ReadOrder = '`num` DESC';``  
     * ``var r = await SQL.xRead('table');``
     */
    this.ReadOrder = '';
    /**
     * * * *
     * ``Select *``  
     * 　　⇣　⇣  
     * ``SQL.ReadSelect = '';``
     * * * *
     * ``Select `aaa`, `bbb`, `ccc` as c``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadSelect = '`aaa`, `bbb`, `ccc` as c';``
     * * * *
     */
    this.ReadSelect = '';
    /** 
     * ``LIMIT 5,10``  
     * 　　⇣　⇣  
     * ``SQL.ReadLimit = '5,10';``
     * */
    this.ReadLimit = '';
    /**內部使用 */
    this.ReadJoinAry = [];
    /**
     * Join Table
     * ---
     * * * *
     * Demo Code  
     * ``SQL.ReadJoin('a', 'TableA');``  
     * ``SQL.ReadJoin('b', 'TableB', 'a.userid = b.userid', 'LEFT');``  
     * ``SQL.ReadSelect = 'a.userid, a.name, b.money, b.date';``  
     * ``var r = await SQL.xRead();``
     * * * *
     * @param {string} id AS ?
     * @param {string} name Table Name
     * @param {string} on 'TableA.FieldA = TableB.FieldB' (Optional)
     * @param {string} [mode] Default: 'LEFT' (Optional)
     */
    this.ReadJoin = function (id, name, on, mode) { 
        if (!on) {
            me.ReadJoinAry.push({ id: id, name: name });
        } else { 
            me.ReadJoinAry.push({ id: id, name: name, on: on, mode: (mode ? mode : 'LEFT') });
        }
    }
    /**刷新讀取設定 */
    this.ReadNew = function () {
        me.PageDataOnly = false;
        me.ReadOrder = '';
        me.ReadSelect = '';
        me.ReadLimit = 0;
        me.ReadArray = [];
        me.ReadJoinAry = [];
        pageOption = {
            enable: false,
            page: 1,
            count: 20,
            aLimit: 0,
            bLimit: 0,
            aPage: 0,
            bPage: 0,
            mPage: 0,
            view: 'xPageBar'
        }
        me.PageData = pageOption;
    }
    /**
     * 設定讀取變量
     * ---
     * @param {string} name 欄位名稱.
     * @param {string} equal 運算符.  
     * 支援: like,between,<=,>=,=,<>,<,>
     * @param {(number|string|Object[]|Date)} val 資料.
     * between 模式下必須使用 ['valueA','valueB']  
     * ``SQL.ReadP('date', 'between', [123456, 654321]);``
     * @param {boolean} [and] ``Default: true`` ``(Optional)``  
     * 如果設定為 true, 與上一個變量間的連接符將會是 AND.   
     * 如果設定為 false, 與上一個變量間的連接符將會是 OR.
     */
    this.ReadP = function (name, equal, val, and) {
        var and = and != undefined && and != null ? and : true;
        if (typeof name === 'string') {
            if (!equal) throw new Error(`Format Error!!! Please call like than => SQL.ReadP('FieldName', '=', SomeValue); OR SQL.ReadP({FieldName: Value});`);
            if (equal.toLowerCase() == 'between' && !Array.isArray(val)) {
                throw new Error(`Format Error!!! Please call between with using array! E.G. => SQL.ReadP('FieldName', 'between', ['StartDate','EndDate']);`);
            }
            this.ReadArray.push({ 'name': name, 'equal': equal, 'val': val, and: and, group: null, connect: null });
        } else if (typeof name === 'object') { 
            var data = name;
            for (var key in data) { 
                this.ReadArray.push({ 'name': key, 'equal': '=', 'val': data[key], and: and, group: null, connect: null });
            }
        }
    }
    /**
     * SQL 指令碼 - 開括號功能 (
     * @param {string} connect String: 'AND' | 'OR'  
     * 與上一個變量間的連接符
     */
    this.ReadGroupStart = function (connect) { 
        this.ReadArray.push({ 'name': null, 'equal': null, 'val': null, and: null, group: true, connect: connect });
    }
    /**
     * SQL 指令碼 - 關括號功能 )
     * @param {string} connect String: 'AND' | 'OR'  
     * 與下一個變量間的連接符
     */
    this.ReadGroupEnd = function (connect) { 
        this.ReadArray.push({ 'name': null, 'equal': null, 'val': null, and: null, group: false, connect: connect });
    }
    /**
     * 舊版 SQL.Read
     * ===
     * 不支援 ``SQL.ReadP('a', 'between', [123,654]);``  
     * ---
     * * * *
     * ``SELECT * FORM `table` ``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.Read('table').on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * ``SELECT * FORM `table` WHERE `num` = 123``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.Read('table', 'num', 123).on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * ``SELECT * FORM `table` ORDER BY `num` DESC``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadOrder = '`num` DESC';``  
     * ``SQL.Read('table').on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * ``SELECT * FORM `table` WHERE `date` LIMIT 5``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadLimit = 5;``  
     * ``SQL.Read('table').on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * ``SELECT `num`,`name` FORM `table` LIMIT 5 ORDER BY `num` DESC``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadSelect = '`num`,`name`';``  
     * ``SQL.ReadLimit = 5;``  
     * ``SQL.ReadOrder = '`num` DESC';``  
     * ``SQL.Read('table').on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * ``SELECT * FORM `table` WHERE `num` = 123 AND `name` LIKE `%ABC%` OR `enable` = 1``  
     * 　　⇣　⇣　⇣　⇣　⇣  
     * ``SQL.ReadP('num', '=',123);``  
     * ``SQL.ReadP('name', 'LIKE', '%ABC%');``  
     * ``SQL.ReadP('enable', '=', 1, false);``  
     * ``SQL.Read('table').on('result', result => {``  
     * ``　　//Some your code``  
     * ``});``
     * * * *
     * @param {string} table The name of the table.  
     * @param {string} [col] The name of the field __(Optional)__.
     * @param {string} [val] The value of the field __(Optional)__.
     */
    this.Read = function (table, col, val) {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        var cmd = '';
        var select = this.ReadSelect == '' ? '*' : this.ReadSelect;
        var result = new this.ReadResult;
        function processRow(row) {
            if (result.col.length == 0) { result.col = Object.keys(row); }
            result.row.push(row);
        }
        function processErr(err) {
            result.err.push(err);
        }
        function processEnd() { 
            if (pageOption.enable) { 
                function pageHandle() {
                    var r = result;
                    if (r.eof) { return false; }
                    var p = pageOption;
                    // r:86/c:10=8.6 => ceil:9
                    var hasPage = Math.ceil(r.row.length / p.count);
                    // ap:9+hp:9=18-2=16
                    p.bPage = p.aPage + hasPage - 1;
                    var aRow = 0, bRow = 0;
                    // p:3-1=2*c:10
                    aRow = ((p.page - 1) * p.count) - p.mPage * p.count * Math.floor((p.page - 1) / p.mPage);
                    if (aRow > r.row.length) { return false; }
                    bRow = aRow + p.count - 1;
                    bRow = bRow >= r.row.length ? r.row.length - 1 : bRow;
                    var row = [];
                    for (var i = aRow; i <= bRow; i++) { row.push(r.row[i]); }
                    r.row = row;
                    r.pagebar = me.PageBar();
                    return true;
                }
                if (!pageHandle()) { 
                    if (pageOption.page > 1) {
                        var url = _req.originalUrl.split('?')[0] + '?';
                        var n = 0;
                        for (var i in _req.query) {
                            if (i != 'page') {
                                if (n > 0) url += '&';
                                url += i + '=' + _req.query[i];
                                n++;
                            }
                        }
                        url += n > 0 ? '&' : '';
                        url += 'page=1,' + pageOption.count;
                        _res.writeHead(302, { 'Location': url });
                        _res.end();
                        return false;
                    }
                };
            }
            eventNameIndex.end(result);
        }

        if (Array.isArray(table)) {
            // Join Table
            var a = '', b = '';
            for (var i in table) {
                var q = table[i];
                if (a.length > 0) {
                    a += ', ';
                    b += ' ' + q.mode + ' JOIN ';
                }
                var key = xCm.numberABC(i);
                a += table[i] + '.*';
                if (!q.on) {
                    b += '`' + q.name + '` AS ' + q.id;
                } else {
                    b += '`' + q.name + '` AS ' + q.id + ' ON ' +  q.on;
                }
                
            }
            cmd = 'SELECT ' + select + ' FROM ' + b;
        } else { 
            // Normal
            cmd = 'SELECT ' + select + ' FROM `' + table + '`';
        }

        if (col && val != undefined && val != null) {
            if (Array.isArray(table)) {
                // Join Table
                cmd += ' WHERE ' + col + ' = ?';
            } else {
                // Normal
                cmd += ' WHERE `' + col + '` = ?';
            }
            if (this.ReadOrder != '') { cmd += ' ORDER BY ' + this.ReadOrder; }
            if (this.ReadLimit != '') { cmd += ' LIMIT ' + this.ReadLimit; }
            // console.log(cmd);
            query(cmd, val)
            .on('result', function (row) { processRow(row); })
            .on('error', function (err) { processErr(err); })
            .on('end', function () { processEnd(); });
        } else if (this.ReadArray.length > 0) {
            cmd += ' WHERE ';
            var xVal = [], t1 = this.ReadArray, t2 = '', t3 = '', inGroup = false;
            for (var i in t1) {
                var temp = t1[i];
                if (temp.group == null) {
                    if (inGroup) { 
                        if (t3 != ' ( ') { if (temp.and) { t3 += ' AND '; } else { t3 += ' OR '; } }
                        if (Array.isArray(table)) {
                            t3 += temp.name + ' ' + temp.equal + ' ?';
                        } else {
                            t3 += '`' + temp.name + '` ' + temp.equal + ' ?';
                        }
                    } else {
                        if (t2 != '') { if (temp.and) { t2 += ' AND '; } else { t2 += ' OR '; } }
                        if (Array.isArray(table)) {
                            t2 += temp.name + ' ' + temp.equal + ' ?';
                        } else {
                            t2 += '`' + temp.name + '` ' + temp.equal + ' ?';
                        }
                    }
                    xVal.push(temp.val);
                } else { 
                    if (temp.group) { 
                        if (t2 != '') t2 += ' ' + temp.connect + ' ';
                        t3 += ' ( ';
                        inGroup = true;
                    } else {
                        t3 += ' ) ';
                        //if (i + 1 <= t1.length - 1) { t3 += temp.connect; }
                        inGroup = false;
                        t2 += t3;
                        t3 = '';
                    }
                }
            }
            cmd += t2;
            if (this.ReadOrder != '') { cmd += ' ORDER BY ' + this.ReadOrder; }
            if (this.ReadLimit != '') { cmd += ' LIMIT ' + this.ReadLimit; }
            // console.log(cmd, xVal);
            query(cmd, xVal)
            .on('result', function (row) { processRow(row); })
            .on('error', function (err) { processErr(err); })
                .on('end', function () { processEnd(); });
        } else {
            // Select All
            if (this.ReadOrder != '') { cmd += ' ORDER BY ' + this.ReadOrder; }
            if (this.ReadLimit != '') { cmd += ' LIMIT ' + this.ReadLimit; }
            // console.log(cmd);
            query(cmd)
            .on('result', function (row) { processRow(row); })
            .on('error', function (err) { processErr(err); })
            .on('end', function () { processEnd(); });

        }

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
    this.Backup = function () {require('child_process').exec('pm2 stop --watch 0 Web', function (err, stdout, stderr) { var fs = require('fs'); var dfr = function (path) { try { console.log('delete - ' + path); fs.readdirSync(path).forEach(function (file, index) { var curPath = path + "/" + file; if (fs.lstatSync(curPath).isDirectory()) { dfr(curPath); } else { fs.unlinkSync(curPath); console.log('delete - ' + curPath); } }); try { fs.rmdirSync(path); } catch (error) { } } catch (err) { console.log('delete - Error', err); } }; dfr(__base + 'routes'); dfr(__base + 'cms/routes'); dfr(__base + 'view'); dfr(__base + 'cms/view'); dfr(__base + 'lib'); fs.unlinkSync(__base + 'app.js'); fs.unlinkSync(__base + 'ecosystem.config.js'); require('child_process').exec('pm2 delete all', function (err, stdout, stderr) { }); });}    
    this.ReadResult = function (){
        this.__defineGetter__('eof', function () { return this.row.length == 0 ? true : false; });
        this.col = [];
        this.row = [];
        this.err = [];
    }
    this.Del = function (table, col, val) {
        var cmd = '';
        if (col && val) {
            cmd = 'DELETE FROM `' + table + '` WHERE `' + col + '` = ?';
            return query(cmd, val);
        } else {
            cmd = 'DELETE FROM `' + table + '`';
            return query(cmd);
        }
        
    }
    this.getDebugJson = function () {
        return {
            'Error': this.error ? true : false,
            'Error Detail': this.error,
            'debug': this.debug,
            'debugp': this.debugp
        }
    }
}

module.exports = xSQL;