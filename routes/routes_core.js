const express = require('express');
const moment= require('moment');
const common = require('../lib/common');
const regex = require('../lib/regex');


const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Global_Token_Model= require('../model/OMS_Global_Token_Model.js');	

	
router.route('/setting/error-list')
    .get(function (req, res) {
		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Response_Code_Master_List_All(function(data) {
					res.json({ list: data });
				});		

		
    });
	

	
router.route('/setting/language-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Language_Master_List_All(function(data) {
					res.json({ list: data });
				});		

		
    });


router.route('/setting/mobile-country-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Mobile_Country_Master_List_All(function(data) {
					res.json({ list: data });
				});		

		
    });


router.route('/token')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		
		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(req.body.token, function(data) {
					if (data.length == 0) {
						res.json({ result: false });
					}
					if (data.length == 1) {
						var record = data[0];
						if(record.user_id == '0') {
							var jData = {"result" : true, "login" : false};
						}
						if(record.user_id != '0') {
							var jData = {"result" : true, "login" : true, "user_type" : record.user_type};
						}
						res.json(jData);
					} 
				});		
		
    })
    .put(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		
        
        if (regex.IsUserType(req.body.user_type))  {
			var randomNumber =  common.getTimehash();
			var Now = moment().format('YYYY-MM-DD H:mm:ss');
            var jData = {
					mobile_token: randomNumber,
					udid: (req.body.udid == undefined ? '' : req.body.udid),
					user_type: req.body.user_type,
					apps_version: req.body.apps_version,
					mobile_brand: req.body.mobile_brand,
					mobile_os: req.body.mobile_os,
					mobile_model: req.body.mobile_model,
					create_datetime: Now,
					last_modify_datetime: Now
				};
			var dmOMS = new OMS_Global_Token_Model();
			var record = dmOMS.Global_Token_Map_UDID_Black_List_Is(jData, function(black_list_found_is) {
				if(black_list_found_is == true ) {
						res.json({ result: false });
				} else {
					var record = dmOMS.Global_Token_Map_Select_Insert(jData, function(result) {
							if(result == true) res.json({"result" : true, "token" : randomNumber});
						});
					}
				});
			
		}
		
		
    });
	
	
	
	
module.exports = router;



