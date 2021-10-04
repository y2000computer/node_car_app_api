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


//Handler


//Logger 


router.route('/parameter')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		
        var j = req.body;
        var err = [];

        if (! j.token) { err.push('cust_token_invalid'); }
 
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		
		var dmOMS = new OMS_Global_Token_Model();
		var record = dmOMS.Global_Token_Map_Select(j.token, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('cust_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {
					var discount_percent= 0;
					var record = dm_OMS_Standard_Model_Cache.OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache.List_All(function(data) {
							for (var i = 0; i < data.length; i++) {
								if(data[i].type_code == 'IMMEDIATE') {
								discount_percent=data[i].discount_percent;
									}
							}
							var jData = {
									"service_type_discount_percent" : discount_percent
									};
							res.json(jData);							
						})					
				} //if (token_data.length == 0) { 
			});		
				
		
		
    });
	
	


	
module.exports = router;



