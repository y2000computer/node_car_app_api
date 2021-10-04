var express = require('express');
var xSQL = require('../lib/xSQL');
var regex = require('../lib/regex');
var common = require('../lib/common');
var token = require('../lib/token');
var async = require('async');
var request = require('../lib/request');
var router = express.Router();
var c = 0;
var test = {
    list: {},
    add: function (id, person) {
        test.list[id] = person;
        test.list[id].timer = setInterval(function () {
            test.list[id].timeleft -= 1;
            if (test.list[id].timeleft <= 0) {
                clearInterval(test.list[id].timer);
                var SQL = new xSQL('test');
                SQL.Del('tbl_API', 'name', test.list[id].name);
                delete test.list[id];
            }
            console.log(test.list);
        }, 1000);
    }
}

function person(name, detail) {
    this.name = name;
    this.detail = detail;
    this.timeleft = 30
    this.timer = null;
    var SQL = new xSQL('test');
    SQL.Add('tbl_API', {name: name, detail: detail});
}

router.route('/oms/yacht-list')
    .post(function (req, res, next) {
        var c = new common.checker(req.body);
        c.add('grade_code', 'grade_code', regex.IsID, 'cust_yacht_gcode');
        c.add('grade_sub_code', 'grade_sub_code', regex.IsID, 'cust_yacht_gscode');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        var SQL = new xSQL('oms');
        var q = [{
            id: 'reg', name: 'tbl_transport_registration'
        }, {
            id: 'ya', mode: 'LEFT',
            name: 'tbl_transport_registration_yacht',
            on: 'reg.registration_id = ya.registration_id'
        }, {
            id: 'mm', mode: 'LEFT',
            name: 'tbl_transport_model_master',
            on: 'reg.model_code = mm.model_code'
        }, {
            id: 'gsm', mode: 'LEFT',
            name: 'tbl_transport_grade_sub_master',
            on: 'mm.grade_sub_code = gsm.grade_sub_code'
        }, {
            id: 'gm', mode: 'LEFT',
            name: 'tbl_transport_grade_master',
            on: 'gsm.grade_code = gm.grade_code'
        }];
        SQL.ReadP('gsm.grade_code', '=', c.data.grade_code);
        SQL.ReadP('mm.grade_sub_code', '=', c.data.grade_sub_code);
        SQL.ReadP('reg.ready_for_online', '=', 1);
        SQL.ReadP('reg.ready_for_online', '=', 1);
        SQL.ReadSelect = [
            'reg.registration_id',
            'reg.model_code', 'mm.brand_code',
            'ya.yacht_name_eng', 'ya.yacht_name_chn',
            'gsm.sub_grade_name_eng', 'gsm.sub_grade_name_chn',
        ].join(', ');
        //SQL.ReadSelect = '';
        SQL.Read(q).on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            async.eachSeries(r.row, function (rr, cb) {
                SQL.ReadNew();
                SQL.ReadP('registration_id', '=', rr.registration_id);
                SQL.ReadP('upload_code', 'LIKE', 'HK_YACHT%');
                SQL.ReadP('status', '=', 1);
                SQL.Read('tbl_transport_registration_upload').on('end', function (r2) {
                    if (!rr.main_picture) { rr.main_picture = ''; }
                    if (!rr.sub_picture) { rr.sub_picture = []; }
                    if (!r2.eof) {
                        for (var i in r2.row) {
                            var xr = r2.row[i];
                            if (xr.main_picture == '1') {
                                rr.main_picture = 'image/' + xr.path + xr.filename;
                            } else {
                                rr.sub_picture.push({
                                    view: xr.section_view,
                                    path: 'image/' + xr.path + xr.filename
                                });
                            }
                        }
                    }
                    cb(null, true);
                });
            }, function (err, results) {
                if (err) {
                    next(err);
                } else {
                    res.json({ list: r.row });
                }
            });
        });
    });

