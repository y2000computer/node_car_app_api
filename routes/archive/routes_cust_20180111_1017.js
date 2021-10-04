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
const Cust_Request_Before_Handler= require('../handler/Cust_Request_Before_Handler.js');	
const Cust_Request_WorkFlow_Router_Handler= require('../handler/Cust_Request_WorkFlow_Router_Handler.js');	


const env = process.env.NODE_ENV || 'development';
const logDir = '../log/route_cust';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
	// colorize the output to the console
	//
	//new (winston.transports.Console)({
	//  timestamp: tsFormat,
	//  colorize: true,
	//  level: 'info'
	//}),
	//
	new (require('winston-daily-rotate-file'))({
	  filename: `${logDir}/routes_cust_`,
	  timestamp: tsFormat,
	  datePattern: 'yyyy_MM_dd.log',
	  prepend: false,
	  level: env === 'development' ? 'verbose' : 'info'
	})
  ]
});

	

	
router.route('/registration')
    .put(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];

        if (! j.email) { err.push('cust_reg_email'); }
        if (! j.email) { err.push('cust_reg_email'); }
        if (! j.last_name) { err.push('cust_reg_lastname'); }
        if (! j.last_name) { err.push('cust_reg_lastname'); }
        if (! j.mobile_country_code) { err.push('cust_reg_mcc'); }
        if (! j.mobile) { err.push('cust_reg_mobile'); }
        if (! j.language_code) { err.push('cust_reg_langcode'); }
 		if (! j.facebook_id) { err.push('cust_reg_fb'); }
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');

 		var jData = {
				mobile_token: j.token,
				email: j.email,
				facebook_id: j.facebook_id,
				last_name: j.last_name,
				first_name: j.first_name,
				language_code: j.language_code,
				grade_sub_code: 'NORMAL_RESERVED',
				create_datetime: Now,
				last_modify_datetime: Now		
			};
	 		var jMobileData = {
				mobile_country_code: j.mobile_country_code,
				mobile: j.mobile
			};	

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Registration_Insert(jData, jMobileData, function(insertId) {
				if(global.debug)  console.log('dump insertId: ' + insertId);
				 res.json({ result: true });
			});

			
		
		
    });
	
	

