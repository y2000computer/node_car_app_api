//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
var express = require('express');
var router = express.Router();
var moment= require("moment");
var Core_Traffic_v1_Model= require('../model/Core_Traffic_v1_Model.js');	
var Core_Traffic_v2_Model= require('../model/Core_Traffic_v2_Model.js');	
var Core_Test_v1_Model= require('../model/Core_Test_v1_Model.js');	

		
router.route('/dm_test_traffic_log')
    .get(function (req, res, next) {

		if(global.debug) {
			console.log ('__filename: ' + __filename);
			console.log ('req.originalUrl: ' + req.originalUrl);
			}
		
		
		var dmCore = new Core_Traffic_v2_Model();
		var record = dmCore.Insert(req, function(insertId) {
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
	
		var mobile_token = '<to be provide later>';
		var dmCore = new Core_Traffic_v2_Model().writeLog(req, mobile_token, function() {});		

		var dmCore = new Core_Test_v1_Model();
		var record = dmCore.List_All(function(data) {
					res.send(data);	
				});		

		
    });
	
	

	
////////////////////////////////////////////////////////////////////////////////////
	
module.exports = router;



