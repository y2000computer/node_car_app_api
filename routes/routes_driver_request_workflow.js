//NPM Library
const express = require('express');
const moment= require('moment');
const router = express.Router();

//Self Build Library
const common = require('../lib/common');
const regex = require('../lib/regex');


//Data Model
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Panel_Model= require('../model/OMS_Driver_Panel_Model.js');	
const OMS_Driver_Request_Model= require('../model/OMS_Driver_Request_Model.js');	
const OMS_Driver_Request_Workflow_Model= require('../model/OMS_Driver_Request_Workflow_Model.js');	

//Handler
const Driver_Request_WorkFlow_Router_Handler= require('../handler/Driver_Request_WorkFlow_Router_Handler.js');	


router.route('/order_pooling')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		//if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		if(global.log_huge_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

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
						registration_id: j.registration_id,
						latitude: j.latitude,
						longitude: j.longitude,
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Order_Pooling_Select(jData, function(data) {
							if (data.length == 0) { 
								res.json({});
								} else {
										var jData = {
											"request_id": data[0].request_id,
											"grade_sub_code": data[0].grade_sub_code,
											"last_name": data[0].last_name,
											"first_name": data[0].first_name,
											"ranking_one_week": data[0].ranking_one_week,
											"mobile": data[0].mobile,
											"pickup_location_eng": data[0].pickup_location_eng,
											"pickup_location_chn": data[0].pickup_location_chn,
											"pickup_latitude": data[0].pickup_latitude,
											"pickup_longitude": data[0].pickup_longitude,
											"drop_location_eng": data[0].drop_location_eng,
											"drop_location_chn": data[0].drop_location_chn,
											"drop_latitude": data[0].drop_latitude,
											"drop_longitude": data[0].drop_longitude,
											"gapi_km": data[0].gapi_km,
											"gapi_minute": data[0].gapi_minute,
											"extra_rate": data[0].extra_rate,
											"create_datetime": data[0].create_datetime,
											"grade_code": data[0].grade_code,
											"grade_name_eng": data[0].grade_name_eng,
											"sub_grade_name_eng": data[0].sub_grade_name_eng,
											"sub_grade_name_chn": data[0].sub_grade_name_chn,
											"arrive_min": data[0].arrive_min
										};					
										res.json(jData);
								}
							});
					
	
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	
	

router.route('/acknowlege')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }


        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Request_Id_Select(jData, function(data) {
						if (data[0].state_code != '01_DRIVER_MATCHING') { 
							var err = [];
							err.push('driver_workflow_request_aborted'); 
							res.json({ result: false, error: err });
							return; 
						} else {
						
									var record = dmOMS.Driver_Online_Select(jData, function(data) {
											var Now = moment().format('YYYY-MM-DD H:mm:ss');
											var jDriver_Data = {
												mobile_token: jData.mobile_token,
												driver_user_id: jData.driver_user_id,
												request_id: jData.request_id,
												registration_id:data[0].registration_id,
												latitude: data[0].gps_latitude,
												longitude: data[0].gps_longitude,
												create_datetime: Now
												};	
											var dmOMS = new OMS_Driver_Request_Model();
											var record = dmOMS.Request_Acknowlege_Update(jDriver_Data, function(jDriver_Vehicle) {
													var rw = new Driver_Request_WorkFlow_Router_Handler();
													var record = rw.Request_Driver_Acknowlege(jDriver_Data, function(result) {
														res.json({ result: true });
														});					
												});	
											});
									}		
						});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });
	


router.route('/gps_tracking')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		//if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		if(global.log_huge_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }
		if (! j.lat)  { err.push('driver_workflow_miss_lat'); } 
		if (! j.lng)  { err.push('driver_workflow_miss_lng'); }


        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id,
						lat: j.lat,
						lng: j.lng
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Driver_Online_Select(jData, function(data) {
							var Now = moment().format('YYYY-MM-DD H:mm:ss');
							var jDriver_Data = {
								mobile_token: jData.mobile_token,
								driver_user_id: jData.driver_user_id,
								request_id: jData.request_id,
								registration_id:data[0].registration_id,
								latitude: jData.lat,
								longitude: jData.lng,
								create_datetime: Now,
								last_modify_datetime: Now
								};	
					var dmOMS = new OMS_Driver_Panel_Model();
					var record = dmOMS.Online_GPS_Update(jDriver_Data, function(result) {
								var dmOMS = new OMS_Driver_Request_Model();
								var record = dmOMS.Request_Driver_GPS_Tracking_Insert(jDriver_Data, function(jDriver_Vehicle) {
										var rw = new Driver_Request_WorkFlow_Router_Handler();
										var record = rw.Request_Driver_GPS_Tracking(jDriver_Data, function(result) {
												var record = rw.Request_Status_Enquiry(jDriver_Data, function(result) {
													var jData = {
														result: true,
														driver_user_id: driver_user_id,
														code: result
													};													
													res.json(jData);
												});					
											});					
									});	
								});
							});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	
	


router.route('/pickup')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id,
						lat: j.lat,
						lng: j.lng
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Request_Id_Select(jData, function(data) {
						if (data[0].state_code == 'ERR_CUST_CANCEL' || data[0].state_code == 'ERR_OMS_CANCEL') { 
							var err = [];
							err.push('driver_workflow_request_aborted'); 
							res.json({ result: false, error: err });
							return; 
						} else {
								var dmOMS = new OMS_Driver_Request_Workflow_Model();
								var record = dmOMS.Driver_Online_Select(jData, function(data) {
										var Now = moment().format('YYYY-MM-DD H:mm:ss');
										var jDriver_Data = {
											mobile_token: jData.mobile_token,
											driver_user_id: jData.driver_user_id,
											request_id: jData.request_id,
											registration_id:data[0].registration_id,
											create_datetime: Now
											};	
										var dmOMS = new OMS_Driver_Request_Model();
										var record = dmOMS.Request_Driver_Pickup_Update(jDriver_Data, function(jDriver_Vehicle) {
												var rw = new Driver_Request_WorkFlow_Router_Handler();
												var record = rw.Request_Driver_Pickup(jDriver_Data, function(result) {
													res.json({ result: true });
													});					
											});	
										});
									}		
						});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	
	


