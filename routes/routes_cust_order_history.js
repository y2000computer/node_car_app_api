//NPM Library
const express = require('express');
const moment= require('moment');
const router = express.Router();

//Self Build Library
const common = require('../lib/common');
const regex = require('../lib/regex');

//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_CO_History_Model= require('../model/OMS_Cust_Order_History_Model.js');	

//Handler
const Cust_Order_History_Handler= require('../handler/Cust_Order_History_Handler.js');	

	
router.route('/list')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		
		var dmOMS = new OMS_CO_History_Model();
		var record = dmOMS.Cust_Order_History_Select(req, function(data) {
					res.json({ list: data });
				});		
		
    })	;
	
router.route('/info')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.ride_order_ref) return res.json({Error: "Missing ride_order_ref"}); 
		
		var jData = {
				  "token": req.body.token,
				  "ride_order_ref": req.body.ride_order_ref
				};
				
		//console.log(jData);		
		var handler = new Cust_Order_History_Handler();
		var record = handler.get_info(jData, function(data) {
				res.json(data); 
				return;
				});
	
		
    })	;
	
	
router.route('/feedback')
    .put(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.ride_order_ref) return res.json({Error: "Missing ride_order_ref"}); 
		if (!req.body.feedback) return res.json({Error: "Missing feeback"}); 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');

 		var jData = {
				ride_order_ref: req.body.ride_order_ref,
				feedback: req.body.feedback,
				create_datetime: Now,
				last_modify_datetime: Now		
			};

		//console.log(jData);
		var dmOMS = new OMS_CO_History_Model();
		var record = dmOMS.Cust_Order_Feedback_Insert(jData, function(data) {
					res.json({ result: true });
				});		


    })	;
	
	
module.exports = router;