router.route('/data/basic')
    .post(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Basic_Select(req, function(data) {
					/*
					var j  = {
								"result": true,
								"user_type": data[0].user_type,
								"user_id":  data[0].user_id,
								"email": data[0].email,
								"facebook_id": data[0].facebook_id,
								"last_name": data[0].last_name,
								"first_name": data[0].first_name,
								"language_code": data[0].language_code,
								"status": (data[0].status == 1 ? true : false),
								"create_datetime": data[0].create_datetime,
								"ready_for_tour": (data[0].ready_for_tour == 1 ? true : false),
								"mobile_id": data[0].mobile_id,
								"mobile_country_code": data[0].mobile_country_code,
								"mobile": data[0].mobile
								};	
						*/

					if(data.length > 0) {
						var j  = {
									"result": true,
									"user_type": data[0].user_type,
									"user_id":  data[0].user_id,
									"email": data[0].email,
									"facebook_id": data[0].facebook_id,
									"last_name": data[0].last_name,
									"first_name": data[0].first_name,
									"language_code": data[0].language_code,
									"status": (data[0].status == 1 ? true : false),
									"create_datetime": data[0].create_datetime,
									"ready_for_tour": (data[0].ready_for_tour == 1 ? true : false),
									"mobile_id": data[0].mobile_id,
									"mobile_country_code": data[0].mobile_country_code,
									"mobile": data[0].mobile
									};	
						} else {
						var j  = {
									"result": false,
									"user_type": null,
									"user_id":  null,
									"email": null,
									"facebook_id": null,
									"last_name": null,
									"first_name": null,
									"language_code": null,
									"status": null,
									"create_datetime": null,
									"ready_for_tour": null,
									"mobile_id": null,
									"mobile_country_code": null,
									"mobile": null
									};	
					
					}
									
					res.json(j);
				});		
		
    })	
	
    .patch(function (req, res, next) {

   		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		var j = req.body;
        var err = [];
			
        if (! j.last_name) { err.push('cust_reg_lastname'); }
        if (! j.first_name) { err.push('cust_reg_lastname'); }
        if (! j.email) { err.push('cust_reg_email'); }
        if (! j.language_code) { err.push('cust_reg_langcode'); }
        if (! j.mobile_country_code) { err.push('cust_reg_mcc'); }
        if (! j.mobile) { err.push('cust_reg_mobile'); }
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		
 		var jData = {
				token: j.token,
				last_name: j.last_name,
				first_name: j.first_name,
				email: j.email,
				language_code: j.language_code,
				mobile_country_code: j.mobile_country_code,
				mobile: j.mobile,
				last_modify_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Basic_Update(jData, function() {
				 res.json({ result: true });
			});

			


    });	


	
	
router.route('/data/credit_card')
    .put(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
		
        if (! j.brand) { err.push('cust_credit_brand'); }
        if (! j.number) { err.push('cust_credit_card'); }
        if (! j.name) { err.push('cust_credit_name'); }
        if (! j.security_no) { err.push('cust_credit_snum'); }
        if (! j.expiry) { err.push('cust_credit_expiry'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		var jData = {
				token: j.token,
				brand: j.brand,
				number: j.number,
				name: j.name,
				security_no: j.security_no,
				expiry: j.expiry,
				default_is: (j.default ? 1 : 0),
				create_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Credit_Card_Black_List_Is(jData, function(black_list_found_is) {
			console.log('black_list_found_is=' + black_list_found_is);

			if(black_list_found_is == true ) {
					res.json({ result: false });
			} else {
					if(j.default == 1) {
						var record = dmOMS.Cust_Credit_Card_Remove_Default_Update(jData, function() {
							var record = dmOMS.Cust_Credit_Card_Insert(jData, function() {
									 res.json({ result: true });
								});
							});
					
					} else {
						var record = dmOMS.Cust_Credit_Card_Insert(jData, function() {
								 res.json({ result: true });
							});
						}		
				}
			});	
			
			
    })
	
    .patch(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		var j = req.body;
        var err = [];
			
        if (! j.id) { err.push('cust_credit_id'); }
        if (! j.brand) { err.push('cust_credit_brand'); }
        if (! j.number) { err.push('cust_credit_card'); }
        if (! j.name) { err.push('cust_credit_name'); }
        if (! j.security_no) { err.push('cust_credit_snum'); }
        if (! j.expiry) { err.push('cust_credit_expiry'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		var jData = {
				token: j.token,
				id: j.id,
				brand: j.brand,
				number: j.number,
				name: j.name,
				security_no: j.security_no,
				expiry: j.expiry,
				default_is: (j.default ? 1 : 0),
				last_modify_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		if(j.default == 1) {
			var record = dmOMS.Cust_Credit_Card_Remove_Default_Update(jData, function() {
				var record = dmOMS.Cust_Credit_Card_Update(jData, function() {
						 res.json({ result: true });
					});
				});
		
		} else{
			var record = dmOMS.Cust_Credit_Card_Update(jData, function() {
					 res.json({ result: true });
				});
		
		}

    })

    .delete(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
			
        if (! j.id) { err.push('cust_credit_id'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		var jData = {
				token: j.token,
				id: j.id,
				last_modify_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Credit_Card_Disable(jData, function() {
				 res.json({ result: true });
			});



    })

    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Credit_Card_List(req, function(data) {
				var list = [];
				if( data.length == 0) {
					var jData = {
							id: null,
							brand: 'N/A',
							number: 'N/A',
							name: 'N/A',
							expiry: 'N/A',
							default: true,
							reject_lock_is: true
							};		
						list.push(jData);
						
				} else {
					for (var i = 0; i < data.length; i++) {
						list.push(data[i]);
						list[i].default  =  list[i].default == 1 ? true : false
						list[i].reject_lock_is  =  list[i].reject_lock_is == 1 ? true : false
					}
				}
				res.json({ list: list });
				});		
		
    });	
	

	
router.route('/data/profile')
    .get(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Profile_Master_List_All(function(data) {
					res.json({ list: data });
				});		

        })

    .put(function (req, res) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
	
		if (! j.email) { err.push('cust_profile_email'); }
	    if (! regex.IsBoolean(j.weekly)) { err.push('cust_profile_weekly'); }
	    if (! regex.IsBoolean(j.monthly)) { err.push('cust_profile_monthly'); }
	    if (! j.card_id) { err.push('cust_credit_id_null'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		j.weekly = (j.weekly == true ? 1 : 0);
		j.monthly = (j.monthly == true ? 1 : 0);
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		var jData = {
				token: j.token,
				email: j.email,
				weekly: j.weekly,
				monthly: j.monthly,
				card_id: j.card_id,
				create_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Profile_Insert(jData, function() {
				 res.json({ result: true });
			});

			
    })

    .patch(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
	
		if (! j.email) { err.push('cust_profile_email'); }
	    if (! regex.IsBoolean(j.weekly)) { err.push('cust_profile_weekly'); }
	    if (! regex.IsBoolean(j.monthly)) { err.push('cust_profile_monthly'); }
	    //if (! j.card_id) { err.push('cust_credit_id_null'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		j.weekly = (j.weekly == true ? 1 : 0);
		j.monthly = (j.monthly == true ? 1 : 0);
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		/*
		var jData = {
				token: j.token,
				email: j.email,
				weekly: j.weekly,
				monthly: j.monthly,
				card_id: j.card_id,
				last_modify_datetime: Now
			};
		*/			
 		var jData = {
				token: j.token,
				email: j.email,
				weekly: j.weekly,
				monthly: j.monthly,
				card_id: j.card_id,
				last_modify_datetime: Now
			};
			
		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Profile_Update(jData, function() {
				 res.json({ result: true });
			});

			
    })
	
	
    .delete(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
			
        if (! j.token)  { res.json({ result: false, error: err }); return; } 
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
 		var jData = {
				token: j.token,
				last_modify_datetime: Now
			};

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Profile_Disable(jData, function() {
				 res.json({ result: true });
			});



    })	
	
    .post(function (req, res, next) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		
        if (! req.body.token)  { res.json({ result: false, error: err }); return; } 
	
		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Credit_Default_Select(req, function(personal_data) {
			var record = dmOMS.Cust_Profile_Credit_Select(req, function(corp_data) {

				if(! corp_data[0]) {
					var j  = {
								  "PERSONAL": {
									"email": (personal_data.length>0 ? personal_data[0].email : null),
									"card": {
										  "id": (personal_data.length>0 ? personal_data[0].id : null),
										  "brand": (personal_data.length>0 ? personal_data[0].brand : null),
										  "number": (personal_data.length>0 ? personal_data[0].number : null),
										  "name": (personal_data.length>0 ? personal_data[0].name : null),
										  "expiry": (personal_data.length>0 ? personal_data[0].expiry : null),
										  "default": true
												}
											}
								};
				}
				
				if(corp_data[0]) {
					var j  = {
								  "PERSONAL": {
									"email":  (personal_data[0].email ? personal_data[0].email : null),
									"card": {
										  "id": personal_data[0].id,
										  "brand": personal_data[0].brand,
										  "number": personal_data[0].number,
										  "name": personal_data[0].name,
										  "expiry": personal_data[0].expiry,
										  "default": true
												}
											  },
											  "CORPORATION": {
												"email": corp_data[0].email,
												"profile_id": corp_data[0].profile_id,
												"weekly":  (corp_data[0].weekly == 1 ? true : false),
												"monthly": (corp_data[0].monthly == 1 ? true : false),
												"card": {
												  "id": corp_data[0].id,
												  "brand": corp_data[0].brand,
												  "number": corp_data[0].number,
												  "name": corp_data[0].name,
												  "expiry": corp_data[0].expiry,
												  "default": true
												}
											  }
											};
				}

				
					res.send(j);
							});	

				});		

  

    });
	
	
	
router.route('/login')	
   .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];
	
		if (! j.facebook_id) { err.push('cust_reg_fb'); }
		
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var dmOMS = new OMS_Cust_Model();
		var record = dmOMS.Cust_Login(req, function(data) {
				if(data.length == 0 )  { 
					 err.push('cust_login_fail'); 
					 res.json({ result: false, error: err }); return;
					 }
					 res.json({ result: true }); return;
				});
				
			
    });
 


 router.route('/request/before')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		
		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.grade_sub_code) return res.json({Error: "Missing grade_sub_code"}); 
		if (!req.body.pickup.lat) return res.json({Error: "Missing pickup.lat"}); 
		if (!req.body.pickup.lng) return res.json({Error: "Missing pickup.lng"}); 
		//if (!req.body.gapi.km) return res.json({Error: "Missing gapi.km"}); 
		//if (!req.body.gapi.minute) return res.json({Error: "Missing gapi.minute"}); 
		if (req.body.gapi.km == undefined) return res.json({Error: "Missing gapi.km"}); 
		if (!req.body.gapi.minute == undefined) return res.json({Error: "Missing gapi.minute"}); 

		
		
		var jData = {
				  "token": req.body.token,
				  "grade_sub_code": req.body.grade_sub_code,
				  "pickup": {
					"eng": req.body.pickup.eng,
					"chn": req.body.pickup.chn,
					"lat": req.body.pickup.lat,
					"lng": req.body.pickup.lng
				  },
				  "gapi": {
					"km": req.body.gapi.km,
					"minute": req.body.gapi.minute
				  }
				};

		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
				
		//console.log(jData);		
		var handler = new Cust_Request_Before_Handler();
		var record = handler.Search_Driver(jData, function(data) {
				var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
				logger.info(currentDate + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl + '> Response:  ' + '{ result: true }');	
				res.json(data); 
				return;
				});


	
    });

	

	
 router.route('/request/start')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		
		var simulation_is = false;
		
		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.profile_code) return res.json({Error: "Missing profile_code"}); 
		if (!req.body.grade_sub_code) return res.json({Error: "Missing grade_sub_code"}); 
		if (!req.body.pickup.lat) return res.json({Error: "Missing pickup.lat"}); 
		if (!req.body.pickup.lng) return res.json({Error: "Missing pickup.lng"}); 
		if (!req.body.drop.lat) return res.json({Error: "Missing drop.lat"}); 
		if (!req.body.drop.lng) return res.json({Error: "Missing drop.lng"}); 
		if (!req.body.gapi.km) return res.json({Error: "Missing gapi.km"}); 
		if (!req.body.gapi.minute) return res.json({Error: "Missing gapi.minute"}); 
		if (!req.body.simulation_is) simulation_is = true;
		if (req.body.simulation_is==true) simulation_is =true;
		if (req.body.simulation_is==false) simulation_is = false;
		
			
		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
				"middle_core_server": global.api_server_domain,
				"middle_slave_server": global.middle_slave_api_server_domain,
			    "mobile_token": req.body.token,
				"profile_code":  req.body.profile_code,
				"grade_sub_code":  req.body.grade_sub_code,
				"pickup_location_eng": req.body.pickup.eng,
				"pickup_location_chn": req.body.pickup.chn,
				"pickup_latitude": req.body.pickup.lat,
				"pickup_longitude": req.body.pickup.lng,
				"drop_location_eng": req.body.drop.eng,
				"drop_location_chn": req.body.drop.chn,
				"drop_latitude": req.body.drop.lat,
				"drop_longitude": req.body.drop.lng,
				"simulation_is": simulation_is,
				"state_code": "01_DRIVER_MATCHING",
				"wf_driver_matching_datetime": Now,
				"create_datetime": Now,
				"last_modify_datetime": Now
				};
	
		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
		
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Insert(jData, function(insertId) {
				var rw = new Cust_Request_WorkFlow_Router_Handler();
				var record = rw.Load_New_Request(insertId, function() {
					//sleep(50);  //50 milliseconds  
					//sleep(500);  //500 milliseconds  1 sec
					//sleep(3000);  //3000 milliseconds  3 sec
					//sleep(4000);  //4000 milliseconds  4 sec
					var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
					logger.info(currentDate + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl + '> Response:  ' + '{ result: true }');	
					res.json({ result: true });
					});					
			});

			
    })	


 router.route('/request/start_test')
    .get(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'n/a', function() {});		
		

		var jData = {
				  "token": "6cff00a83742a60e469348b7c2d47a39",
				  "grade_sub_code": "HK_CAR_BLACK_SEAT_4",
				  "pickup": {
					"eng": "empty",
					"chn": "九龍灣常悅道21號",
					"lat": 22.322307,
					"lng": 114.211445
				  },
				  "gapi": {
					"km": 25.47,
					"minute": 31.62
				  }
				};
	
		//console.log(jData);		
		var handler = new Cust_Request_Before_Handler();
		var record = handler.Search_Driver(jData, function(data) {
				var Now = moment().format('YYYY-MM-DD H:mm:ss');

				var jData = {
						"middle_core_server": global.api_server_domain,
						"middle_slave_server": global.middle_slave_api_server_domain,
						"mobile_token": "6cff00a83742a60e469348b7c2d47a39",
						"profile_code":  "PERSONAL",
						"grade_sub_code":  "HK_CAR_BLACK_SEAT_4",
						"pickup_location_eng": "empty",
						"pickup_location_chn": "九龍灣常悅道21號",
						"pickup_latitude": 22.322307,
						"pickup_longitude": 114.211445,
						"drop_location_eng": "empty",
						"drop_location_chn": "大埔翠和里",
						"drop_latitude": 22.4524029,
						"drop_longitude": 114.1619228,
						"simulation_is": "false",
						"state_code": "01_DRIVER_MATCHING",
						"wf_driver_matching_datetime": Now,
						"create_datetime": Now,
						"last_modify_datetime": Now
						};
						
				//console.log(jData);		
				var dmOMS = new OMS_Cust_Request_Model();
				var record = dmOMS.Cust_Request_Insert(jData, function(insertId) {
						var rw = new Cust_Request_WorkFlow_Router_Handler();
						var record = rw.Load_New_Request(insertId, function() {
							res.json({ result: true });
							});					
					});

		
				});


			
    })	
	
 router.route('/request/status')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
				
		//var driver = new Object;
		//var yacht = new Object;
		//driver = null;
		//yacht = null;
        //sleep(500);  //500 milliseconds  0.5 sec
		//sleep(1000);  //1000 milliseconds  1 sec
		//sleep(2000);  //1000 milliseconds  2 sec  //remove at 10 Nov 2017 for test need restore at PROD
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"ranking": req.body.ranking,
				"create_datetime": Now
				};

		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate  + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
			
		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Master_Model_Cache.List_All(function(data) {
			if(data.length>0) donation_is = data[0].donation_is;
			var dmOMS = new OMS_Cust_Request_Model();
			var record = dmOMS.Last_Request_Id_Select(jData, function(result) {
					var jData = {
						"mobile_token": req.body.token,
						"request_id":result,
						"donation_is":donation_is
						};
					console.log('/request/status -> request_id ' + result);
			
					var rw = new Cust_Request_WorkFlow_Router_Handler();
					var record = rw.Status_Request_Enquiry(jData, function(driver) {
							var s ={
											"driver": driver,
											"yacht": null
										};
							var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							logger.info(currentDate  + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl +'> Response:  ' + JSON.stringify(s, null, 2));
							res.json({
										"driver": driver,
										"yacht": null
									});
							});					
				});
		});		
				
    });		


	

