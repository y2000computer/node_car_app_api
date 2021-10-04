const express = require('express');
const moment= require('moment');
const common = require('../lib/common');
const regex = require('../lib/regex');


const router = express.Router();

//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Order_History_Model= require('../model/OMS_Driver_Order_History_Model.js');	
	
//Handler
const Driver_Order_History_Handler= require('../handler/Driver_Order_History_Handler.js');	


	
router.route('/list')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

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
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					var jData = {
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						cutoff: j.cutoff,
						create_datetime: Now,
						last_modify_datetime: Now
					};	
					var handler = new Driver_Order_History_Handler();
					var record = handler.get_driver_order_list(jData, function(data) {
							res.json(data); 
							return;
							});
						
	
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	

router.route('/info')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

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
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					var jData = {
							  "mobile_token": j.token,
							  "ride_order_ref": j.ride_order_ref
							};
					var handler = new Driver_Order_History_Handler();
					var record = handler.get_info(jData, function(data) {
							res.json(data); 
							return;
							});
	
				} //if (token_data.length == 0) { 
			});		
				

	
    });
		

router.route('/feedback')
    .put(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		
        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

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
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					var jData = {
  						    "mobile_token": j.token,
						    "ride_order_ref": j.ride_order_ref,
							"feedback": j.feedback,
							"create_datetime": Now,
							"last_modify_datetime": Now		
						};	
					var dmOMS = new OMS_Driver_Order_History_Model();
					var record = dmOMS.Driver_Order_Feedback_Insert(jData, function(data) {
								res.json({ result: true });
							});
				
				} //if (token_data.length == 0) { 
			});		
				

	
    });
		
		
		
	
module.exports = router;



