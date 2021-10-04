var express = require('express');
var regex = require('../lib/regex');
var common = require('../lib/common');
var xSQL = require('../lib/xSQL');
var token = require('../lib/token');
var request = require('../lib/request');
var router = express.Router();
var async = require('async');

var test_geo = {
            lat: 22.4629798,
            lng: 114.0071615
        }

router.route('/data/test')
    .get(function (req, res, next) {
        var tmp = {
            dir: common.RndArray([0, 45, 90, 135, 180, 225, 270, 315]),
            loc: {
                lat: common.RndFloat(22.231507543653088, 22.485517137858224),
                lng: common.RndFloat(113.9320054303223, 114.29592754946293)
            }
        }
        console.log(tmp);
        res.json(tmp);
        
    })
    .post(function (req, res, next) {
        console.log(request.gpsSimulat_list[1]);
        res.json({
            test_geo: test_geo
        });
    })
    .put(function (req, res, next) {
        var a = {
            lat: 22.3730339,
            lng: 114.1083923
        }
        var b = {
            lat: 22.3404409,
            lng: 114.1796013
        }
        var s = new request.gpsSimulator(1, a, b, test_geo, 20, 10000);
        setTimeout(function () { 
            var a = {
            lat: 30.3730339,
            lng: 119.1083923
        }
        var b = {
            lat: 40.3404409,
            lng: 113.1796013
        }
            var n = new request.gpsSimulator(1, a, b, test_geo, 100, 10000);
        },5000);
        res.json({ result: true });
    })
    .patch(function (req, res, next) { 
        
    });

router.route('/request/estimate-fee')
    .post(function (req, res, next) { 
        res.json({
            currency_code: 'HK$',
            standard_fee_start: 10.00,
            standard_fee_per_km: 18.00,
            standard_fee_per_min: 2.20,
            standard_fee_min_charge: 50.00,
            percent_factor: 1.5,
            estimate_total_ride_km: 5,
            estimate_total_ride_min: 6,
            estimate_fee_ride_basic: 10.00,
            estimate_fee_ride_km: 90.00,
            estimate_fee_ride_min: 13.20,
            estimate_fee_ride_total: 103.20,
            estimate_fee_tunnel: 20.00,
            estimate_fee_total: 123.20,
            estimate_fee_range_from: null,
            estimate_fee_range_to: null
        });
    });
router.route('/request/change-location')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('type', 'type', function (str) { return regex.CheckArray(str, ['driver', 'yacht']); }, 'req_request_type');
        c.add('drop', 'drop', {
            eng: regex.IsText, chn: regex.IsText,
            lat: regex.IsLat, lng: regex.IsLng
        }, 'req_drop_format');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }

        var request_obj = request.GetObj(req);
        if (!request_obj) { res.json({ result: false, error: ['req_request_null'] }); return; }

        request_obj.drop = j.drop;
        res.json({
            result: true
        });
    });
router.route('/request/change-profile')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('type', 'type', function (str) { return regex.CheckArray(str, ['driver', 'yacht']); }, 'req_request_type');
        c.add('profile_id', 'profile_id', regex.IsNum, 'req_profile_id');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }

        var request_obj = request.GetObj(req);
        if (!request_obj) { res.json({ result: false, error: ['req_request_null'] }); return; }

        request_obj.cust.profile_id = j.profile_id;
        res.json({
            result: true
        });

    });
