//NPM Library
const moment= require('moment');
const async = require('async');
const winston = require('winston');
const fs = require('fs');


//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	


//Data Model
const OMS_Cust_Request_WorkFlow_Router_Model= require('../model/OMS_Cust_Request_WorkFlow_Router_Model.js');	

function Cust_Request_WorkFlow_Router_Handler(){
    
	//constructor
	var dmOMS = new OMS_Cust_Request_WorkFlow_Router_Model();
	
	this.Load_New_Request = function(request_id, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Load_New_Request');

	var record = dmOMS.Load_New_Request(request_id, function(data) {
				//console.log(data);
					var cust = {
								id: data[0].cust_user_id,
								profile_code: data[0].profile_code,
								direction: null,
								geo: {
									lat: null,
									lng: null
								}
							};
							
					var driver = {
								id: (data[0].driver_user_id ==null ? null : data[0].driver_user_id) ,
								registration_id:  (data[0].registration_id ==null ? null : data[0].registration_id) , 
								geo: {
									lat: null,
									lng: null
								}
							};


					var pickup = {
								eng: (data[0].pickup_location_eng ==null ? null : data[0].pickup_location_eng) ,
								chn:  (data[0].pickup_location_chn ==null ? null : data[0].pickup_location_chn) , 
								lat:  (data[0].pickup_latitude ==null ? null : data[0].pickup_latitude) , 
								lng:  (data[0].pickup_longitude ==null ? null : data[0].pickup_longitude)  ,
								estimated_min_arrive: null,
								district: {
									id: (data[0].pickup_district_id ==null ? null : data[0].pickup_district_id)  ,
									eng: (data[0].district_name_eng ==null ? null : data[0].district_name_eng) ,
									chn:  (data[0].district_name_chn ==null ? null : data[0].district_name_chn)  
								},
								region: {
									code: (data[0].region_code ==null ? null : data[0].region_code)  ,
									eng: (data[0].region_name_eng ==null ? null : data[0].region_name_eng) ,
									chn:  (data[0].region_name_chn ==null ? null : data[0].region_name_chn) , 
									stream_code:  (data[0].stream_code ==null ? null : data[0].stream_code) 
								}					
							};
							
	
					var drop = {
								eng: (data[0].drop_location_eng ==null ? null : data[0].drop_location_eng) ,
								chn:  (data[0].drop_location_chn ==null ? null : data[0].drop_location_chn) , 
								lat:  (data[0].drop_latitude ==null ? null : data[0].drop_latitude) , 
								lng:  (data[0].drop_longitude ==null ? null : data[0].drop_longitude) ,
								district: {
									id: (data[0].drop_district_id ==null ? null : data[0].drop_district_id)  ,
									eng: (data[0].drop_district_name_eng ==null ? null : data[0].drop_district_name_eng) ,
									chn:  (data[0].drop_district_name_chn ==null ? null : data[0].drop_district_name_chn)  
								}
							};	

					var gapi = {
								km: (data[0].gapi_km ==null ? null : data[0].gapi_km) ,
								minute:  (data[0].gapi_minute ==null ? null : data[0].gapi_minute) 
							};	


					var fee = {
								currency_code: data[0].currency_code ,
								start_up: data[0].fee_start_up ,
								min_charge: data[0].fee_min_charge ,
								per_km: data[0].fee_per_km ,
								per_min: data[0].fee_per_min ,
								extra: {
									reason: data[0].extra_reason  ,
									code: data[0].extra_code ,
									rate:  data[0].extra_rate, 
									desc: {
										eng: data[0].extra_desc_eng ,
										chn:  data[0].extra_desc_chn, 
										time_eng: data[0].extra_desc_time_eng ,
										time_chn: data[0].extra_desc_time_chn
									}
								}
							};	


					var estimated = {
								min: data[0].estimated_min ,
								max: data[0].estimated_max 
							};	


					var workflow = {
								wf_driver_matching_datetime: data[0].wf_driver_matching_datetime, 
								wf_driver_matched_datetime: data[0].wf_driver_matched_datetime, 
								wf_driver_goto_pickup_datetime: data[0].wf_driver_goto_pickup_datetime, 
								wf_driver_arrive_pickup_datetime: data[0].wf_driver_arrive_pickup_datetime, 
								wf_driver_goto_drop_datetime: data[0].wf_driver_goto_drop_datetime, 
								wf_driver_arrive_drop_datetime: data[0].wf_driver_arrive_drop_datetime, 
								wf_driver_assess_cust_datetime: data[0].wf_driver_assess_cust_datetime, 
								wf_cust_assess_driver_datetime: data[0].wf_cust_assess_driver_datetime, 
								wf_closed_datetime: data[0].wf_closed_datetime, 
								wf_closed_route_complete_datetime: data[0].wf_closed_route_complete_datetime, 
								wf_closed_driver_not_available_datetime: data[0].wf_closed_driver_not_available_datetime, 
								wf_closed_driver_pickup_timeout_datetime: data[0].wf_closed_driver_pickup_timeout_datetime, 
								wf_closed_driver_drop_timeout_datetime: data[0].wf_closed_driver_drop_timeout_datetime, 
								wf_closed_driver_cancel_request_datetime: data[0].wf_closed_driver_cancel_request_datetime, 
								wf_closed_cust_cancel_request_datetime: data[0].wf_closed_cust_cancel_request_datetime, 
								wf_closed_oms_cancel_request_datetime: data[0].wf_closed_oms_cancel_request_datetime, 
								create_datetime: data[0].create_datetime,
							};	
							

					var nearly_driver = {
								create_datetime: null ,
								driver_user_id: null ,
								registration_id: null ,
								geo: {
									lat: null,
									lng: null
								},
								nearly_driver_history: null 
							};	


					var simulation = {
								simulation_is: data[0].simulation_is ,
								driver_after_matched_timer: null ,
								driver_goto_pickup_timer: null ,
								driver_arrive_pickup_timer: null ,
								driver_goto_drop_timer: null ,
								driver_arrive_drop_timer: null 
							};								

							
					var request = {
								id: data[0].request_id ,
								grade_code: data[0]. grade_code,
								grade_sub_code: data[0]. grade_sub_code,
								fee: fee,
								estimated: estimated,
								status: {
									code: data[0].state_code
								},
								workflow: workflow,
								nearly_driver: nearly_driver,
								simulation: simulation
							};	
							
							
					var element = {
								//Request identity
								request_id: data[0].request_id,
								middle_core_server: data[0].middle_core_server,
								middle_slave_server: data[0].middle_slave_server,
								mobile_token: data[0].mobile_token,
								grade_sub_code: data[0].grade_sub_code,
								profile_code: data[0].profile_code,
								cust: cust,
								driver: driver,
								pickup: pickup,
								drop: drop,
								gapi: gapi,
								request: request
							};
							
					//global.request_queue.push(element);		
					//console.log(element);
					var breakLoop = false;
					for (var i = 0; i < global.RW_MAX_CACHE; i++) {
					  if (!breakLoop) {
						  if(global.request_queue[i] == undefined  || global.request_queue[i] == null) {
							  global.request_queue.push(element);		
							  breakLoop = true;
						  }
					  }
					}
					
									
				  callback();
				
				
			});		
			
			

	};  //this.Load_New_Request = function(callback){
	

	this.Status_Request_Enquiry = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Status_Request_Enquiry');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;

		console.log('Status_Request_Enquiry -> request_id ' + jData.request_id);

		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				//if(global.request_queue[i].mobile_token == mobile_token)  {
					//if(global.request_queue[i].mobile_token == mobile_token && 
						//global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime == null
					/*
					if(rw_cache_id == null &&
					    global.request_queue[i].request_id == jData.request_id  && 
					    global.request_queue[i].mobile_token == jData.mobile_token && 
						global.request_queue[i].request.workflow.wf_driver_arrive_drop_datetime != null && 
						global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime == null 
						)  
					*/	
					if(rw_cache_id == null &&
					    global.request_queue[i].request_id == jData.request_id  && 
					    global.request_queue[i].mobile_token == jData.mobile_token 
						)  
						{
							console.log('API status , global.request_queue[i].request.workflow.wf_closed_cust_cancel_request_datetime' +  global.request_queue[i].request.workflow.wf_closed_cust_cancel_request_datetime);
							console.log('API status , global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime' +  global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime);
							if(!global.request_queue[i].request.workflow.wf_closed_driver_not_available_datetime  ) {
								if(global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime == null ) {
									if(global.request_queue[i].request.workflow.wf_closed_driver_cancel_request_datetime == null ) {
										if(global.request_queue[i].request.workflow.wf_closed_cust_cancel_request_datetime == null)  {
									//global.request_queue[i].request.workflow.wf_closed_cust_cancel_request_datetime == null  && 
									//global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime   == null
											//if (rw_cache_id < i ) rw_cache_id = i;
											if (rw_cache_id == null ) rw_cache_id = i;
											//console.log('rw_cache_id='+rw_cache_id);
											}
										}
									}
								}			
				}
			}	
		}			
	  
		if (! rw_cache_id) {
			requestArray = null;
			console.log('API: status > Cache NOT Found');
			} else {
					console.log('API: status > Cache Found');
					console.log('global.request_queue[i].request_id=' + global.request_queue[rw_cache_id].request_id );
					//console.log(global.request_queue[rw_cache_id]);
					var cust = new Object;
					cust.id = global.request_queue[rw_cache_id].cust.id;
					cust.profile_code = global.request_queue[rw_cache_id].cust.profile_code;
					cust.geo = null;

					var driver = new Object;
					if (! global.request_queue[rw_cache_id].driver.id)  driver = null;
					if (global.request_queue[rw_cache_id].driver.id)  {
						driver.id = global.request_queue[rw_cache_id].driver.id;
						driver.registration_id = global.request_queue[rw_cache_id].driver.registration_id;
						driver.direction = null;
						var geo = new Object;
						geo.lat =  global.request_queue[rw_cache_id].driver.geo.lat;
						geo.lng =  global.request_queue[rw_cache_id].driver.geo.lng;
						driver.geo = geo;
					}

					var pickup = new Object;
					pickup.eng = global.request_queue[rw_cache_id].pickup.eng;
					pickup.chn = global.request_queue[rw_cache_id].pickup.chn;
					pickup.lat = global.request_queue[rw_cache_id].pickup.lat;
					pickup.lng = global.request_queue[rw_cache_id].pickup.lng;
					pickup.estimated_min_arrive = global.request_queue[rw_cache_id].pickup.estimated_min_arrive;
					
					var district = new Object;
					district.id = global.request_queue[rw_cache_id].pickup.district.id;
					district.eng = global.request_queue[rw_cache_id].pickup.district.eng;
					district.chn = global.request_queue[rw_cache_id].pickup.district.chn;
		
					var region = new Object;
					region.code = global.request_queue[rw_cache_id].pickup.region.code;
					region.eng = global.request_queue[rw_cache_id].pickup.region.eng;
					region.chn = global.request_queue[rw_cache_id].pickup.region.chn;
					region.stream_code = global.request_queue[rw_cache_id].pickup.region.stream_code;
		
					pickup.district = district;
					pickup.region = region;
					
					var drop = new Object;
					drop.eng = global.request_queue[rw_cache_id].drop.eng;
					drop.chn = global.request_queue[rw_cache_id].drop.chn;
					drop.lat = global.request_queue[rw_cache_id].drop.lat;
					drop.lng = global.request_queue[rw_cache_id].drop.lng;
				
					var gapi = new Object;
					gapi.km = global.request_queue[rw_cache_id].gapi.km;
					gapi.minute = global.request_queue[rw_cache_id].gapi.minute;

					var request = new Object;
					request.id = global.request_queue[rw_cache_id].request.id;
					request.grade_code = global.request_queue[rw_cache_id].request.grade_code;
					request.grade_sub_code = global.request_queue[rw_cache_id].grade_sub_code;
					var status = new Object;
					status.code = global.request_queue[rw_cache_id].request.status.code;
					request.status = status;

					var fee = new Object;
					fee.currency_code =  global.request_queue[rw_cache_id].request.fee.currency_code;
					fee.start_up =  global.request_queue[rw_cache_id].request.fee.start_up;
					fee.min_charge = global.request_queue[rw_cache_id].request.fee.min_charge;
					fee.per_km = global.request_queue[rw_cache_id].request.fee.per_km;
					fee.per_min = global.request_queue[rw_cache_id].request.fee.per_min;
					
					var extra = new Object;
					extra.reason = global.request_queue[rw_cache_id].request.fee.extra.reason;
					extra.code = global.request_queue[rw_cache_id].request.fee.extra.code;
					extra.rate = global.request_queue[rw_cache_id].request.fee.extra.rate;

					var desc = new Object;
					desc.eng = global.request_queue[rw_cache_id].request.fee.extra.desc.eng;
					desc.chn = global.request_queue[rw_cache_id].request.fee.extra.desc.chn;
					desc.time_eng = global.request_queue[rw_cache_id].request.fee.extra.desc.time_eng;
					desc.time_chn = global.request_queue[rw_cache_id].request.fee.extra.desc.time_chn;

					fee.extra = extra;
					fee.extra.desc = desc;
					
					var estimated = new Object;
					estimated.min = global.request_queue[rw_cache_id].request.estimated.min;
					estimated.max = global.request_queue[rw_cache_id].request.estimated.max;

					var workflow = new Object;
					workflow.wf_driver_matching_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_matching_datetime;
					workflow.wf_driver_matched_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_matched_datetime;
					workflow.wf_driver_goto_pickup_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_goto_pickup_datetime;
					workflow.wf_driver_arrive_pickup_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_arrive_pickup_datetime;
					workflow.wf_driver_goto_drop_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_goto_drop_datetime;
					workflow.wf_driver_arrive_drop_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_arrive_drop_datetime;
					workflow.wf_driver_assess_cust_datetime = global.request_queue[rw_cache_id].request.workflow.wf_driver_assess_cust_datetime;
					workflow.wf_cust_assess_driver_datetime = global.request_queue[rw_cache_id].request.workflow.wf_cust_assess_driver_datetime;
					workflow.wf_closed_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_datetime;
					workflow.wf_closed_route_complete_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_route_complete_datetime;
					workflow.wf_closed_driver_not_available_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_driver_not_available_datetime;
					workflow.wf_closed_driver_pickup_timeout_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_driver_pickup_timeout_datetime;
					workflow.wf_closed_driver_drop_timeout_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_driver_drop_timeout_datetime;
					workflow.wf_closed_driver_cancel_request_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_driver_cancel_request_datetime;
					workflow.wf_closed_cust_cancel_request_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_cust_cancel_request_datetime;
					workflow.wf_closed_oms_cancel_request_datetime = global.request_queue[rw_cache_id].request.workflow.wf_closed_oms_cancel_request_datetime;
					workflow.create_datetime = global.request_queue[rw_cache_id].request.workflow.create_datetime;
	

					var simulation = new Object;
					simulation.simulation_is =  global.request_queue[rw_cache_id].request.simulation.simulation_is;
					simulation.driver_after_matched_timer =  global.request_queue[rw_cache_id].request.simulation.driver_after_matched_timer;
					simulation.driver_goto_pickup_timer =  global.request_queue[rw_cache_id].request.simulation.driver_goto_pickup_timer;
					simulation.driver_goto_drop_timer =  global.request_queue[rw_cache_id].request.simulation.driver_goto_drop_timer;
					simulation.driver_arrive_drop_timer =  global.request_queue[rw_cache_id].request.simulation.driver_arrive_drop_timer;

					var banner = new Object;
					banner.eng_url =  global.banner_eng_url;
					banner.chn_url =  global.banner_chn_url;
				
					var donation = new Object;
					donation.status =  false			//need further touch up

					
					requestArray.cust = cust ;		
					requestArray.driver = driver ;
					requestArray.pickup = pickup ;
					requestArray.drop = drop;
					requestArray.gapi = gapi;
					requestArray.request = request;
					requestArray.fee = fee;
					requestArray.estimated = estimated;
					requestArray.workflow = workflow;
					requestArray.simulation = simulation;
					requestArray.banner = banner;
					requestArray.donation = donation;
					
				} //if (! rw_cache_id)
		
	  callback(requestArray);
				
	};  //this.Status_Request_Enquiry = function(callback){
	

	
	this.Change_Drop_Location_UpdateCache = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Change_Drop_Location_UpdateCache');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].mobile_token == jData.mobile_token)  {
					if (rw_cache_id < i ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (! rw_cache_id) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					global.request_queue[rw_cache_id].drop.eng = jData.drop_location_eng;
					global.request_queue[rw_cache_id].drop.chn = jData.drop_location_chn;
					global.request_queue[rw_cache_id].drop.lat = jData.drop_latitude;
					global.request_queue[rw_cache_id].drop.lng = jData.drop_longitude;
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Change_Drop_Location_UpdateCache = function(callback){


	
	this.Change_Profile_UpdateCache = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Change_Profile_UpdateCache');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].mobile_token == jData.mobile_token)  {
					if (rw_cache_id < i ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (! rw_cache_id) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					global.request_queue[rw_cache_id].cust.profile_code = jData.profile_code;
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Change_Profile_UpdateCache = function(callback){
	

	
	this.Cust_Assess_Driver_UpdateCache = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Assess_Driver_UpdateCache');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			//if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].mobile_token == jData.mobile_token && global.request_queue[i].request_id == jData.request_id)  {
					if (rw_cache_id < i ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (! rw_cache_id) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					global.request_queue[rw_cache_id].request.workflow.wf_cust_assess_driver_datetime = moment().format('YYYY-MM-DD H:mm:ss');
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Cust_Assess_Driver_UpdateCache = function(callback){
	


	this.Cust_Cancel_UpdateCache = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Cancel_UpdateCache');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(rw_cache_id == null &&
					global.request_queue[i].request_id == jData.request_id  && 
					global.request_queue[i].mobile_token == jData.mobile_token && 
					global.request_queue[i].request.workflow.wf_closed_datetime == null
					)  {			
				//if(global.request_queue[i].mobile_token == jData.mobile_token)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (! rw_cache_id) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					global.request_queue[rw_cache_id].request.workflow.wf_closed_cust_cancel_request_datetime = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.status.code = 'ERR_CUST_CANCEL';	 
			
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Cust_Cancel_UpdateCache = function(callback){
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Request_WorkFlow_Router_Handler;