router.route('/request/change-location')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.drop.lat) return res.json({Error: "Missing drop.lat"}); 
		if (!req.body.drop.lng) return res.json({Error: "Missing drop.lng"}); 
	
		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"drop_location_eng": req.body.drop.eng,
				"drop_location_chn": req.body.drop.chn,
				"drop_latitude": req.body.drop.lat,
				"drop_longitude": req.body.drop.lng,
				"create_datetime": Now
				};
				

		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
				
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Change_Location_Insert(jData, function(result) {
				var rw = new Cust_Request_WorkFlow_Router_Handler();
				var record = rw.Change_Drop_Location_UpdateCache(jData, function(result) {
							var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							logger.info(currentDate + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl + '> Response:  ' + '{ result: true }');	
							 res.json({ result: true });
					});
			});

			
    })	



router.route('/request/change-profile')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.profile_code) return res.json({Error: "Missing profile_code"}); 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"profile_code": req.body.profile_code,
				"create_datetime": Now
				};
				
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Profile_Update(jData, function(result) {
				var rw = new Cust_Request_WorkFlow_Router_Handler();
				var record = rw.Change_Profile_UpdateCache(jData, function(result) {
							 res.json({ result: true });
					});
			});

			
    });		

	
	
router.route('/request/assess')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.ranking) return res.json({Error: "Missing ranking"}); 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"ranking": req.body.ranking,
				"create_datetime": Now
				};
				
		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
				
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Assess_Update(jData, function(result) {
				var jData = {
					"mobile_token": req.body.token,
					"ranking": req.body.ranking,
					"request_id":result,
					"create_datetime": Now
					};
				var rw = new Cust_Request_WorkFlow_Router_Handler();
				var record = rw.Cust_Assess_Driver_UpdateCache(jData, function(result) {
							var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							logger.info(currentDate + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl + '> Response:  ' + '{ result: true }');	
							 res.json({ result: true });
					});
			});

			
    });	
	
	
	