router.route('/request/before')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('grade_sub_code', 'grade_sub_code', regex.IsID, 'req_gscode');
        c.add('pickup', 'pickup', {
            eng: regex.IsText, chn: regex.IsText,
            lat: regex.IsLat, lng: regex.IsLng
        }, 'req_pickup_format');
        c.add('gapi', 'gapi', {
            km: regex.IsFloat, minute: regex.IsFloat,
        }, 'req_gapi_format', false);

        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        var glist = {
            HK_CAR_X_SEAT_4: [],
            HK_CAR_BLACK_SEAT_4: [],
            HK_CAR_BLACK_SEAT_7: []
        };
        
        for (var g in glist) {
            for (var i = 0; i < common.RndInt(1,5); i++) {
                glist[g].push({
                    direction: common.RndArray([0, 45, 90, 135, 180, 225, 270, 315]),
                    lat: common.RndFloat(j.pickup.lat - 0.00465, j.pickup.lat + 0.00465),
                    lng: common.RndFloat(j.pickup.lng - 0.00465, j.pickup.lng + 0.00465)
                });
            }
        }
        if (c.data.gapi) {
            request.GetFee(j.grade_sub_code, j.pickup, j.gapi, function (err, r) {
                res.json({
                    arrive_min: common.RndInt(1, 5),
                    fee: r.fee,
                    driver_list: glist
                });
            });
        } else { 
            res.json({
                    arrive_min: common.RndInt(1, 5),
                    driver_list: glist
                });
        }
        
    });
router.route('/request/start')
    .post(function (req, res, next) {
        request.Add(req,res, next);
        /*res.json({
            request_id: 65535,
            currency_code: 'HK$',
            standard_fee_start: 10.00,
            standard_fee_per_km: 18.00,
            standard_fee_per_min: 2.20,
            standard_fee_min_charge: 50.00,
            percent_factor: 1.5,
            estimate_total_ride_km: 5,
            estimate_total_ride_min: 6,
            estimate_fee_ride_basic: 10.00,
            estimate_fee_ride_km: 90.00,
            estimate_fee_ride_min: 13.20,
            estimate_fee_ride_total: 103.20,
            estimate_fee_tunnel: 20.00,
            estimate_fee_total: 123.20,
            estimate_fee_range_from: null,
            estimate_fee_range_to: null
        });*/
    })
    .put(function (req, res, next) {
        res.json({
            result: true
        });
    });
router.route('/request/status')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        if (request.items[req.user.user_id]) {
            console.log(request.items[req.user.user_id].ToJson());
            res.json(request.items[req.user.user_id].ToJson());
        } else { 
            res.json({
                driver: null,
                yacht: null
            });
        }
    });
router.route('/request/assess')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('type', 'type', function (str) { return regex.CheckArray(str, ['driver', 'yacht']); }, 'req_request_type');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }

        var request_obj = request.GetObj(req);
        if (!request_obj) { res.json({ result: false, error: ['req_request_null'] }); return; }

        request_obj.End();
        delete request.items[req.user.user_id];
        res.json({ result: true });
    });
router.route('/request/cancel')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('type', 'type', function (str) { return regex.CheckArray(str, ['driver', 'yacht']); }, 'req_request_type');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        
        var request_obj = request.GetObj(req);
        if (!request_obj) { res.json({ result: false, error: ['req_request_null'] }); return; }

        request_obj.End();
        delete request.items[req.user.user_id];
        res.json({ result: true });
    });

router.route('/request/driver-info')
    .post(function (req, res, next) { 
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('type', 'type', function (str) { return regex.CheckArray(str, ['driver', 'yacht']); }, 'req_request_type');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        
        var request_obj = request.GetObj(req);
        if (!request_obj) { res.json({ result: false, error: ['req_request_null'] }); return; }
        if (!request_obj.driver) { res.json({ result: false, error: ['req_request_driver_null'] }); return; }
        
        var SQL = new xSQL('oms');
    });

router.route('/request/control/reset')
    .get(function (req, res, next) {
        for (var i in request.items) {
            if (request.items[i].driver) { request.items[i].driver.End(); }
            if (request.items[i].yacht) { request.items[i].yacht.End(); }
        }
        request.items = {};
        res.json({ result: true });
    });

