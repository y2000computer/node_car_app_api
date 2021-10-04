//NPM Library
const moment= require('moment');
const async = require('async');
const winston = require('winston');
const fs = require('fs');


//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	


//Data Model
const OMS_Driver_Request_WorkFlow_Router_Model= require('../model/OMS_Driver_Request_WorkFlow_Router_Model.js');	
const OMS_Driver_Request_Model= require('../model/OMS_Driver_Request_Model.js');	


function Driver_Request_WorkFlow_Router_Handler(){
    
	//constructor
	var dmOMS = new OMS_Driver_Request_WorkFlow_Router_Model();
	var gps = new GPS();
	
	this.Request_Driver_Acknowlege = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Acknowlege');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].driver.id = jData.driver_user_id;
					global.request_queue[rw_cache_id].driver.registration_id = jData.registration_id;
					global.request_queue[rw_cache_id].driver.geo.lat = jData.latitude;
					global.request_queue[rw_cache_id].driver.geo.lng = jData.longitude;
					global.request_queue[rw_cache_id].request.status.code='02_DRIVER_MATCHED';
					global.request_queue[rw_cache_id].request.workflow.wf_driver_matched_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
					var speed_KmH = 60   //60Km/Hour
					var estimated_min_arrive = null;
					gps_distance  = gps.distance(global.request_queue[rw_cache_id].pickup.lat, global.request_queue[rw_cache_id].pickup.lng, global.request_queue[rw_cache_id].driver.geo.lat, global.request_queue[rw_cache_id].driver.geo.lng, 'K');
					estimated_min_arrive = Math.round((gps_distance/speed_KmH) * 60);
					global.request_queue[rw_cache_id].pickup.estimated_min_arrive=estimated_min_arrive;
					
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Acknowlege = function(callback){



	this.Request_Driver_GPS_Tracking = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_GPS_Tracking');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].driver.geo.lat = jData.latitude;
					global.request_queue[rw_cache_id].driver.geo.lng = jData.longitude;
					if (global.request_queue[rw_cache_id].request.status.code=='02_DRIVER_MATCHED'){
						global.request_queue[rw_cache_id].request.status.code='03_DRIVER_GOTO_PICKUP';
						global.request_queue[rw_cache_id].request.workflow.wf_driver_goto_pickup_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					}
					if (global.request_queue[rw_cache_id].request.status.code=='03_DRIVER_GOTO_PICKUP'){
						gps_distance  = gps.distance(global.request_queue[rw_cache_id].pickup.lat, global.request_queue[rw_cache_id].pickup.lng, jData.latitude, jData.longitude, 'K');
						console.log('Request_Driver_GPS_Tracking process ');
						console.log('global.request_queue[rw_cache_id].pickup.lat='+global.request_queue[rw_cache_id].pickup.lat);
						console.log('global.request_queue[rw_cache_id].pickup.lng='+global.request_queue[rw_cache_id].pickup.lng);
						console.log('jData.latitude='+jData.latitude);
						console.log('jData.longitude='+jData.longitude);
						
						if(gps_distance<=0.5) {   // < 0.5KM
							global.request_queue[rw_cache_id].request.status.code='04_DRIVER_ARRIVE_PICKUP';
							global.request_queue[rw_cache_id].request.workflow.wf_driver_arrive_pickup_datetime=moment().format('YYYY-MM-DD H:mm:ss');
							var dmOMS_DRM = new OMS_Driver_Request_Model();
							var record = dmOMS_DRM.Request_Driver_Arrive_Pickup_Update(global.request_queue[rw_cache_id].request_id, function(result) {
								});	
						}
					}
					if(global.request_queue[rw_cache_id].request.status.code=='03_DRIVER_GOTO_PICKUP'){
						var speed_KmH = 60   //60Km/Hour
						var estimated_min_arrive = null
						gps_distance  = gps.distance(global.request_queue[rw_cache_id].pickup.lat, global.request_queue[rw_cache_id].pickup.lng, jData.latitude, jData.longitude, 'K');
						estimated_min_arrive = Math.round((gps_distance/speed_KmH) * 60);
						global.request_queue[rw_cache_id].pickup.estimated_min_arrive=estimated_min_arrive;
					}
					if(global.request_queue[rw_cache_id].request.status.code=='04_DRIVER_ARRIVE_PICKUP'){
						global.request_queue[rw_cache_id].pickup.estimated_min_arrive=0;
					}
						
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_GPS_Tracking = function(callback){
	

	
	this.Request_Driver_Pickup = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Pickup');
		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.status.code='05_DRIVER_GOTO_DROP';
					global.request_queue[rw_cache_id].request.workflow.wf_driver_goto_drop_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Pickup = function(callback){
		


	this.Request_Driver_Change_Drop_Location_UpdateCache = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Change_Drop_Location_UpdateCache');

		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					global.request_queue[rw_cache_id].drop.eng = jData.drop_location_eng;
					global.request_queue[rw_cache_id].drop.chn = jData.drop_location_chn;
					global.request_queue[rw_cache_id].drop.lat = jData.drop_latitude;
					global.request_queue[rw_cache_id].drop.lng = jData.drop_longitude;
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Change_Drop_Location_UpdateCache = function(callback){		
		
		
		
	this.Request_Driver_Arrive_Drop = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Arrive_Drop');
		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.status.code='06_DRIVER_ARRIVE_DROP';
					global.request_queue[rw_cache_id].request.workflow.wf_driver_arrive_drop_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.workflow.wf_closed_route_complete_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Arrive_Drop = function(callback){

		
		
	this.Request_Driver_Arrive_Drop = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Arrive_Drop');
		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.status.code='06_DRIVER_ARRIVE_DROP';
					global.request_queue[rw_cache_id].request.workflow.wf_driver_arrive_drop_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.workflow.wf_closed_route_complete_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Arrive_Drop = function(callback){
		

	this.Request_Driver_Access = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Access');
		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.workflow.wf_driver_assess_cust_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Access = function(callback){



	this.Request_Driver_Cancel = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Cancel');
		var rw_cache_id = null;
		var requestArray = new Object;
    
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					global.request_queue[rw_cache_id].request.status.code='ERR_DRIVER_CANCEL';
					global.request_queue[rw_cache_id].request.workflow.wf_closed_driver_cancel_request_datetime=moment().format('YYYY-MM-DD H:mm:ss');
					
				} //if (! rw_cache_id)
		
	  callback(true);
				
	};  //this.Request_Driver_Cancel = function(callback){

	
	
	this.Request_Status_Enquiry = function(jData, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Status_Enquiry');

		var rw_cache_id = null;
		var requestArray = new Object;
		var code = null;
		var breakLoop = false;
		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
				if(global.request_queue[i].request_id == jData.request_id)  {
					//if (rw_cache_id < i ) rw_cache_id = i;
					if (rw_cache_id == null ) rw_cache_id = i;
					//console.log('rw_cache_id='+rw_cache_id);
				}
			}	
		}			
	  
		if (rw_cache_id == null ) {
			requestArray = null;
			} else {
					//console.log(global.request_queue[rw_cache_id]);
					code =  global.request_queue[rw_cache_id].request.status.code;
						
				} //if (! rw_cache_id)
		
	  callback(code);
				
	};  //this.Request_Status_Enquiry = function(callback){
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Driver_Request_WorkFlow_Router_Handler;