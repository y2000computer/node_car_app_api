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
const OMS_Global_Token_Model= require('../model/OMS_Global_Token_Model.js');	
const OMS_Cust_Model= require('../model/OMS_Cust_Model.js');	
const OMS_Cust_Request_Model= require('../model/OMS_Cust_Request_Model.js');	
const OMS_Resv_Order_Common_Model= require('../model/OMS_Resv_Order_Common_Model.js');	
const OMS_Cust_Resv_Immediate_Order_Model = require('../model/OMS_Cust_Resv_Immediate_Order_Model.js');	


//Handler
const Cust_Resv_Estimated_Fee_Handler= require('../handler/Cust_Resv_Estimated_Fee_Handler.js');	
const Cust_Resv_Immediate_Order_Handler= require('../handler/Cust_Resv_Immediate_Order_Handler.js');	


//Logger 


router.route('/list')
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
				var jData = {
					"token": j.token
				};
				var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
				var record = dmOMS.Order_List(jData, function(data) {
						res.json({ list: data });
					});

				} //if (token_data.length == 0) { 
			});
					
		});
	



	
module.exports = router;