router.route('/data/profile')
    .get(function (req, res, next) {
        var SQL = new xSQL('oms');
        SQL.Read('tbl_cust_profile_master').on('end', function (r) {
            if (!r.eof) {
                res.json({ list: r.row });
            } else {
                res.json({ list: null });
            }
        });
    })
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        req.user.profile.update(function () {
            res.json(req.user.profile.list);
        });
    })
    .put(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        req.user.profile.update(function () {
            if (req.user.profile.list.CORPORATION) {
                res.json({ result: false, error: ['cust_profile_created'] }); return;
            } else {
                var j = req.body;
                var c = new common.checker(j);
                c.add('email', 'email', regex.IsEmail, 'cust_profile_email');
                c.add('card_id', 'card_id', regex.IsNum, 'cust_credit_id');
                c.add('weekly', 'weekly', regex.IsBoolean, 'cust_profile_weekly');
                c.add('monthly', 'monthly', regex.IsBoolean, 'cust_profile_monthly');
                if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
                if (!req.user.card.list[j.card_id]) { res.json({ result: false, error: ['cust_credit_id_null'] }); return; }
                req.user.profile.create(j.email, j.card_id, j.weekly, j.monthly, function (result) {
                    res.json(result);
                });
            }
        });
    })
    .patch(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        req.user.profile.update(function () {
            if (!req.user.profile.list.CORPORATION) {
                res.json({ result: false, error: ['cust_profile_null'] }); return;
            } else {
                var j = req.body;
                var c = new common.checker(j);
                c.add('email', 'email', regex.IsEmail, 'cust_profile_email');
                c.add('card_id', 'card_id', regex.IsNum, 'cust_credit_id');
                c.add('weekly', 'weekly', regex.IsBoolean, 'cust_profile_weekly');
                c.add('monthly', 'monthly', regex.IsBoolean, 'cust_profile_monthly');
                if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
                if (!req.user.card.list[j.card_id]) { res.json({ result: false, error: ['cust_credit_id_null'] }); return; }
                req.user.profile.list.CORPORATION = {
                    email: j.email,
                    weekly: j.weekly == '1' ? true : false,
                    monthly: j.monthly == '1' ? true : false,
                    card: req.user.card.CardFilter(j.card_id, req.user.card.list[j.card_id])
                }
                req.user.profile.save(function (result) {
                    res.json(result);
                });
            }
        });
    })
    .delete(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        req.user.profile.update(function () {
            if (!req.user.profile.list.CORPORATION) {
                res.json({ result: false, error: ['cust_profile_null'] }); return;
            } else {
                req.user.profile.delete(function (result) {
                    res.json(result);
                });
            }
        });
        
    });



