//NPM Library
const express = require('express');
const moment= require('moment');
const winston = require('winston');
const fs = require('fs');
const router = express.Router();
const sleep = require('system-sleep');
const xSea = require('../lib/xSea');

//Self Build Library
const common = require('../lib/common');
const regex = require('../lib/regex');

//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Global_Token_Model= require('../model/OMS_Global_Token_Model.js');	
const OMS_Cust_Model= require('../model/OMS_Cust_Model.js');	
const OMS_Cust_Request_Model= require('../model/OMS_Cust_Request_Model.js');	
const OMS_Resv_Order_Common_Model= require('../model/OMS_Resv_Order_Common_Model.js');	
const OMS_Cust_Resv_Immediate_Order_Model = require('../model/OMS_Cust_Resv_Immediate_Order_Model.js');	


//Handler
const Cust_Resv_Estimated_Fee_Handler= require('../handler/Cust_Resv_Estimated_Fee_Handler.js');	
const Cust_Resv_Immediate_Order_Handler= require('../handler/Cust_Resv_Immediate_Order_Handler.js');	


//Logger 


router.route('/parameter')
	.post(function (req, res) {

		if (global.debug) console.log('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if (global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function () { });
		
		var j = req.body;
		var err = [];

		if (!j.token) { err.push('cust_token_invalid'); }
 
		if (err.length > 0) { res.json({ result: false, error: err }); return; }

		
		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('cust_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {
				var discount_percent = 0;
				var record = dm_OMS_Standard_Model_Cache.OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache.List_All(function (data) {
					for (var i = 0; i < data.length; i++) {
						if (data[i].type_code == 'IMMEDIATE') {
							discount_percent = data[i].discount_percent;
						}
					}
					var jData = {
						"service_type_discount_percent": discount_percent
					};
					res.json(jData);
				})
			} //if (token_data.length == 0) { 
		});
				
	});
	



router.route('/order')
	.put(function (req, res) {

		if (global.debug) console.log('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		
		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.grade_sub_code) return res.json({Error: "Missing grade_sub_code"}); 
		if (!req.body.pickup.lat) return res.json({Error: "Missing pickup.lat"}); 
		if (!req.body.pickup.lng) return res.json({Error: "Missing pickup.lng"}); 
		if (req.body.gapi.km == undefined) return res.json({Error: "Missing gapi.km"}); 
		if (!req.body.gapi.minute == undefined) return res.json({Error: "Missing gapi.minute"}); 

		var j = req.body;
		var err = [];

		if (!j.token) { err.push('cust_token_invalid'); }
 
		if (err.length > 0) { res.json({ result: false, error: err }); return; }

		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('cust_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {

					var jData = {
						"cust_user_id": token_data[0].user_id,
						"token": j.token,
						"profile_code": j.profile_code,
						"grade_sub_code": j.grade_sub_code,
						"tips": j.tips,
						"simulation_is": j.simulation_is,
						"pickup": {
						"eng": j.pickup.eng,
						"chn": j.pickup.chn,
						"lat": j.pickup.lat,
						"lng": j.pickup.lng
						},
						"drop": {
							"eng": j.drop.eng,
							"chn": j.drop.chn,
							"lat": j.drop.lat,
							"lng": j.drop.lng
						},			
						"gapi": {
						"km": j.gapi.km,
						"minute": j.gapi.minute
					},
						"type_code": "IMMEDIATE",
						"state_code": "YEL_WAIT_DRIVER_CONFIRM",
						"state_name_eng": "Waiting driver confirm order",
						"state_name_chn": "等待司機確認中"
					};
					//console.log('cust_user_id='+token_data[0].user_id);
					var handler = new Cust_Resv_Estimated_Fee_Handler();
					var record = handler.Estimated_Fee(jData, function (jEstimated) {
							var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
							var record = dmOMS.Order_Insert(jEstimated,  function(insertId) {
								//res.json(jEstimated);
								//console.log('insertId='+insertId);
								var record = dmOMS.Reference_Update(insertId, async function(result) {
									await xSea.Update();
									res.json({ result: true });
								});
								//do something
							});
						});	

			} //if (token_data.length == 0) { 
		});
				
	});
		
		

	router.route('/view')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.id) return res.json({Error: "Missing id"}); 
		
		var j = req.body;
		var err = [];

		if (!j.token) { err.push('cust_token_invalid'); }
 
		if (err.length > 0) { res.json({ result: false, error: err }); return; }

		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('cust_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {
				var jData = {
					"id": j.id
				};
				var handler = new Cust_Resv_Immediate_Order_Handler();
					var record = handler.Order_Get(jData, function (data) {
									res.json(data);
						});

			} //if (token_data.length == 0) { 
		});
				
	});
		

	router.route('/tips')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.id) return res.json({Error: "Missing id"}); 
		if (!req.body.tips) return res.json({Error: "Missing tips"}); 
		
		var j = req.body;
		var err = [];

		if (!j.token) { err.push('cust_token_invalid'); }
 
		if (err.length > 0) { res.json({ result: false, error: err }); return; }

		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('cust_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {
				var jData = {
					"id": j.id,
					"tips": j.tips
				};
				var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
				var record = dmOMS.Tips_Update(jData, async function (data) {
						await xSea.Update();
						res.json({ result: true });
					});
	
			} //if (token_data.length == 0) { 
		});
				
	});


	
	router.route('/cancel')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.id) return res.json({Error: "Missing id"}); 
		
		var j = req.body;
		var err = [];

		if (!j.token) { err.push('cust_token_invalid'); }
 
		if (err.length > 0) { res.json({ result: false, error: err }); return; }

		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('cust_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {
				var jData = {
					"id": j.id
				};
				var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
				var record = dmOMS.Cust_Cancel_Update(jData, async function (data) {
						await xSea.Update();
						res.json({ result: true });
					});
	
			} //if (token_data.length == 0) { 
		});
				
	});


	
module.exports = router;