router.route('/oms/yacht-detail')
    .post(function (req, res, next) {
        var c = new common.checker(req.body);
        c.add('registration_id', 'registration_id', regex.IsNum, 'cust_yacht_reg_id');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        var SQL = new xSQL('oms');
        var q = [{
            id: 'reg', name: 'tbl_transport_registration'
        }, {
            id: 'ya', mode: 'LEFT',
            name: 'tbl_transport_registration_yacht',
            on: 'reg.registration_id = ya.registration_id'
        }, {
            id: 'mm', mode: 'LEFT',
            name: 'tbl_transport_model_master',
            on: 'reg.model_code = mm.model_code'
        }, {
            id: 'gsm', mode: 'LEFT',
            name: 'tbl_transport_grade_sub_master',
            on: 'mm.grade_sub_code = gsm.grade_sub_code'
        }, {
            id: 'gm', mode: 'LEFT',
            name: 'tbl_transport_grade_master',
            on: 'gsm.grade_code = gm.grade_code'
        }];
        SQL.ReadP('reg.registration_id', '=', c.data.registration_id);
        SQL.ReadSelect = [
            'reg.registration_id',
            'reg.model_code', 'mm.brand_code', 'gsm.grade_code', 'mm.grade_sub_code',
            'ya.yacht_name_eng', 'ya.yacht_name_chn',
            'gsm.sub_grade_name_eng', 'gsm.sub_grade_name_chn',
            'ya.size_desc', 'ya.size_in_meter', 'reg.year_manufacture',
            'reg.colour', 'reg.car_seating_capacity',
            'ya.onboard_guests', 'ya.onboard_crews', 'gsm.max_passenger',
            'reg.ready_for_online', 'gsm.service_ride_is', 'reg.status',
            'ya.desc_eng', 'ya.desc_chn',
            'ya.reference_url_eng', 'ya.reference_url_chn'
        ].join(', ');
        SQL.Read(q).on('end', function (r) {
            if (r.eof) { res.json({ error: ['cust_yacht_reg_id'] }); return; }
            async.eachSeries(r.row, function (rr, cb) {
                SQL.ReadNew();
                SQL.ReadP('registration_id', '=', rr.registration_id);
                SQL.ReadP('upload_code', 'LIKE', 'HK_YACHT%');
                SQL.ReadP('status', '=', 1);
                SQL.Read('tbl_transport_registration_upload').on('end', function (r2) {
                    if (!rr.main_picture) { rr.main_picture = ''; }
                    if (!rr.sub_picture) { rr.sub_picture = []; }
                    if (!r2.eof) {
                        for (var i in r2.row) {
                            var xr = r2.row[i];
                            if (xr.main_picture == '1') {
                                rr.main_picture = 'image/' + xr.path + xr.filename;
                            } else {
                                rr.sub_picture.push({
                                    view: xr.section_view,
                                    path: 'image/' + xr.path + xr.filename
                                });
                            }
                        }
                    }
                    cb(null, true);
                });
            }, function (err, results) {
                if (err) {
                    next(err);
                } else {
                    res.json(r.row[0]);
                }
            });
        });
    });

router.route('/oms/transport-grade')
    .post(function (req, res) {
        var sri = req.body.service_ride_is ? true : false;
        var SQL = new xSQL('oms');
        SQL.ReadOrder = '`sorting`';
        SQL.Read('tbl_transport_grade_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            var list = [];
            var item = [];
            for (var i in r.row) { if (r.row[i].status == '1') { item.push(r.row[i]); } }
            async.eachSeries(item,
                function (obj, cb) {
                    SQL.Read('tbl_transport_grade_sub_master', 'grade_code', obj.grade_code).on('end', function (r) {
                        if (r.eof) { obj.sub = null; list.push(obj); cb(null, true); return; }
                        obj.sub = [];
                        for (var i in r.row) {
                            if (r.row[i].status == '1') {
                                if (sri) {
                                    if (r.row[i].service_ride_is == '1') { obj.sub.push(r.row[i]); }
                                } else {
                                    obj.sub.push(r.row[i]);
                                }
                            }
                        }
                        list.push(obj);
                        cb(null, true);
                    });
                },
                function (err, results) {
                    res.json(list);
                });
        });
    });