router.route('/data/credit_card')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        req.user.card.update(function () {
            res.json({ "list": req.user.card.json() });
        });
    })
    .put(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('brand', 'brand', regex.IsCardBrand, 'cust_credit_brand');
        c.add('number', 'number', regex.IsCreditCard, 'cust_credit_card');
        c.add('name', 'name', regex.IsFullName, 'cust_credit_name');
        c.add('expiry', 'expiry', regex.IsExpiry, 'cust_credit_expiry');
        c.add('security_no', 'security_no', regex.IsNum, 'cust_credit_snum');
        c.add('default', 'default', regex.IsBoolean, 'cust_credit_default');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        
        req.user.card.add(j.brand, j.number, j.name, j.expiry, j.security_no, j.default, function (r) {
            res.json(r);
        });
    })
    .patch(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        var j = req.body;
        var c = new common.checker(j);
        c.add('id', 'id', regex.IsNum, 'cust_credit_id');
        c.add('brand', 'brand', regex.IsCardBrand, 'cust_credit_brand');
      //  c.add('number', 'number', regex.IsCreditCard, 'cust_credit_card');
        c.add('name', 'name', regex.IsFullName, 'cust_credit_name');
        c.add('expiry', 'expiry', regex.IsExpiry, 'cust_credit_expiry');
        c.add('security_no', 'security_no', regex.IsNum, 'cust_credit_snum');
        c.add('default', 'default', regex.IsBoolean, 'cust_credit_default');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        if (c.count > 0) {
            req.user.card.update(function () {
                if (!req.user.card.list[c.data.id]) {res.json({ result: false, error: ['cust_credit_id_null'] }); return; }
                //req.user.card.list[c.data.id].def = c.data.default;
                req.user.card.list[c.data.id].brand = c.data.brand;
               // req.user.card.list[c.data.id].cnum = c.data.number;
                req.user.card.list[c.data.id].name = c.data.name;
                req.user.card.list[c.data.id].exp = c.data.expiry;
                req.user.card.list[c.data.id].snum = c.data.security_no;
                if (j.default) { req.user.card.default(c.data.id); }
                req.user.card.save(function (result) {
                    res.json(result);
                });
            });
        } else {
            next(new Error('Input Error')); return;
        }
    })
    .delete(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        var j = req.body;
        var c = new common.checker(j);
        c.add('id', 'id', regex.IsNum, 'cust_credit_id');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        if (c.data.id) {
            req.user.card.update(function () { 
                if (list.length <= 1) { res.json({ result: false, error: ['cust_credit_min'] }); return; }
                req.user.card.del(c.data.id, function (result) { 
                    res.json(result);
                });
            });
            
        } else { 
            next(new Error('Input Error')); return;
        }
    });


router.route('/login')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (req.token.login) { next(new Error('Token had login')); return; }
        var SQL = new xSQL('oms');
        var j = req.body;
        var err = [];

        if (!j.facebook_id) { err.push('cust_reg_fb'); }
        if (!regex.IsNum(j.facebook_id)) { err.push('cust_reg_fb'); }
    
        var user_id = 0;
        async.series([
            // Check Account
            function (callback) {
                SQL.ReadNew();
                SQL.ReadP('facebook_id', '=', j.facebook_id);
                SQL.Read('tbl_cust_user_info').on('end', function (r) {
                    if (!r.eof) { user_id = r.row[0].cust_user_id; callback(null, true); } else { callback('cust_login_fail', false); }
                });
            },
            // Write Token Mapping
            function (callback) {
                if (user_id != 0) {
                    SQL.Read('tbl_global_token_map', 'mobile_token', j.token).on('end', function (r) {
                        if (r.eof) { next(new Error('Wrong Token')); return; }
                        var edit_data = { user_id: user_id }
                        SQL.Edit('tbl_global_token_map', 'mobile_token', j.token, edit_data)
                            .on('result', function (result) {
                                token.list[j.token].update();
                                callback(null, true);
                            }).on('error', function (err) {
                                next(err); return;
                            });
                    });
                } else { callback('cust_login_fail', false); }
            }
        ], function (err, results) {
            res.json({ result: !err ? true : false, error: err ? [err] : null });
        });
    });

router.route('/logout')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token had not login!")); return; }
        var SQL = new xSQL('oms');
        var j = req.body;
        var edit_data = { user_id: 0 }
        SQL.Edit('tbl_global_token_map', 'mobile_token', j.token, edit_data)
            .on('result', function (result) {
                token.list[j.token].update();
                res.json({ result: true });
            }).on('error', function (err) {
                next(err); return;
            });
    });

