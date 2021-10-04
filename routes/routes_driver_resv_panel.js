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
const xSea = require('../lib/xSea');

//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Panel_Model= require('../model/OMS_Driver_Panel_Model.js');	
const OMS_Driver_Resv_Panel_Filter_Model = require('../model/OMS_Driver_Resv_Panel_Filter_Model.js');	
const OMS_Driver_Resv_Panel_Order_Model = require('../model/OMS_Driver_Resv_Panel_Order_Model.js');	


//Handler
const Driver_Resv_Panel_List_Handler= require('../handler/Driver_Resv_Panel_List_Handler.js');	


//Logger 

router.route('/filter')
.patch(function (req, res, next) {

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
			   var jData = {
				   driver_user_id: driver_user_id,
				   immediate_order_pickup_region_hk_is: j.immediate_order.pickup.HK,
				   immediate_order_pickup_region_kln_is: j.immediate_order.pickup.KLN,
				   immediate_order_pickup_region_nt_is: j.immediate_order.pickup.NT,
				   immediate_order_drop_region_hk_is: j.immediate_order.drop.HK,
				   immediate_order_drop_region_kln_is: j.immediate_order.drop.KLN,
				   immediate_order_drop_region_nt_is: j.immediate_order.drop.NT,
				   reserved_order_pickup_region_hk_is: j.reserved_order.pickup.HK,
				   reserved_order_pickup_region_kln_is: j.reserved_order.pickup.KLN,
				   reserved_order_pickup_region_nt_is: j.reserved_order.pickup.NT,
				   reserved_order_drop_region_hk_is: j.reserved_order.drop.HK,
				   reserved_order_drop_region_kln_is: j.reserved_order.drop.KLN,
				   reserved_order_drop_region_nt_is: j.reserved_order.drop.NT

			   };						
			   var dmOMS = new OMS_Driver_Resv_Panel_Filter_Model();
			   var record = dmOMS.Filter_Deactive_Update(jData, function(data) {
				   var record = dmOMS.Filter_Insert(jData, function (data) {
					   res.json({ result: true });
					});
			   });

		   } //if (token_data.length == 0) { 
	   });		
		   

})
   

.post(function (req, res, next) {

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
					var jData = {
						driver_user_id: driver_user_id
					};						
					var dmOMS = new OMS_Driver_Resv_Panel_Filter_Model();
					var record = dmOMS.Filter_Select(jData, function(data) {
						var jResult = 
							{
								"immediate_order": {
								  "pickup": {
									"HK": (data.length>0 ? data[0].immediate_order_pickup_region_hk_is : true),  
									"KLN": (data.length>0 ? data[0].immediate_order_pickup_region_kln_is : true),  
									"NT": (data.length>0 ? data[0].immediate_order_pickup_region_nt_is : true)  
									},
								  "drop": {
									"HK": (data.length>0 ? data[0].immediate_order_drop_region_hk_is : true),  
									"KLN": (data.length>0 ? data[0].immediate_order_drop_region_kln_is : true),  
									"NT": (data.length>0 ? data[0].immediate_order_drop_region_nt_is : true)  
									}
								},
								"reserved_order": {
								  "pickup": {
										"HK": (data.length>0 ? data[0].reserved_order_pickup_region_hk_is : true),  
										"KLN": (data.length>0 ? data[0].reserved_order_pickup_region_kln_is : true),  
										"NT": (data.length>0 ? data[0].reserved_order_pickup_region_nt_is : true)  
										},
									  "drop": {
										"HK": (data.length>0 ? data[0].reserved_order_drop_region_hk_is : true),  
										"KLN": (data.length>0 ? data[0].reserved_order_drop_region_kln_is : true),  
										"NT": (data.length>0 ? data[0].reserved_order_drop_region_nt_is : true)  									}
								}
							};						
							res.json(jResult);
					});

				} //if (token_data.length == 0) { 
			});		
				
	
    });
		


router.route('/confirm')
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
					var dmOMS = new OMS_Driver_Resv_Panel_Order_Model();
					var record = dmOMS.Driver_Select(driver_user_id, function(data) {
						var jData = {
								id: j.id,
								driver_mobile_token: j.token,	
								driver_user_id: data[0].driver_user_id,
								registration_id: data[0].registration_id
							};						
							var record = dmOMS.Order_Confirm_Update(jData, function(data) {
									var record = dmOMS.Order_Mapped_Driver_Select(jData, function(data) {
										if (data.length > 0) {
											res.json({ result: true });
										} else {
											res.json({ result: false });
										}
									});
								});
					});

				} //if (token_data.length == 0) { 
			});		
				
	
    });




router.route('/list')
	.post(function (req, res, next) {
	
		if (global.debug) console.log('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if (global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function () { });
	
		var j = req.body;
		var err = [];
	
		if (!j.token) { err.push('driver_token_invalid'); }
	
		if (err.length > 0) { res.json({ result: false, error: err }); return; }
	
		var driver_user_id = null;
		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function (token_data) {
			if (token_data.length == 0) {
				var err = [];
				err.push('driver_token_invalid');
				res.json({ result: false, error: err });
				return;
			} else {
				driver_user_id = token_data[0].driver_user_id;
				if (j.simulation_is) {
				var dmOMS = new OMS_Driver_Resv_Panel_Order_Model();
				var record = dmOMS.Driver_Select(driver_user_id, function (data) {
					var jData = {
						driver_user_id: driver_user_id
					};
					var handler = new Driver_Resv_Panel_List_Handler();
					//var list = await xSea.List();
					var record = handler.List(jData, function (data) {
						res.json(data);
						});
					});
				}	
				if(!j.simulation_is) {
					var dmOMS = new OMS_Driver_Resv_Panel_Order_Model();
					var record = dmOMS.Driver_Select(driver_user_id, async function (data) {
						var jData = {
							driver_user_id: driver_user_id
						};
						//var handler = new Driver_Resv_Panel_List_Handler();
						var list = await xSea.List(data[0].driver_user_id,data[0].gps_latitude,data[0].gps_longitude,data[0].grade_sub_code,data[0].down_to_x_is,data[0].order_priority);
						//var record = handler.List(jData, function (data) {
							//res.json(list);
							res.json({ list: list });
							//});
						});
				}	
							
			} //if (token_data.length == 0) { 
		});
					
		
	});
			
	
		
	
module.exports = router;