router.route('/oms/station-list')
    .get(function (req, res) {
        var SQL = new xSQL('oms');
        SQL.Read('tbl_oms_geo_station_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            res.json({list: r.row});
        });
    });

router.route('/oms/test')
    .post(function (req, res) { 
        request.GetGeoInfo(req.body.lat, req.body.lng, function (r) { 
            res.json(r);
        });
    });

router.route('/oms/fee-standard')
    .post(function (req, res) {
        var SQL = new xSQL('oms');
        var j = req.body;
        var c = new common.checker(j);
        c.add('grade_sub_code', 'grade_sub_code', regex.IsID, 'oms_sfee_gscode');
        c.add('region_code', 'region_code', regex.IsID, 'oms_sfee_rcode');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        SQL.ReadNew();
        SQL.ReadP('grade_sub_code', '=', j.grade_sub_code);
        SQL.ReadP('region_code', '=', j.region_code);
        SQL.Read('tbl_oms_standard_fee_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            res.json({list: r.row});
        });
    });

router.route('/oms/fee-peak-hour')
    .get(function (req, res) {
        var SQL = new xSQL('oms');
        var q = [{
            id: 'fph', name: 'tbl_oms_standard_fee_peak_hour_master'
        }, {
            id: 'reg', mode: 'LEFT',
            name: 'tbl_oms_geo_region_master',
            on: 'fph.region_code = reg.region_code'
        }];
        SQL.Read(q).on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            res.json({list: r.row});
        });
    });

router.route('/setting/error-list')
    .get(function (req, res) {
        var SQL = new xSQL('oms');
        SQL.ReadOrder = '`category`, `code`';
        SQL.Read('tbl_global_response_code_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            var list = [];
            for (var i in r.row) {
                var row = r.row[i];
                list.push({
                    category: row.category,
                    code: row.code,
                    msg_eng: row.msg_eng,
                    msg_chi: row.msg_chi,
                });
            }
            res.json({ list: list });
        });
    });

router.route('/setting/middle-list')
    .get(function (req, res) {
        res.end();
    });

router.route('/setting/language-list')
    .get(function (req, res) {
        var SQL = new xSQL('oms');
        SQL.Read('tbl_global_language_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            var list = [];
            for (var i in r.row) {
                var row = r.row[i];
                list.push({
                    language_code: row.language_code,
                    language_name: row.language_name,
                    country_code: row.country_code
                });
            }
            res.json({ list: list });
        });
    });

router.route('/setting/mobile-country-list')
    .get(function (req, res) {
        var SQL = new xSQL('oms');
        SQL.ReadOrder = '`default_is` DESC';
        SQL.Read('tbl_global_mobile_country_master').on('end', function (r) {
            if (r.eof) { res.json({ list: null }); return; }
            var list = [];
            for (var i in r.row) {
                var row = r.row[i];
                list.push({
                    code: row.mobile_country_code,
                    name: row.mobile_country_name,
                    default: row.default_is == '0' ? false : true
                });
            }
            res.json({ list: list });
        });
    });