router.route('/registration')
    .put(function (req, res, next) {

        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (req.token.login) { next(new Error('Token had login')); return; }
        var SQL = new xSQL('oms');
        var j = req.body;
        var err = [];

        if (!j.email) { err.push('cust_reg_email'); }
        if (!regex.IsEmail(j.email)) { err.push('cust_reg_email'); }
        /*if (!j.password) { err.push('cust_registration_002'); }
        if (!regex.IsPassword(j.password)) { err.push('cust_registration_002'); }*/
        if (!j.facebook_id) { err.push('cust_reg_fb'); }
        if (!regex.IsNum(j.facebook_id)) { err.push('cust_reg_fb'); }
        if (!j.last_name) { err.push('cust_reg_lastname'); }
        if (!regex.IsNickName(j.last_name)) { err.push('cust_reg_lastname'); }
        if (!j.first_name) { err.push('cust_reg_firstname'); }
        if (!regex.IsNickName(j.first_name)) { err.push('cust_reg_firstname'); }
        if (!j.mobile_country_code) { err.push('cust_reg_mcc'); }
        if (!regex.IsNum(j.mobile_country_code)) { err.push('cust_reg_mcc'); }
        if (!j.mobile) { err.push('cust_reg_mobile'); }
        if (!regex.IsNum(j.mobile)) { err.push('cust_reg_mobile'); }
        if (!j.language_code) { err.push('cust_reg_langcode'); }
        if (err.length > 0) { res.json({ result: false, error_code: err }); return; }

        var user_id = 0;
    
        async.series([
            // Check Email EOF
            function (callback) {
                SQL.Read('tbl_cust_user_info', 'email', j.email).on('end', function (r) {
                    if (!r.eof) { callback('cust_reg_email_repeat', false); } else { callback(null, true); }
                });
            },
            // Check Facebook EOF
            function (callback) {
                SQL.Read('tbl_cust_user_info', 'facebook_id', j.facebook_id).on('end', function (r) {
                    if (!r.eof) { callback('cust_reg_fb_repeat', false); } else { callback(null, true); }
                });
            },
            // Add Cust to DB
            function (callback) {
                var user_data = {
                    mobile_token: j.token,
                    email: j.email,
                    facebook_id: j.facebook_id,
                    //password: j.password,
                    last_name: j.last_name,
                    first_name: j.first_name,
                    language_code: j.language_code,
                    grade_sub_code: 'NORMAL_RESERVED',
                    create_datetime: new Date(),
                    last_modify_datetime: new Date()
                }
                SQL.Add('tbl_cust_user_info', user_data)
                    .on('result', function () {
                        callback(null, true);
                    })
                    .on('error', function (err) {
                        next(err); return;
                    });
            },
            // Create a token mapping
            function (callback) {
                SQL.Read('tbl_cust_user_info', 'mobile_token', j.token).on('end', function (r) {
                    if (r.eof) { next(err); return; }
                    user_id = r.row[0].cust_user_id;
                    var edit_data = { user_id: user_id }
                    SQL.Edit('tbl_global_token_map', 'mobile_token', j.token, edit_data)
                        .on('result', function (result) {
                            token.list[j.token].update();
                            callback(null, true);
                        }).on('error', function (err) {
                            next(err); return;
                        });
                });
            },
            // Add the mobile number to DB
            function (callback) {
                var mobile_data = {
                    cust_user_id: user_id,
                    mobile: j.mobile,
                    mobile_country: j.mobile_country_code,
                    create_datetime: new Date(),
                    last_modify_datetime: new Date()
                }
                SQL.Add('tbl_cust_mobile', mobile_data)
                    .on('result', function (result) {
                        callback(null, true);
                    }).on('error', function (err) {
                        next(err); return;
                    });
            }
        ], function (err, results) {
            res.json({ result: !err ? true : false, error_code: err ? [err] : null });
        });
        return;
    });

