//NPM Library
const moment= require('moment');
const async = require('async');
const winston = require('winston');
const fs = require('fs');
const sleep = require('system-sleep');


//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	


//Data Model
const OMS_Cust_Request_WorkFlow_Model= require('../model/OMS_Cust_Request_WorkFlow_Model.js');	


//Handler
const Cust_Request_WorkFlow_Matching_Handler= require('../handler/Cust_Request_WorkFlow_Matching_Handler.js');	


function Cust_Request_WorkFlow_Handler(){
    
	//constructor
	var RW_RMDT = global.RW_RMDT			//Request match driver timeout Unit: second
	var RW_DGPICKLT = global.RW_DGPICKLT 	//Driver goto pickup location timeout Unit: second
	var RW_DGDROPLT = global.RW_DGDROPLT	//Driver goto drop location timeout Unit: second
	var RW_DACKOT =global.RW_DACKOT			//Driver acknowlege order timeout Unit: second
	var RW_MAXDRVDISTANCE = global.RW_MAXDRVDISTANCE   	//Max driver distance to pickup location Unit: KM
	var RW_CLEARQUEUE = global.RW_CLEARQUEUE			// Max clearing working queue interval Unit: Sec (Development)
	var RW_MAX_CACHE = global.RW_MAX_CACHE	//Max no. of request on cache queue
    var driver_handshaking_pool =[];    //Request workflow dynamic queue
	
	//global.request_queue =[] have to define at startup app.js
	
	var dmOMS = new OMS_Cust_Request_WorkFlow_Model();
	var gps = new GPS();

	var handleDriverMatching = new Cust_Request_WorkFlow_Matching_Handler();
	
	const env = process.env.NODE_ENV || 'development';
	const logDir = './log/request_workflow';

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
		  filename: `${logDir}/request_workflow_`,
		  timestamp: tsFormat,
		  datePattern: 'yyyy_MM_dd.log',
		  prepend: false,
		  level: env === 'development' ? 'verbose' : 'info'
		})
	  ]
	});
	
	
	this.Load_Unclosed_Request = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Load_Unclosed_Request');

	//console.log(data);
	
	var record = dmOMS.List_Unclosed_Request(function(data) {
		
				for (var i = 0; i < data.length; i++) {
					var cust = {
								id: data[i].cust_user_id,
								profile_code: data[i].profile_code,
								direction: null,
								geo: {
									lat: null,
									lng: null
								}
							};
							
					var driver = {
								id: (data[i].driver_user_id ==null ? null : data[i].driver_user_id) ,
								registration_id:  (data[i].registration_id ==null ? null : data[i].registration_id) , 
								geo: {
									lat: null,
									lng: null
								}
							};


					var pickup = {
								eng: (data[i].pickup_location_eng ==null ? null : data[i].pickup_location_eng) ,
								chn:  (data[i].pickup_location_chn ==null ? null : data[i].pickup_location_chn) , 
								lat:  (data[i].pickup_latitude ==null ? null : data[i].pickup_latitude) , 
								lng:  (data[i].pickup_longitude ==null ? null : data[i].pickup_longitude)  ,
								estimated_min_arrive:  0,
								district: {
									id: (data[i].pickup_district_id ==null ? null : data[i].pickup_district_id)  ,
									eng: (data[i].district_name_eng ==null ? null : data[i].district_name_eng) ,
									chn:  (data[i].district_name_chn ==null ? null : data[i].district_name_chn)  
								},
								region: {
									code: (data[i].region_code ==null ? null : data[i].region_code)  ,
									eng: (data[i].region_name_eng ==null ? null : data[i].region_name_eng) ,
									chn:  (data[i].region_name_chn ==null ? null : data[i].region_name_chn) , 
									stream_code:  (data[i].stream_code ==null ? null : data[i].stream_code) 
								}					
							};
							
	
					var drop = {
								eng: (data[i].drop_location_eng ==null ? null : data[i].drop_location_eng) ,
								chn:  (data[i].drop_location_chn ==null ? null : data[i].drop_location_chn) , 
								lat:  (data[i].drop_latitude ==null ? null : data[i].drop_latitude) , 
								lng:  (data[i].drop_longitude ==null ? null : data[i].drop_longitude)  ,
								district: {
									id: (data[i].pickup_district_id ==null ? null : data[i].drop_district_id)  ,
									eng: (data[i].district_name_eng ==null ? null : data[i].drop_district_name_eng) ,
									chn:  (data[i].district_name_chn ==null ? null : data[i].drop_district_name_chn)  
								}
							};	

					var gapi = {
								km: (data[i].gapi_km ==null ? null : data[i].gapi_km) ,
								minute:  (data[i].gapi_minute ==null ? null : data[i].gapi_minute) 
							};	


					var fee = {
								currency_code: data[i].currency_code ,
								start_up: data[i].fee_start_up ,
								min_charge: data[i].fee_min_charge ,
								per_km: data[i].fee_per_km ,
								per_min: data[i].fee_per_min ,
								extra: {
									reason: data[i].extra_reason  ,
									code: data[i].extra_code ,
									rate:  data[i].extra_rate, 
									desc: {
										eng: data[i].extra_desc_eng ,
										chn:  data[i].extra_desc_chn, 
										time_eng: data[i].extra_desc_time_eng ,
										time_chn: data[i].extra_desc_time_chn
									}
								}
							};	


					var estimated = {
								min: data[i].estimated_min ,
								max: data[i].estimated_max 
							};	


					var workflow = {
								wf_driver_matching_datetime: data[i].wf_driver_matching_datetime, 
								wf_driver_matched_datetime: data[i].wf_driver_matched_datetime, 
								wf_driver_goto_pickup_datetime: data[i].wf_driver_goto_pickup_datetime, 
								wf_driver_arrive_pickup_datetime: data[i].wf_driver_arrive_pickup_datetime, 
								wf_driver_goto_drop_datetime: data[i].wf_driver_goto_drop_datetime, 
								wf_driver_arrive_drop_datetime: data[i].wf_driver_arrive_drop_datetime, 
								wf_driver_assess_cust_datetime: data[i].wf_driver_assess_cust_datetime, 
								wf_cust_assess_driver_datetime: data[i].wf_cust_assess_driver_datetime, 
								wf_closed_datetime: data[i].wf_closed_datetime, 
								wf_closed_route_complete_datetime: data[i].wf_closed_route_complete_datetime, 
								wf_closed_driver_not_available_datetime: data[i].wf_closed_driver_not_available_datetime, 
								wf_closed_driver_pickup_timeout_datetime: data[i].wf_closed_driver_pickup_timeout_datetime, 
								wf_closed_driver_drop_timeout_datetime: data[i].wf_closed_driver_drop_timeout_datetime, 
								wf_closed_driver_cancel_request_datetime: data[i].wf_closed_driver_cancel_request_datetime, 
								wf_closed_cust_cancel_request_datetime: data[i].wf_closed_cust_cancel_request_datetime, 
								wf_closed_oms_cancel_request_datetime: data[i].wf_closed_oms_cancel_request_datetime, 
								create_datetime: data[i].create_datetime,
							};	
							

					var nearly_driver = {
								create_datetime: null ,
								driver_user_id: null ,
								registration_id: null ,
								geo: {
									lat: null,
									lng: null
								},
								nearly_driver_history: null ,
								matching_timer: null 
							};	


					var simulation = {
								simulation_is: data[i].simulation_is ,
								driver_after_matched_timer: null ,
								driver_goto_pickup_timer: null ,
								driver_arrive_pickup_timer: null ,
								driver_goto_drop_timer: null ,
								driver_arrive_drop_timer: null 
							};								

							
					var request = {
								id: data[i].request_id ,
								grade_code: data[i]. grade_code,
								grade_sub_code: data[i]. grade_sub_code,
								fee: fee,
								estimated: estimated,
								status: {
									code: data[i].state_code
								},
								workflow: workflow,
								nearly_driver: nearly_driver,
								simulation: simulation
							};	
							
							
					var element = {
								//Request identity
								request_id: data[i].request_id,
								middle_core_server: data[i].middle_core_server,
								middle_slave_server: data[i].middle_slave_server,
								mobile_token: data[i].mobile_token,
								grade_sub_code: data[i].grade_sub_code,
								profile_code: data[i].profile_code,
								cust: cust,
								driver: driver,
								pickup: pickup,
								drop: drop,
								gapi: gapi,
								request: request
							};
							
					global.request_queue.push(element);		

				}	//for (var i = 0; i < data.length; i++) {	
			
			callback();
			});		

			
	};  //this.Load_Unclosed_Request = function(callback){
	

	
	this.List_All_Unclosed_Request = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List_All_Unclosed_Request');
	
		//for (var i = 0, len = global.request_queue.length; i < len; i++) {
		for (var i = 0; i < RW_MAX_CACHE; i++) {
		  //console.log(global.request_queue[i]);	 
		  }
		callback();
	
	}; //this.List_All_Unclosed_Request = function(callback){
		

		
	this.Workflow_Start = function(callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Workflow_Start');
	
		//for (var i = 0, len = global.request_queue.length; i < len; i++) {
		//logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
		
		var number_of_working_queue = 0;
		for (var i = 0; i < RW_MAX_CACHE; i++) {
		  if(global.request_queue[i]!=undefined  && global.request_queue[i]!=null) {
			  ++number_of_working_queue;
			}
		};
		//logger.info('number_of_working_queue =' + number_of_working_queue);	
		
		for (var i = 0; i < RW_MAX_CACHE; i++) {
		  if(global.request_queue[i]!=undefined  && global.request_queue[i]!=null) {
				//console.log('element[request_id]: ' + global.request_queue[i].request_id);	 
				//logger.info('element['+i+'].request_id=' + global.request_queue[i].request_id);
				var record = this.Workflow_Start_Waterfall(i, function(data) {});	
				if  (global.request_queue[i].request.status.code == "01_DRIVER_MATCHING" ) {
						sleep(10);  //10 milliseconds
				}
				
			}
		};  

		callback();
	
	}; //this.Workflow_Start = function(callback){
		
		
	this.Workflow_Start_Waterfall = function(seq, callback){
		
	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Workflow_Start_Waterfall');
		
		//if(global.debug) console.log('pooling seq='+seq+ '> executed Workflow_Start_Waterfall ' +  new Date());
	

		/************************************************************/
		/***water fall routine***************************************/
		/************************************************************/
		async.waterfall([
		  function(callback){
			//if(global.debug) console.log('execute seq(01)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (global.request_queue[seq].request.workflow.wf_closed_route_complete_datetime &&
					global.request_queue[seq].request.workflow.wf_cust_assess_driver_datetime &&
					global.request_queue[seq].request.workflow.wf_driver_assess_cust_datetime) {
					//console.log('seq(01) is true');
					global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(02)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime ||
					global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime ||
					global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					//console.log('seq(02) is true');
					global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
					if (global.request_queue[seq].driver.id) {
						var record = dmOMS.Driver_Online_Active_Update(global.request_queue[seq].driver.id, function() {});	
						var index = driver_handshaking_pool.indexOf(global.request_queue[seq].driver.id);
						if(index > -1) driver_handshaking_pool.splice(index, 1);
					}
					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(03)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (global.request_queue[seq].request.workflow.wf_closed_driver_not_available_datetime ) {
					//console.log('seq(03) is true');
					global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(04)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (global.request_queue[seq].request.workflow.wf_closed_driver_pickup_timeout_datetime ) {
					//console.log('seq(04) is true');
					global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(05)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (global.request_queue[seq].request.workflow.wf_closed_driver_drop_timeout_datetime ) {
					//console.log('seq(05) is true');
					global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(06)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (! global.request_queue[seq].request.workflow.wf_driver_matched_datetime) {
						var ToCompare = global.request_queue[seq].request.workflow.create_datetime;
						var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
						//console.log('startDate=' +startDate);
						var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
						//console.log('endDate=' +endDate);
						var secondsDiff = moment(startDate).diff(endDate, 'seconds');
						//console.log('secondsDiff=' +secondsDiff);
						if(Math.round((secondsDiff*10)/10) > RW_RMDT ) {
							//console.log('seq(06) is true');
							global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
							var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
							global.request_queue[seq].request.workflow.wf_closed_driver_not_available_datetime = moment().format('YYYY-MM-DD H:mm:ss');
							global.request_queue[seq].request.status.code = "ERR_NO_DRIVER_AVAILABLE";
							var record = dmOMS.Driver_Not_Available_Update(global.request_queue[seq].request_id, function() {});		
							if(global.request_queue[seq].request.nearly_driver.driver_user_id) {
								//console.log('seq(06) breakpoint :nearly_driver =' + global.request_queue[seq].request.nearly_driver.driver_user_id);
								var jData = {
										request_id: global.request_queue[seq].request_id,
										driver_user_id: global.request_queue[seq].request.nearly_driver.driver_user_id
									};														
								var record = dmOMS.Driver_Acknowledge_Timeout_Update(jData, function() {});
								//console.log('seq(06) breakpoint :before remove driver from handshaking pool=' + driver_handshaking_pool);
								var index = driver_handshaking_pool.indexOf(global.request_queue[seq].request.nearly_driver.driver_user_id);
								//console.log('index=' + index);
								if(index > -1) driver_handshaking_pool.splice(index, 1);
								global.request_queue[seq].request.nearly_driver.driver_user_id = null;
								global.request_queue[seq].request.nearly_driver.create_datetime = null;
								global.request_queue[seq].request.nearly_driver.registration_id = null;
								global.request_queue[seq].request.nearly_driver.geo.lat = null;
								global.request_queue[seq].request.nearly_driver.geo.lng = null;
								//console.log('seq(06) breakpoint :after removed driver - driver_handshaking_pool =' + driver_handshaking_pool);
								logger.info('seq(06)  > driver_handshaking_pool =' + driver_handshaking_pool);	
								logger.info('seq(06)  > RW_RMDT : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
							}
							
						}

					}						
				}	
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(07)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (! global.request_queue[seq].request.workflow.wf_driver_matched_datetime ) {
						if (global.request_queue[seq].request.nearly_driver.driver_user_id) {
							var ToCompare = global.request_queue[seq].request.nearly_driver.create_datetime;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) > RW_DACKOT ) {
								//console.log('seq(07) is true');
								var jData = {
										request_id: global.request_queue[seq].request_id,
										driver_user_id: global.request_queue[seq].request.nearly_driver.driver_user_id
									};														
								var record = dmOMS.Driver_Acknowledge_Timeout_Update(jData, function() {});
								//console.log('seq(07) breakpoint :driver_handshaking_pool =' + driver_handshaking_pool);
								//console.log('seq(07) breakpoint :remove driver from handshaking pool=' + global.request_queue[seq].request.nearly_driver.driver_user_id);
								//console.log('seq(07) breakpoint-01 :nearly_driver =' + global.request_queue[seq].request.nearly_driver.driver_user_id);
								var index = driver_handshaking_pool.indexOf(global.request_queue[seq].request.nearly_driver.driver_user_id);
								//console.log('index=' + index);
								if(index > -1) driver_handshaking_pool.splice(index, 1);
								global.request_queue[seq].request.nearly_driver.driver_user_id = null;
								global.request_queue[seq].request.nearly_driver.create_datetime = null;
								global.request_queue[seq].request.nearly_driver.registration_id = null;
								global.request_queue[seq].request.nearly_driver.geo.lat = null;
								global.request_queue[seq].request.nearly_driver.geo.lng = null;
								//console.log('seq(07) breakpoint :after removed driver - driver_handshaking_pool =' + driver_handshaking_pool);
								logger.info('seq(06)  > driver_handshaking_pool =' + driver_handshaking_pool);	
								logger.info('seq(06)  > RW_DACKOT : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								

							}							
						}
					}
					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(08)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (! global.request_queue[seq].request.workflow.wf_driver_matched_datetime ) {
						if (! global.request_queue[seq].request.nearly_driver.driver_user_id) {
							var ToCompare = global.request_queue[seq].request.nearly_driver.matching_timer;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = ToCompare;
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) >= 2 || global.request_queue[seq].request.nearly_driver.matching_timer == null ) {
							//console.log('seq(08) is true');
								var filter_driver = '';
								if(global.request_queue[seq].request.nearly_driver.nearly_driver_history) filter_driver =  global.request_queue[seq].request.nearly_driver.nearly_driver_history;
								if(driver_handshaking_pool.length>0)   filter_driver = ( filter_driver ? filter_driver+','+driver_handshaking_pool : driver_handshaking_pool );

								logger.info('seq(08)  > Matching on progress : driver_handshaking_pool =' + driver_handshaking_pool);	
								logger.info('seq(08)  > Matching on progress : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
								logger.info('seq(08)  > Matching on progress : element['+seq+'] , filter_driver =' + filter_driver);								

								var ToCompare = global.request_queue[seq].request.workflow.create_datetime;
								var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								//console.log('startDate=' +startDate);
								var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
								//console.log('endDate=' +endDate);
								var secondsDiff = moment(startDate).diff(endDate, 'seconds');
								//console.log('secondsDiff=' +secondsDiff);
								var seek_dedicated_car_type = true;
								if(Math.round((secondsDiff*10)/10) > 60 ) { // > 60 seconds
									seek_dedicated_car_type = false;
								}
				
								var jData = {
										grade_sub_code:  global.request_queue[seq].request.grade_sub_code,
										region_code:  global.request_queue[seq].pickup.region.code,
										latitude: global.request_queue[seq].pickup.lat,
										longitude: global.request_queue[seq].pickup.lng,
										filter_driver_user_id: filter_driver,
										seek_dedicated_car_type: seek_dedicated_car_type
									};			

								/*			
								console.log('seq(8):driver_handshaking_pool =' + driver_handshaking_pool);
								console.log('seq(8):nearly_driver_history =' + global.request_queue[seq].request.nearly_driver.nearly_driver_history);
								console.log('seq(8):filter_driver =' + filter_driver);
								*/
								
								var latitude = 0;
								var longitude = 0;
								var gps_distance = 0;
								
								//handleDriverMatching
								var record = handleDriverMatching.driver_matching(driver_handshaking_pool, seq, jData, function(data) {
										//console.log('(08) request_id =' + global.request_queue[seq].request_id + ' running driver_matching');
						
									if(data.driver_user_id) {
										//console.log(data);
										/*
										console.log('(08) request_id =' + global.request_queue[seq].request_id + ' >matched > data.driver_user_id=' + data.driver_user_id);
										console.log('(08) request_id =' + global.request_queue[seq].request_id + ' >matched > data.registration_id=' + data.registration_id);
										console.log('(08) request_id =' + global.request_queue[seq].request_id + ' >matched > data.gps_latitude=' + data.gps_latitude);
										console.log('(08) request_id =' + global.request_queue[seq].request_id + ' >matched > data.gps_longitude=' + data.gps_longitude);
										*/
										//console.log('seq(08) break point');
										global.request_queue[seq].request.nearly_driver.driver_user_id = data.driver_user_id;
										global.request_queue[seq].request.nearly_driver.create_datetime = moment().format('YYYY-MM-DD H:mm:ss');
										global.request_queue[seq].request.nearly_driver.registration_id = data.registration_id;
										global.request_queue[seq].request.nearly_driver.geo.lat = data.gps_latitude;
										global.request_queue[seq].request.nearly_driver.geo.lng = data.gps_longitude;
										var h = global.request_queue[seq].request.nearly_driver.nearly_driver_history;
										global.request_queue[seq].request.nearly_driver.nearly_driver_history=( ! h ? data.driver_user_id : h+=','+data.driver_user_id );
										driver_handshaking_pool.push(data.driver_user_id);
										var jData = {
												request_id: global.request_queue[seq].request_id,
												driver_user_id:  data.driver_user_id,
												registration_id:  data.registration_id,
												driver_latitude:  data.gps_latitude,
												driver_longitude:  data.gps_longitude,
												driver_distance_km: data.driver_to_pickup_distance
											};														
										var record = dmOMS.Match_Driver_Insert(jData, function() {});
										logger.info('seq(08)  > Matching found one driver nearby : element['+seq+'].request_id=' + global.request_queue[seq].request_id + ' > driver_user_id =' + data.driver_user_id);					
										logger.info('seq(08)  > driver_handshaking_pool =' + driver_handshaking_pool);	
										
										global.request_queue[seq].request.nearly_driver.matching_timer = moment().format('YYYY-MM-DD H:mm:ss');
									} //if(data.driver_user_id >0) {
	
								
								});					

								/*
								var record = dmOMS.Nearly_Driver_Select(jData, function(data) {
										for (var i = 0; i < data.length; i++) {
											//console.log('seq(08) breakpoint :data[i].driver_user_id =' + data[i].driver_user_id);
											//console.log('seq(08) breakpoint :data[i].registration_id =' + data[i].registration_id);
											gps_distance  = gps.distance(global.request_queue[seq].pickup.lat, global.request_queue[seq].pickup.lng, data[i].gps_latitude, data[i].gps_longitude, 'K');
											if(gps_distance<=RW_MAXDRVDISTANCE) {   
												var index = driver_handshaking_pool.indexOf(data[i].driver_user_id);
												var h = global.request_queue[seq].request.nearly_driver.nearly_driver_history;
												if(  index == -1)  { // driver NOT found in driver_handshaking_pool;
													//console.log('seq(08) break point');
													global.request_queue[seq].request.nearly_driver.driver_user_id = data[i].driver_user_id;
													global.request_queue[seq].request.nearly_driver.create_datetime = moment().format('YYYY-MM-DD H:mm:ss');
													global.request_queue[seq].request.nearly_driver.registration_id = data[i].registration_id;
													global.request_queue[seq].request.nearly_driver.geo.lat = data[i].gps_latitude;
													global.request_queue[seq].request.nearly_driver.geo.lng = data[i].gps_longitude;
													var h = global.request_queue[seq].request.nearly_driver.nearly_driver_history;
													global.request_queue[seq].request.nearly_driver.nearly_driver_history=( ! h ? data[i].driver_user_id : h+=','+data[i].driver_user_id );
													driver_handshaking_pool.push(data[i].driver_user_id);
													var jData = {
															request_id: global.request_queue[seq].request_id,
															driver_user_id:  data[i].driver_user_id,
															registration_id:  data[i].registration_id,
															driver_latitude:  data[i].gps_latitude,
															driver_longitude:  data[i].gps_longitude,
															driver_distance_km: gps_distance
														};														
													var record = dmOMS.Match_Driver_Insert(jData, function() {});
													//console.log('seq(08) breakpoint :request_id='+global.request_queue[seq].request_id+' > found driver nearly driver');
													//console.log('seq(08) breakpoint :driver_handshaking_pool =' + driver_handshaking_pool);
													//console.log('seq(08) breakpoint :nearly_driver =' + global.request_queue[seq].request.nearly_driver.nearly_driver_history);
													//console.log('seq(08) breakpoint :driver_handshaking_pool =' + driver_handshaking_pool);
													//console.log('seq(08) beakpoint  :gps_distance<=RW_MAXDRVDISTANCE and no found at driver_handshaking_pool');
												}
									
											}	
											
										}
									});
									*/
										
							} //if(Math.round((secondsDiff*10)/10) >= 2 ) {
						}
					}
					
				}
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(09)');
			 if (global.request_queue[seq].request.simulation.simulation_is) {
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (! global.request_queue[seq].request.workflow.wf_driver_matched_datetime) {
				 	 if (global.request_queue[seq].request.nearly_driver.driver_user_id) {
						//console.log('seq(09) is true');
						//console.log('seq(09) breakpoint :request_id='+global.request_queue[seq].request_id);
						//console.log('seq(09) breakpoint :driver nearly driver=' +global.request_queue[seq].request.nearly_driver.driver_user_id);	
						global.request_queue[seq].request.workflow.wf_driver_matched_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
						global.request_queue[seq].request.status.code = "02_DRIVER_MATCHED";
						var record = dmOMS.Driver_Matched_Update(global.request_queue[seq].request_id, function() {});
						global.request_queue[seq].driver.id = global.request_queue[seq].request.nearly_driver.driver_user_id;
						global.request_queue[seq].driver.registration_id = global.request_queue[seq].request.nearly_driver.registration_id;
						global.request_queue[seq].driver.geo.lat = global.request_queue[seq].request.nearly_driver.geo.lat;
						global.request_queue[seq].driver.geo.lng = global.request_queue[seq].request.nearly_driver.geo.lng;
						var jData = {
								request_id: global.request_queue[seq].request_id,
								driver_user_id: global.request_queue[seq].request.nearly_driver.driver_user_id,
								registration_id: global.request_queue[seq].request.nearly_driver.registration_id
							};														
						var record = dmOMS.Driver_Acknowledge_Update(jData, function() {});
						var record = dmOMS.Driver_Online_Disable_Update(jData, function() {});
						var index = driver_handshaking_pool.indexOf(global.request_queue[seq].request.nearly_driver.driver_user_id);
						if(index > -1) driver_handshaking_pool.splice(index, 1);
						global.request_queue[seq].request.simulation.driver_after_matched_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
						//console.log('seq(09) breakpoint :request_id='+global.request_queue[seq].request_id);
						//console.log('seq(09) breakpoint :driver_after_matched_timer='+global.request_queue[seq].request.simulation.driver_after_matched_timer);
						logger.info('seq(09)  > driver_handshaking_pool =' + driver_handshaking_pool);	
						logger.info('seq(09)  > Matched : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
						
					 }
					}
				 }
				}
			}	
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(10)');
			 if (global.request_queue[seq].request.simulation.simulation_is) {
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime && 
						! global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime ) {
							//console.log('seq(10) breakpoint :request_id='+global.request_queue[seq].request_id);
							var ToCompare = global.request_queue[seq].request.simulation.driver_after_matched_timer;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = ToCompare;
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) >= 5 ) {
								//console.log('seq(10) is true');
								//console.log('seq(10) breakpoint :request_id='+global.request_queue[seq].request_id);
								global.request_queue[seq].request.status.code = "03_DRIVER_GOTO_PICKUP";
								global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								var record = dmOMS.Driver_Goto_Pickup_Update(global.request_queue[seq].request_id, function() {});
								global.request_queue[seq].request.simulation.driver_goto_pickup_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
								logger.info('seq(10)  > 03_DRIVER_GOTO_PICKUP : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
							}	

					}
				 }
				}
			}	
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(11)');
			 if (global.request_queue[seq].request.simulation.simulation_is) {
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime && 
						global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime &&
						! global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime ) {
							//console.log('seq(11) breakpoint :request_id='+global.request_queue[seq].request_id);
							var ToCompare = global.request_queue[seq].request.simulation.driver_goto_pickup_timer;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = ToCompare;
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) >= 1 ) {
								//console.log('seq(11) breakpoint :global.request_queue[seq].driver.geo='+global.request_queue[seq].driver.geo);
								//console.log('seq(11) breakpoint :global.request_queue[seq].driver.geo.lat='+global.request_queue[seq].driver.geo.lat);
								//console.log('seq(11) breakpoint :global.request_queue[seq].driver.geo.lng='+global.request_queue[seq].driver.geo.lng);
								//console.log('seq(11) breakpoint :global.request_queue[seq].pickup='+global.request_queue[seq].pickup);
								//console.log('seq(11) breakpoint :global.request_queue[seq].pickup.lat='+global.request_queue[seq].pickup.lat);
								//console.log('seq(11) breakpoint :global.request_queue[seq].pickup.lng='+global.request_queue[seq].pickup.lng);
								global.request_queue[seq].driver.geo = gps.get_close_between_two_point(global.request_queue[seq].driver.geo, global.request_queue[seq].pickup, 0.001, function() {});
								global.request_queue[seq].request.simulation.driver_goto_pickup_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								if ( global.request_queue[seq].driver.geo.lat == global.request_queue[seq].pickup.lat && global.request_queue[seq].driver.geo.lng == global.request_queue[seq].pickup.lng ) {
									//console.log('seq(11) is true');
									//console.log('seq(11) breakpoint :request_id='+global.request_queue[seq].request_id);
									global.request_queue[seq].request.status.code = "04_DRIVER_ARRIVE_PICKUP";
									global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
									var record = dmOMS.Driver_Arrive_Pickup_Update(global.request_queue[seq].request_id, function() {});
									global.request_queue[seq].request.simulation.driver_arrive_pickup_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
									logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
									logger.info('seq(11)  Handle 04_DRIVER_ARRIVE_PICKUP : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
									
								}			
								if(global.request_queue[seq].request.status.code=="03_DRIVER_GOTO_PICKUP"){
									var speed_KmH = 60   //60Km/Hour
									var estimated_min_arrive = null;
									gps_distance  = gps.distance(global.request_queue[seq].pickup.lat, global.request_queue[seq].pickup.lng, global.request_queue[seq].driver.geo.lat, global.request_queue[seq].driver.geo.lng, 'K');
									estimated_min_arrive = Math.round((gps_distance/speed_KmH) * 60);
									global.request_queue[seq].pickup.estimated_min_arrive=estimated_min_arrive;
									logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
									logger.info('seq(11) Handle> 03_DRIVER_GOTO_PICKUP : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
								}
								if(global.request_queue[seq].request.status.code=='04_DRIVER_ARRIVE_PICKUP'){
									global.request_queue[seq].pickup.estimated_min_arrive=0;
									logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
									logger.info('seq(11) Handle> 04_DRIVER_ARRIVE_PICKUP : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
								}

						
							}	

					}
				 }
				}
			}	
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(12)');
			 if (global.request_queue[seq].request.simulation.simulation_is) {
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime && 
						global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime &&
						global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime  &&
						! global.request_queue[seq].request.workflow.wf_driver_goto_drop_datetime ) {
							//console.log('seq(12) breakpoint :request_id='+global.request_queue[seq].request_id);
							var ToCompare = global.request_queue[seq].request.simulation.driver_arrive_pickup_timer;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = ToCompare;
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) >= 5 ) {
								//console.log('seq(12) is true');
								//console.log('seq(12) breakpoint :request_id='+global.request_queue[seq].request_id);
								global.request_queue[seq].request.workflow.wf_driver_goto_drop_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								global.request_queue[seq].request.status.code = "05_DRIVER_GOTO_DROP";
								var record = dmOMS.Driver_Goto_Drop_Update(global.request_queue[seq].request_id, function() {});
								global.request_queue[seq].request.simulation.driver_goto_drop_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
								logger.info('seq(12) Handle 05_DRIVER_GOTO_DROP : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								
							}	

					}
				 }
				}
			}	
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(13)');
			 if (global.request_queue[seq].request.simulation.simulation_is) {
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime && 
						global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime &&
						global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime &&
						global.request_queue[seq].request.workflow.wf_driver_goto_drop_datetime && 
						! global.request_queue[seq].request.workflow.wf_driver_arrive_drop_datetime ) {
							//console.log('seq(13) breakpoint :request_id='+global.request_queue[seq].request_id);
							var ToCompare = global.request_queue[seq].request.simulation.driver_goto_pickup_timer;
							var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							//console.log('startDate=' +startDate);
							var endDate = ToCompare;
							//console.log('endDate=' +endDate);
							var secondsDiff = moment(startDate).diff(endDate, 'seconds');
							//console.log('secondsDiff=' +secondsDiff);
							if(Math.round((secondsDiff*10)/10) >= 1 ) {
								//console.log('seq(13) breakpoint :global.request_queue[seq].driver.geo='+global.request_queue[seq].driver.geo);
								//console.log('seq(13) breakpoint :global.request_queue[seq].driver.geo.lat='+global.request_queue[seq].driver.geo.lat);
								//console.log('seq(13) breakpoint :global.request_queue[seq].driver.geo.lng='+global.request_queue[seq].driver.geo.lng);
								//console.log('seq(13) breakpoint :global.request_queue[seq].drop='+global.request_queue[seq].drop);
								//console.log('seq(13) breakpoint :global.request_queue[seq].drop.lat='+global.request_queue[seq].drop.lat);
								//console.log('seq(13) breakpoint :global.request_queue[seq].drop.lng='+global.request_queue[seq].drop.lng);
								global.request_queue[seq].driver.geo = gps.get_close_between_two_point(global.request_queue[seq].driver.geo, global.request_queue[seq].drop, 0.001*5, function() {});
								global.request_queue[seq].request.simulation.driver_goto_pickup_timer = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
								
								var jData = {
										request_id: global.request_queue[seq].request_id,
										gps_provider:  "",
										gps_location_provider:  "",
										gps_time:  "",
										gps_latitude:  global.request_queue[seq].driver.geo.lat,
										gps_longitude: global.request_queue[seq].driver.geo.lng,
										gps_accuracy:  "",
										gps_speed:  "",
										gps_altitude:  "",
										gps_bearing:  "",
										mobile_apps_version:  "",
										mobile_source_ip:  "",
										mobile_datetime:  moment().format('YYYY-MM-DD H:mm:ss'),
										district_id:  null,
										zone_id:  null,
										status: true,
										server_log_datetime: moment().format('YYYY-MM-DD H:mm:ss')
									};														
								var record = dmOMS.Request_Driver_GPS_Insert(jData, function() {});
																
								
								if ( global.request_queue[seq].driver.geo.lat == global.request_queue[seq].drop.lat && global.request_queue[seq].driver.geo.lng == global.request_queue[seq].drop.lng ) {
									//console.log('seq(11) is true');
									//console.log('seq(11) breakpoint :request_id='+global.request_queue[seq].request_id);
									global.request_queue[seq].request.workflow.wf_driver_arrive_drop_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
									global.request_queue[seq].request.status.code = "06_DRIVER_ARRIVE_DROP";
									var record = dmOMS.Driver_Arrive_Drop_Update(global.request_queue[seq].request_id, function() {});
									global.request_queue[seq].request.workflow.wf_closed_route_complete_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
									/* bug found 2017-07-20 driver_user_id:  global.request_queue[seq].request.nearly_driver.driver_user_id > not nearly
									var jData = {
											request_id: global.request_queue[seq].request_id,
											driver_user_id:  global.request_queue[seq].request.nearly_driver.driver_user_id,
											driver_rank_cust: 5,
										};
									*/	
									var jData = {
											request_id: global.request_queue[seq].request_id,
											driver_user_id:  global.request_queue[seq].driver.id,
											driver_rank_cust: 5,
										};														
									global.request_queue[seq].request.workflow.wf_driver_assess_cust_datetime = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
									var record = dmOMS.Driver_Assess_Cust_Update(jData, function() {});
									var record = dmOMS.Driver_Online_Enabled_Update(jData, function() {});
									
									/* Must delete after development	test release element */
									//global.request_queue[seq].request.workflow.wf_closed_datetime = moment().format('YYYY-MM-DD H:mm:ss');
									//var record = dmOMS.Close_Request_Update(global.request_queue[seq].request_id, function() {});					
									/* Must delete after development	*/
									
								}			


						
							}	

					}
				 }
				}
			}	
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(14)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime &&
						! global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime ) {
						var ToCompare = global.request_queue[seq].request.workflow.wf_driver_matched_datetime;
						var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
						//console.log('startDate=' +startDate);
						var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
						//console.log('endDate=' +endDate);
						var secondsDiff = moment(startDate).diff(endDate, 'seconds');
						//console.log('secondsDiff=' +secondsDiff);
						if(Math.round((secondsDiff*10)/10) > RW_DGPICKLT ) {
							//console.log('seq(14) is true');
							global.request_queue[seq].request.workflow.ERR_GOTO_PICKUP_TIMEOUT = moment().format('YYYY-MM-DD H:mm:ss');
							global.request_queue[seq].request.status.code = "ERR_GOTO_PICKUP_TIMEOUT";
							var record = dmOMS.Driver_Pickup_Timeout_Update(global.request_queue[seq].request_id, function() {});					
							var jData = {
									request_id: global.request_queue[seq].request_id,
									driver_user_id:  global.request_queue[seq].driver.id
								};														
							var record = dmOMS.Driver_Online_Enabled_Update(jData, function() {});
							logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
							logger.info('seq(14)   > RW_DGPICKLT : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								

							
						}

					}						
				}	
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(15)');
			if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime &&
						global.request_queue[seq].request.workflow.wf_driver_arrive_pickup_datetime && 
						! global.request_queue[seq].request.workflow.wf_driver_arrive_drop_datetime ) {
						var ToCompare = global.request_queue[seq].request.workflow.wf_driver_goto_pickup_datetime;
						var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
						//console.log('startDate=' +startDate);
						var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
						//console.log('endDate=' +endDate);
						var secondsDiff = moment(startDate).diff(endDate, 'seconds');
						//console.log('secondsDiff=' +secondsDiff);
						if(Math.round((secondsDiff*10)/10) > RW_DGDROPLT ) {
							//console.log('seq(15) is true');
							global.request_queue[seq].request.workflow.wf_closed_driver_drop_timeout_datetime = moment().format('YYYY-MM-DD H:mm:ss');
							global.request_queue[seq].request.status.code = "ERR_GOTO_DROP_TIMEOUT";
							var record = dmOMS.Driver_Drop_Timeout_Update(global.request_queue[seq].request_id, function() {});					
							var jData = {
									request_id: global.request_queue[seq].request_id,
									driver_user_id:  global.request_queue[seq].driver.id
								};														
							var record = dmOMS.Driver_Online_Enabled_Update(jData, function() {});
							logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
							logger.info('seq(15)  >  RW_DGDROPLT : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								

							
						}

					}						
				}	
			}
			callback(null) //waterfall call back next function
		  },
		  function(callback){
			//if(global.debug) console.log('execute seq(16)');
				//if (global.request_queue[seq].request_id != undefined) {
				if (global.request_queue[seq].request.workflow.wf_closed_datetime) {
					var ToCompare = global.request_queue[seq].request.workflow.wf_closed_datetime;
					var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
					//console.log('startDate=' +startDate);
					var endDate = moment(new Date(ToCompare)).format("YYYY-MM-DD H:mm:ss");
					//console.log('endDate=' +endDate);
					var secondsDiff = moment(startDate).diff(endDate, 'seconds');
					//console.log('secondsDiff=' +secondsDiff);
					if(Math.round((secondsDiff*10)/10) > RW_CLEARQUEUE ) {
						//console.log('seq(16) is true');
						logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
						logger.info('seq(16)  >  RW_CLEARQUEUE : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								

						global.request_queue[seq] = null;
					}	
				}
			//}
			callback(null) //waterfall call back next function
		  },		  
		  function(callback){
			//if(global.debug) console.log('execute seq(20)');
			  if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
				if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_cust_cancel_request_datetime &&
					! global.request_queue[seq].request.workflow.wf_closed_oms_cancel_request_datetime ) {
					if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime) {
				 	 if (global.request_queue[seq].request.nearly_driver.driver_user_id) {
						var index = driver_handshaking_pool.indexOf(global.request_queue[seq].request.nearly_driver.driver_user_id);
						if(index > -1) driver_handshaking_pool.splice(index, 1);
						global.request_queue[seq].request.nearly_driver.driver_user_id = null;
						global.request_queue[seq].request.nearly_driver.create_datetime = null;
						global.request_queue[seq].request.nearly_driver.registration_id = null;
						global.request_queue[seq].request.nearly_driver.geo.lat = null;
						global.request_queue[seq].request.nearly_driver.geo.lng = null;						

						logger.info('driver_handshaking_pool =' + driver_handshaking_pool);	
						logger.info('seq(20)  >  matched order - remove driver from driver_handshaking_pool : element['+seq+'].request_id=' + global.request_queue[seq].request_id);								

						} //if (global.request_queue[seq].request.nearly_driver.driver_user_id) {
					} //if (global.request_queue[seq].request.workflow.wf_driver_matched_datetime) {
				 }  //if (! global.request_queue[seq].request.workflow.wf_closed_driver_cancel_request_datetime &&
				} //if (! global.request_queue[seq].request.workflow.wf_closed_datetime) {
			callback(null) //waterfall call back next function
		  }		  
		  ], function (err, result) {
				//logger.info('seq(end) breakpoint :driver_handshaking_pool =' + driver_handshaking_pool);
				//console.log('seq(end) breakpoint :driver_handshaking_pool =' + driver_handshaking_pool);
				//if(global.debug) console.log('end waterfall');	
				callback();
		  }
		);
		
		/************************************************************/
		/***<end> water fall routine*********************************/
		/************************************************************/
			
	}; //this.Workflow_Start_WaterFall = function(callback){
		
		
		

	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Request_WorkFlow_Handler;