//NPM Library
const express = require('express');
const moment= require('moment');
const async = require('async');

//Data Model
const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	
const OMS_Standard_Model= require('../model/OMS_Standard_Model.js');	
const OMS_Transport_Model= require('../model/OMS_Transport_Model.js');	


//Handler
const Console_Router_Handler = require('../handler/Console_Router_Handler.js');	


router.route('/match-service-memory-pool-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var rw = new Console_Router_Handler();
		var record = rw.Match_Memory_Pool_List (req, function(result) {
			res.json({list: result});
			});					

		
    });
	
	
	
module.exports = router;



