//NPM Library
const express = require('express');
const moment= require('moment');
const winston = require('winston');
const fs = require('fs');
const router = express.Router();
const sleep = require('system-sleep');

//Self Build Library
const common = require('../lib/common');
const regex = require('../lib/regex');

//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Panel_Model= require('../model/OMS_Driver_Panel_Model.js');	
const OMS_Driver_Resv_Panel_Filter_Model = require('../model/OMS_Driver_Resv_Panel_Filter_Model.js');	
const OMS_Driver_Resv_Panel_Order_Model = require('../model/OMS_Driver_Resv_Panel_Order_Model.js');	
const OMS_Driver_Resv_Confirmed_Order_Model = require('../model/OMS_Driver_Resv_Confirmed_Order_Model.js');	



//Handler



//Logger 


router.route('/cancel')
	.post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
		if (! j.id) return res.json({Error: "Missing id"}); 

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id	=null;
		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {
					driver_user_id = token_data[0].driver_user_id;
					var jData = {
							id: j.id
						};						
					var dmOMS = new OMS_Driver_Resv_Confirmed_Order_Model();
					var record = dmOMS.Order_Cancel_Update(jData, function(data) {
								res.json({ result: true });
							});

				} //if (token_data.length == 0) { 
			});		
				
	
    });


router.route('/start')
	.post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
		if (! j.id) return res.json({Error: "Missing id"}); 

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id	=null;
		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {
					driver_user_id = token_data[0].driver_user_id;
					var jData = {
							id: j.id
						};						
					var dmOMS = new OMS_Driver_Resv_Confirmed_Order_Model();
					var record = dmOMS.Order_Start_Update(jData, function(data) {
								res.json({ result: true });
							});

				} //if (token_data.length == 0) { 
			});		
				
	
    });


			
	
		
	
module.exports = router;