router.route('/change-location')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }


        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						request_id: j.request_id,
						drop_location_eng: j.drop.eng,
						drop_location_chn: j.drop.chn,
						drop_latitude: j.drop.lat,
						drop_longitude: j.drop.lng,
						create_datetime: Now
					};	
					
					var dmOMS = new OMS_Driver_Request_Model();
					var record = dmOMS.Request_Driver_Change_Location_Insert(jData, function(jDriver_Vehicle) {
							var rw = new Driver_Request_WorkFlow_Router_Handler();
							var record = rw.Request_Driver_Change_Drop_Location_UpdateCache(jData, function(result) {
								res.json({ result: true });
										});
								});	
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	
	
	
router.route('/arrive_drop')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id,
						lat: j.lat,
						lng: j.lng
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Request_Id_Select(jData, function(data) {
						if (data[0].state_code == 'ERR_CUST_CANCEL' || data[0].state_code == 'ERR_OMS_CANCEL') { 
							var err = [];
							err.push('driver_workflow_request_aborted'); 
							res.json({ result: false, error: err });
							return; 
						} else {
								var dmOMS = new OMS_Driver_Request_Workflow_Model();
								var record = dmOMS.Driver_Online_Select(jData, function(data) {
										var Now = moment().format('YYYY-MM-DD H:mm:ss');
										var jDriver_Data = {
											mobile_token: jData.mobile_token,
											driver_user_id: jData.driver_user_id,
											request_id: jData.request_id,
											registration_id:data[0].registration_id,
											create_datetime: Now
											};	
										var dmOMS = new OMS_Driver_Request_Model();
										var record = dmOMS.Request_Driver_Arrive_Drop_Update(jDriver_Data, function(jDriver_Vehicle) {
												var rw = new Driver_Request_WorkFlow_Router_Handler();
												var record = rw.Request_Driver_Arrive_Drop(jDriver_Data, function(result) {
													res.json({ result: true });
													});					
											});	
										});
									}		
						});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	


	
router.route('/assess')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }
		if (! j.ranking) { err.push('driver_workflow_miss_ranking'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id,
						ranking : j.ranking
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Driver_Online_Select(jData, function(data) {
							var Now = moment().format('YYYY-MM-DD H:mm:ss');
							var jDriver_Data = {
								mobile_token: jData.mobile_token,
								driver_user_id: jData.driver_user_id,
								request_id: jData.request_id,
								registration_id:data[0].registration_id,
								ranking : jData.ranking,
								create_datetime: Now
								};	
							var dmOMS = new OMS_Driver_Request_Model();
							var record = dmOMS.Driver_Access_Update(jDriver_Data, function(jDriver_Vehicle) {
									var rw = new Driver_Request_WorkFlow_Router_Handler();
									var record = rw.Request_Driver_Access(jDriver_Data, function(result) {
										res.json({ result: true });
										});					
								});	
							});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	
	


router.route('/cancel')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.request_id) { err.push('driver_workflow_miss_request_id'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var driver_user_id =null;
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
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						request_id: j.request_id,
						driver_cancel_selection: j.driver_cancel_selection
					};	

					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Request_Id_Select(jData, function(data) {
						if (data[0].state_code == 'ERR_CUST_CANCEL' || data[0].state_code == 'ERR_OMS_CANCEL') { 
							var err = [];
							err.push('driver_workflow_request_aborted'); 
							res.json({ result: false, error: err });
							return; 
						} else {
								var dmOMS = new OMS_Driver_Request_Workflow_Model();
								var record = dmOMS.Driver_Online_Select(jData, function(data) {
										var Now = moment().format('YYYY-MM-DD H:mm:ss');
										var jDriver_Data = {
											mobile_token: jData.mobile_token,
											driver_user_id: jData.driver_user_id,
											request_id: jData.request_id,
											driver_cancel_selection: jData.driver_cancel_selection,
											registration_id:data[0].registration_id,
											create_datetime: Now
											};	
										var dmOMS = new OMS_Driver_Request_Model();
										var record = dmOMS.Driver_Request_Cancel_Update(jDriver_Data, function(jDriver_Vehicle) {
												var rw = new Driver_Request_WorkFlow_Router_Handler();
												var record = rw.Request_Driver_Cancel(jDriver_Data, function(result) {
													res.json({ result: true });
													});					
											});	
										});
									}		
						});
					
	
				} //if (token_data.length == 0) { 
			});		
				
	
    });	
	


router.route('/queue')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		//if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		if(global.log_huge_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

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
						registration_id: j.registration_id,
						latitude: j.latitude,
						longitude: j.longitude,
						create_datetime: Now,
						last_modify_datetime: Now
					};					
					var dmOMS = new OMS_Driver_Request_Workflow_Model();
					var record = dmOMS.Queue_Select(jData, function(data) {
							var your_queue_position=null;
							for (var i = 0; i < data.length; i++) {
									if(data[i].driver_user_id==driver_user_id) {
									 //your_queue_position=(data[i].queue ==null ? null : data[i].queue);
									 your_queue_position=(data[i].queue ==null ? null : (data[i].queue + ' - ' + (data[i].queue + 5)) );
									}
								}
							res.json({ your_queue_position: your_queue_position });
							});
	
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	
	

module.exports = router;



