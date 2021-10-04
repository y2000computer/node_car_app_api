const moment= require('moment');
const express = require('express');

const router = express.Router();
const OMS_Api_Traffic_Model= require('../model_test/OMS_Api_Traffic_Model.js');	
const Core_Test_v1_Model= require('../model_test/Core_Test_v1_Model.js');	
const OMS_Test_v1_Model= require('../model_test/OMS_Test_v1_Model.js');	


//Handler
const Cust_Request_Before_Handler= require('../handler/Cust_Request_Before_Handler.js');	
	
	

router.route('/dm_test_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

		var dmCore = new Core_Test_v1_Model();
		var record = dmCore.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
	
router.route('/dm_oms_test_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

		var dmOMS = new OMS_Test_v1_Model();
		var record = dmOMS.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
		
router.route('/dm_test_insert')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

		var D = new Date();
		var N = D.getTime();
		var R = 'email-' + N+ Math.floor(Math.random() * (99999999 - 1)) + 1
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		
		var jData = {
			email: R,
			password: 'xxxxxx',
			depart_code: 'xxxxxx',
			last_name: 'xxxxxx',
			first_name: 'xxxxxx',
			status: 'xxxxxx',
			last_visit_date: 'xxxxxx',
			create_user: 'xxxxxx',
			create_datetime: Now,
			modify_user: 'xxxxxx',
			modify_datetime: Now
		};

	
		var dmCore = new Core_Test_v1_Model();

		var record = dmCore.Insert(jData, function(insertId) {
					if(global.debug) console.log('Return insert_id=' + insertId);
					res.send('last insert id=' + insertId);	
				});		


		
    });
	
	
	
router.route('/dm_oms_test_insert')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		
	
		var D = new Date();
		var N = D.getTime();
		var R = 'email-' + N+ Math.floor(Math.random() * (99999999 - 1)) + 1
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		
		var jData = {
			email: R,
			password: 'xxxxxx',
			depart_code: 'xxxxxx',
			last_name: 'xxxxxx',
			first_name: 'xxxxxx',
			status: 'xxxxxx',
			last_visit_date: 'xxxxxx',
			create_user: 'xxxxxx',
			create_datetime: Now,
			modify_user: 'xxxxxx',
			modify_datetime: Now
		};

	
		var dmOMS = new OMS_Test_v1_Model();

		var record = dmOMS.Insert(jData, function(insertId) {
					if(global.debug) console.log('Return insert_id=' + insertId);
					res.send('last insert id=' + insertId);	
				});		


		
    });
	
	
	
router.route('/dm_oms_standard_cache_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);

		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Master_Model_Cache.List_All(function(data) {
						if(global.debug) console.log(new Date());
						if(global.debug) console.log("execute dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Master_Model_Cache.List_All()");
						if(global.debug) console.log(data);	
						res.send(data);	
						return;

		});		


		
    });	
	
	router.route('/dm_oms_standard_override_rate_factor_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);

		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Override_Factor_Model_Cache.List_All(function(data) {
						if(global.debug) console.log(new Date());
						if(global.debug) console.log("execute dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Override_Factor_Model_Cache.List_All()");
						if(global.debug) console.log(data);	
						res.send(data);
						return;

		});		


		
    });	
	


	router.route('/dm_oms_standard_fee_peak_hour_master_model_cache_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);

		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.List_All(function(data) {
						if(global.debug) console.log(new Date());
						if(global.debug) console.log("execute dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.List_All()");
						if(global.debug) console.log(data);	
						res.send(data);	
						return;

		});		


		
    });	
	
	
	
	
 router.route('/request/before')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		
		var jData = {
				  "token": "88d694f074101ea482d2699bf5bee122",
				  "grade_sub_code": "HK_CAR_X_SEAT_4",
				  "pickup": {
					"eng": "21 SheungYuetRoad,KowloonBay",
					"chn": "九龍灣常悅道21號",
					"lat": 22.322307,
					"lng": 114.211445
				  },
				  "gapi": {
					"km": 25.47,
					"minute": 31.62
				  }
				};
						
		var handler = new Cust_Request_Before_Handler();
		var record = handler.Search_Driver(jData, function(data) {
				res.json(data); 
				return;
				});


	
    });	
////////////////////////////////////////////////////////////////////////////////////
	
module.exports = router;



