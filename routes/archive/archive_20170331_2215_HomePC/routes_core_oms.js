const moment= require('moment');
const express = require('express');

const router = express.Router();
const Core_Traffic_Model= require('../model/Core_Traffic_Model.js');	
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	
const OMS_Standard_Model= require('../model/OMS_Standard_Model.js');	

	
router.route('/fee-peak-hour')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Standard_Model();
		var record = dmOMS.Standard_Fee_Peak_Hour_Master_List(function(data) {
					res.json({ list: data });
				});		

		
    });
	

router.route('/fee-standard')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new Core_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Standard_Model();
		var record = dmOMS.Standard_Fee_Standard_Select(req, function(data) {
					res.json({ list: data });
				});		
		
    });	
	

	
module.exports = router;



