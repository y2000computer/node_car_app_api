const express = require('express');
const moment= require('moment');
const common = require('../lib/common');
const regex = require('../lib/regex');


const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Panel_Model= require('../model/OMS_Driver_Panel_Model.js');	
	


router.route('/switch')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
       // if (! j.registration_id) { err.push('driver_panel_miss_registration_id'); }
        if (j.online_offline_switch==undefined) { err.push('driver_panel_miss_switch'); }
		if (j.latitude==undefined) { err.push('driver_panel_miss_gps_latitude'); }
		if (j.longitude==undefined) { err.push('driver_panel_miss_gps_longitude'); }


        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var from_gps_type ='';
        if (j.from_gps_type) from_gps_type = j.from_gps_type;
		
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
					if(j.online_offline_switch==1) { //switch on
						var jData = {
							mobile_token: j.token,
						};	
						var dmOMS = new OMS_Driver_Account_Model();
						var record = dmOMS.Mapped_Vehicle_Default_Select(jData, function(result) {
							//registration_id = result[0].registration_id;
							if (result.length == 0) { 
								var err = [];
								err.push('driver_token_invalid'); 
								res.json({ result: false, error: err });
								return; 
							}
							registration_id = (result.length>0 ? result[0].registration_id : null);
							var Now = moment().format('YYYY-MM-DD H:mm:ss');
							var jData = {
								mobile_token: j.token,
								driver_user_id: driver_user_id,
								registration_id: registration_id,
								latitude: j.latitude,
								longitude: j.longitude,
								from_gps_type: from_gps_type,
								create_datetime: Now,
								last_modify_datetime: Now
							};	
							var dmOMS = new OMS_Driver_Panel_Model();
							var record = dmOMS.Switch_Archive(jData, function(result) {
								var record = dmOMS.Switch_Insert(jData, function(result) {
										//if(result == true) res.json({"result" : true});
										res.json({"result" : true});
									});							
								});
							});
								

					} //switch on 		
					
					if(j.online_offline_switch==0) { //switch off
						var jData = {
							mobile_token: j.token,
						};	
						var dmOMS = new OMS_Driver_Account_Model();
						var record = dmOMS.Mapped_Vehicle_Default_Select(jData, function(result) {
							registration_id = result[0].registration_id;
							var Now = moment().format('YYYY-MM-DD H:mm:ss');
							var jData = {
								mobile_token: j.token,
								driver_user_id: driver_user_id,
								registration_id: registration_id,
								latitude: j.latitude,
								longitude: j.longitude,
								create_datetime: Now,
								last_modify_datetime: Now
							};	
							var dmOMS = new OMS_Driver_Panel_Model();
							var record = dmOMS.Switch_Archive(jData, function(result) {
									//if(result == true) res.json({"result" : true});
									res.json({"result" : true});
									});							
								});
					
					} //switch off 		
				
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	
	

router.route('/online_gps')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
		if (j.latitude==undefined) { err.push('driver_panel_miss_gps_latitude'); }
		if (j.longitude==undefined) { err.push('driver_panel_miss_gps_longitude'); }


        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var from_gps_type ='';
        if (j.from_gps_type) from_gps_type = j.from_gps_type;

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
						latitude: j.latitude,
						longitude: j.longitude,
						from_gps_type: from_gps_type,
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Panel_Model();
					var record = dmOMS.Online_GPS_Update(jData, function(result) {
							//if(result == true) res.json({"result" : true});
							res.json({"result" : true});
							});
	
				
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	


router.route('/destination')
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
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Panel_Model();
					var record = dmOMS.Destination_Select(jData, function(data) {
							var jData = {
									"location_eng": (data.length>0 ? data[0].location_eng : null),
									"location_chn": (data.length>0 ? data[0].location_chn : null),
									"latitude": (data.length>0 ? data[0].latitude : null),
									"longitude": (data.length>0 ? data[0].longitude : null)
									};
								 res.json(jData);
							});
	
				
				} //if (token_data.length == 0) { 
			});		
	})		
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						location_eng: j.location_eng,
						location_chn: j.location_chn,
						latitude: j.latitude, 
						longitude: j.longitude,
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Panel_Model();
					var record = dmOMS.Destination_Insert(jData, function(result) {
							//if(result == true) res.json({"result" : true});
							res.json({"result" : true});
							});
	
				
				} //if (token_data.length == 0) { 
			});		
				

	
    })
   .patch(function (req, res) {

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
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Panel_Model();
					var record = dmOMS.Destination_Update(jData, function(result) {
							//if(result == true) res.json({"result" : true});
							res.json({"result" : true});
							});
	
				
				} //if (token_data.length == 0) { 
			});		
				

	
    });

	
	
module.exports = router;