router.route('/token')
    .post(function (req, res) {
        if (req.token.result) {
            var data = { last_modify_datetime: new Date() }
            if (req.body.apps_version) { data.apps_version = req.body.apps_version; }
            if (req.body.mobile_brand) { data.mobile_brand = req.body.mobile_brand; }
            if (req.body.mobile_os) { data.mobile_os = req.body.mobile_os; }
            if (req.body.mobile_model) { data.mobile_model = req.body.mobile_model; }
            var SQL = new xSQL('oms');
            SQL.Edit('tbl_global_token_map', 'mobile_token', req.body.token, data);
        }
        res.json(req.token);
        
    })
    .put(function (req, res) {
        var field = 'user_type,apps_version,mobile_brand,mobile_os,mobile_model'.split(',');
        var err = false;
        for (var f in field) { if (!req.body[field[f]]) { throw new Error('Input Error'); } }
        if (!regex.IsUserType(req.body.user_type)) { throw new Error('Input Error'); }
        var rnd = common.getTimehash();
        var SQL = new xSQL('oms');
        var count = 0;
        (function add() {
            var val = {
                mobile_token: rnd,
                user_type: req.body.user_type,
                apps_version: req.body.apps_version,
                mobile_brand: req.body.mobile_brand,
                mobile_os: req.body.mobile_os,
                mobile_model: req.body.mobile_model,
                create_datetime: new Date(),
                last_modify_datetime: new Date()
            }
            SQL.Add('tbl_global_token_map', val)
                .on('result', function (d) {
                    res.json({ token: rnd, result: true });
                })
                .on('error', function (err) {
                    count++;
                    if (count < 50) { add(); } else { new Error('Too Many Try Error'); }
                });
        })();
    });

router.route('/test')
    .get(function (req, res) {
        c++;
        var xc = c.toString();
        var xxc = xc + xc + xc + xc + xc + xc;

        var p = new person('test' + xxc, 'This is a test' + xxc);
        test.add(xxc, p);
        res.send('Click Counter: ' + c + '<br>Object Counter: ' + Object.keys(test.list).length + '<br>');
        /*for (var i in test.list) {
            test.list[i].timeleft = 10
        }*/
        
        console.log(test);
    })
    .delete(function (req, res) {
        var SQL = new xSQL('test');
        SQL.Del('tbl_API')
            .on('result', function (d) {
                res.send('delete Pass');
                console.error('delete Pass');
                console.log(d);
            })
            .on('error', function (err) {
                res.send('delete Error');
                console.error('delete Error');
                console.log(err);
            });
        //res.end();
    })
    .put(function (req, res) {
        var SQL = new xSQL('test');
        var i = 0;
        while (i++ < 1000) {
            var data = {
                'name': 'A test' + i,
                'detail': 'A This is a test' + i + '.'
            }
            SQL.Add('tbl_API', data)
                .on('result', function (d) {
                    //res.send('Add Pass');
                    console.error('Add Pass');
                    console.log(d);
                })
                .on('error', function (err) {
                    //res.send('Add Error');
                    console.error('Add Error');
                    console.log(err);
                });
        }
        res.send(SQL.debug + '<br>' + SQL.debugp);
    })
    .post(function (req, res) {
        var SQL = new xSQL('test');
        SQL.ReadLimit = 5;
        async.series([
            function (callback) {
                SQL.Read('tbl_API').on('end', function (d) {
                    console.log('Read1');
                    console.log(d);
                    callback(null, d);
                });
            },
            function (callback) {
                SQL.Read('tbl_API', 'num', 22401).on('end', function (d) {
                    console.log('Read2');
                    console.log(d);
                    callback(null, d);
                });
            },
            function (callback) {
                SQL.ReadP('num', 'LIKE', '22%');
                SQL.Read('tbl_API').on('end', function (d) {
                    console.log('Read3');
                    console.log(d);
                    callback(null, d);
                });
            }
        ], function (err, results) {
            res.json([err, results]);
        });
    })
    .patch(function (req, res) {
        var SQL = new xSQL('test');
        var d = {
            name: 'B test7777',
            detail: 'B This is a test7777.'
        }
        SQL.Edit('tbl_API', 'num', '23415', d)
            .on('result', function (d) {
                console.error('Edit Pass');
                console.log(d);
            })
            .on('error', function (err) {
                res.send('Edit1 Error');
                console.error('Edit Error');
                console.log(err);
            });
        d = {
            name: 'C tes8888',
            detail: 'C This is a tes8888.'
        }
        SQL.Edit('tbl_API', d)
            .on('result', function (d) {
                console.error('Edit Pass');
                console.log(d);
            })
            .on('error', function (err) {
                res.send('Edit2 Error');
                console.error('Edit Error');
                console.log(err);
            });
        res.end();
    });

module.exports = router;