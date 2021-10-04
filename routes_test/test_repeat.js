const moment= require('moment');
const express = require('express');

const router = express.Router();
const Core_Traffic_v1_Model= require('../model_test/Core_Traffic_v1_Model.js');	
const Core_Test_v1_Model= require('../model_test/Core_Test_v1_Model.js');	
const OMS_Test_v1_Model= require('../model_test/OMS_Test_v1_Model.js');	

	

router.route('/dm_test_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_v1_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

		var dmCore = new Core_Test_v1_Model();
		var record = dmCore.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
	
router.route('/dm_oms_test_list_all')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_v1_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

		var dmOMS = new OMS_Test_v1_Model();
		var record = dmOMS.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
		
router.route('/dm_test_insert')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new Core_Traffic_v1_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		

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
		if(global.log_heavy_traffic) var dmCore = new Core_Traffic_v1_Model().writeLog(req, 'mobile_token_to_be_provide', function() {});		
	
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
	
////////////////////////////////////////////////////////////////////////////////////
	
module.exports = router;



