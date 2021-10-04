//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
var express = require('express');
var router = express.Router();
var moment= require("moment");
var Core_Traffic_Model= require('../model/Core_Traffic_Model.js');	
var Core_Test_v1_Model= require('../model/Core_Test_v1_Model.js');	

		
router.route('/dm_test_traffic_log')
    .get(function (req, res, next) {

		if(global.debug) {
			console.log ('__filename: ' + __filename);
			console.log ('req.originalUrl: ' + req.originalUrl);
			}
		var D = new Date();
		var N = D.getTime();
		var R = 'email-' + N+ Math.floor(Math.random() * (999999 - 1)) + 1
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var JsonData = {
			"api_server_domain": global.api_server_domain,
			"req_ip": req.ip,
			"req_originalUrl": req.originalUrl,
			"mobile_token": 'n/a',
			"server_log_datetime": Now
		};
		var dm = new Core_Traffic_Model();
		var record = dm.Insert(JsonData, function(insertId) {
					if(global.debug)console.log('insert_id=' + insertId);
					res.send('insert id=' + insertId);	
				});		

    });
		

router.route('/dm_test_list_all')
    .get(function (req, res, next) {

		if(global.debug) {
			console.log ('__filename: ' + __filename);
			console.log ('req.originalUrl: ' + req.originalUrl);
			}
	
		var dm = new Core_Test_v1_Model();
		var record = dm.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
	

	
////////////////////////////////////////////////////////////////////////////////////
	
module.exports = router;