router.route('/data/basic')    
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        req.user.ToJson(function (json) { res.json(json); });
        
    })
    .patch(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        var SQL = new xSQL('oms');
        var j = req.body;
        var c = new common.checker(j);
        c.add('last_name', 'last_name', regex.IsStr, 'cust_reg_lastname');
        c.add('first_name', 'first_name', regex.IsStr, 'cust_reg_firstname');
        c.add('email', 'email', regex.IsEmail, 'cust_reg_email');
        c.add('language_code', 'language_code', regex.IsID, 'cust_reg_langcode');
        c.add('mobile_country_code', 'mobile_country_code', regex.IsNum, 'cust_reg_mcc');
        c.add('mobile', 'mobile', regex.IsNum, 'cust_reg_mobile');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        if (c.count > 0) {
            req.user.ToJson(function (json) {
                var task = [
                    function (cb) {
                        var data = {
                            last_name: c.data.last_name,
                            first_name: c.data.first_name,
                            email: c.data.email,
                            language_code: c.data.language_code
                        }
                        SQL.Edit('tbl_cust_user_info', 'cust_user_id', req.user.user_id, data)
                            .on('result', function () {
                                if (cb) { cb(null, true); }
                            }).on('error', function (err) {
                                if (cb) { cb(err, false); }
                            });
                    },
                    function (cb) {
                        if (!json.mobile_id) { if (cb) { cb(null, true); } return; }
                        if (!req.user.mobile.list[json.mobile_id]) { if (cb) { cb(null, true); } return; }
                        req.user.mobile.list[json.mobile_id].code = c.data.mobile_country_code;
                        req.user.mobile.list[json.mobile_id].number = c.data.mobile;
                        req.user.mobile.save(function (result) { 
                            if (cb) { cb(result.error, result.result); }
                        });
                    }
                ];
                async.series(task, function (err, results) {
                    if (err) { res.json({ result: !err ? true : false, error: err ? [err] : null }); return; }
                    token.list[j.token].update(function () {
                        res.json({ result: true, error: null });
                    });
                });
            });
            
            
        } else {
            next(new Error('Input Error')); return;
        }
    });

/*router.route('/data/mobile')
    .post(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        req.user.mobile.update(function () {
            res.json({ "list": req.user.mobile.json() });
        });
    })
    .put(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }

        var j = req.body;
        var c = new common.checker(j);
        c.add('code', 'code', regex.IsNum, 'cust_mobile_code');
        c.add('number', 'number', regex.IsNum, 'cust_mobile_number');
        c.add('default', 'default', regex.IsBoolean, 'cust_mobile_default');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        
        req.user.mobile.add(req.user.user_id, j.code, j.number, j.default, function (r) {
            if (!r.result) {
                next(r.error);
            } else {
                res.json(r);
            }
        });
    })
    .patch(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        var j = req.body;
        var c = new common.checker(j);
        c.add('id', 'id', regex.IsNum, 'cust_mobile_id');
        c.add('code', 'code', regex.IsStr, 'cust_mobile_code', false);
        c.add('number', 'number', regex.IsStr, 'cust_mobile_number', false);
        c.add('default', 'default', regex.IsBoolean, 'cust_mobile_default', false);
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        if (c.count > 1) {
            req.user.mobile.update(function () {
                if (!req.user.mobile.list[c.data.id]) {next(new Error('mobile id null')); return; }
                if (c.data.code) { req.user.mobile.list[c.data.id].code = c.data.code; }
                if (c.data.number) { req.user.mobile.list[c.data.id].number = c.data.number; }
                if (c.data.default) { req.user.mobile.list[c.data.id].def = c.data.default; req.user.mobile.default(c.data.id); }
                req.user.mobile.save(function (result) {
                    res.json(result);
                });
            });
        } else {
            next(new Error('Input Error')); return;
        }
    })
    .delete(function (req, res, next) {
        if (!req.token.result) { next(new Error('Token Error')); return; }
        if (!req.token.login) { next(new Error("Token hans't login")); return; }
        var j = req.body;
        var c = new common.checker(j);
        c.add('id', 'id', regex.IsNum, 'cust_mobile_id');
        if (c.err.length > 0) { res.json({ result: false, error: c.err }); return; }
        if (c.data.id) {
            req.user.mobile.update(function () { 
                req.user.mobile.del(c.data.id, function (result) { 
                    res.json(result);
                });
            });
            
        } else { 
            next(new Error('Input Error')); return;
        }
    });*/

module.exports = router;