router.route('/request/cancel')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"create_datetime": Now
				};
				
				
		var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
		logger.info(currentDate + '< Source IP: '+ req.ip + ' <  req.originalUrl:'+req.originalUrl +'< Request: ' + JSON.stringify(jData, null, 2));	
				
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Cancel_Update(jData, function(result) {
				var jData = {
					"mobile_token": req.body.token,
					"ranking": req.body.ranking,
					"request_id":result,
					"create_datetime": Now
					};
				var record = dmOMS.Driver_Online_Handshaking_Clear_Update(result, function(result) {});
				var rw = new Cust_Request_WorkFlow_Router_Handler();
				var record = rw.Cust_Cancel_UpdateCache(jData, function(result) {
							var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							logger.info(currentDate + ' > Source IP: ' + req.ip + ' > ' + req.originalUrl + '> Response:  ' + '{ result: true }');	
							 res.json({ result: true });
					});
			});

			
    });	



router.route('/request/driver-info')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.driver_user_id) return res.json({Error: "Missing driver_user_id"}); 

		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Driver_Info_Select(req, function(result) {
				 res.json(result);
			});
			
    });		
	
	

router.route('/request/registration-info')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.registration_id) return res.json({Error: "Missing registration_id"}); 

		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Registration_Info_Select(req, function(result) {
				 res.json(result);
			});
			
    });		
	

