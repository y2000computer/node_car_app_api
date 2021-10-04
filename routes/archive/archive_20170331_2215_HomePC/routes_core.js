const moment= require('moment');
const express = require('express');

const router = express.Router();
const Core_Traffic_Model= require('../model/Core_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	

	
router.route('/setting/error-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Response_Code_Master_List(function(data) {
					res.json({ list: data });
				});		

		
    });
	

	
router.route('/setting/language-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Language_Master_List(function(data) {
					res.json({ list: data });
				});		

		
    });


router.route('/setting/mobile-country-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Global_Model();
		var record = dmOMS.Global_Mobile_Country_Master_List(function(data) {
					res.json({ list: data });
				});		

		
    });


	
	
module.exports = router;