router.route('/request/driver-registration-info')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 
		if (!req.body.driver_user_id) return res.json({Error: "Missing driver_user_id"}); 
		if (!req.body.registration_id) return res.json({Error: "Missing registration_id"}); 

		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Driver_Info_Select(req, function(resultDriver) {
			var record = dmOMS.Registration_Info_Select(req, function(resultCar) {
				
				var jData = {
						"driver_user_id" : req.body.driver_user_id ,  
						"last_name": (resultDriver.length>0 ? resultDriver[0].last_name : null),
						"first_name": (resultDriver.length>0 ? resultDriver[0].first_name : null),
						"mobile_country": (resultDriver.length>0 ? resultDriver[0].mobile_country : null),
						"mobile": (resultDriver.length>0 ? resultDriver[0].mobile : null),
						"driver_picture": (resultDriver.length>0 ? resultDriver[0].picture : null),
						"registration_id" : req.body.registration_id ,
						"grade_sub_code": (resultCar.length>0 ? resultCar[0].grade_sub_code : null),
						"grade_code": (resultCar.length>0 ? resultCar[0].grade_code : null),
						"sub_grade_name_eng": (resultCar.length>0 ? resultCar[0].sub_grade_name_eng : null),
						"sub_grade_name_chn": (resultCar.length>0 ? resultCar[0].sub_grade_name_chn : null),
						"max_passenger": (resultCar.length>0 ? resultCar[0].max_passenger : null),
						"brand_code": (resultCar.length>0 ? resultCar[0].brand_code : null),
						"model_code": (resultCar.length>0 ? resultCar[0].model_code : null),
						"registration_mark": (resultCar.length>0 ? resultCar[0].registration_mark : null),
						"colour": (resultCar.length>0 ? resultCar[0].colour : null)
						};
					 res.json(jData);
				});
			});
			
    });		
	
	
router.route('/request/donation')
    .post(function (req, res, next) {

 		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_heavy_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

		if (!req.body.token) return res.json({Error: "Missing Token"}); 

		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var jData = {
			    "mobile_token": req.body.token,
				"donation_amount": req.body.donation_amount,
				"create_datetime": Now
				};
				
		//console.log(jData);		
		var dmOMS = new OMS_Cust_Request_Model();
		var record = dmOMS.Cust_Request_Donation_Update(jData, function(result) {
					 res.json({ result: true });
			});

			
    });	
	
	
	
module.exports = router;



