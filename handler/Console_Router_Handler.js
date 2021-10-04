//NPM Library
const moment= require('moment');
const async = require('async');
const winston = require('winston');
const fs = require('fs');


//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	

//Data Model


function Console_Router_Handler(){
    
	//constructor
	
	this.Match_Memory_Pool_List = function(req, callback){
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Match_Memory_Pool_List ');

		var pool_array = [];

		for (var i = 0; i < global.RW_MAX_CACHE; i++) {
			if(global.request_queue[i] != undefined  || global.request_queue[i] != null) {
					pool_array.push({
					request_id: global.request_queue[i].request_id,
					wf_driver_matching_datetime: global.request_queue[i].request.workflow.wf_driver_matching_datetime,
					wf_driver_matched_datetime: global.request_queue[i].request.workflow.wf_driver_matched_datetime,
					wf_driver_goto_pickup_datetime: global.request_queue[i].request.workflow.wf_driver_goto_pickup_datetime,
					wf_driver_arrive_pickup_datetime: global.request_queue[i].request.workflow.wf_driver_arrive_pickup_datetime,
					wf_driver_goto_drop_datetime: global.request_queue[i].request.workflow.wf_driver_goto_drop_datetime,
					wf_driver_arrive_drop_datetime: global.request_queue[i].request.workflow.wf_driver_arrive_drop_datetime,
					wf_driver_assess_cust_datetime: global.request_queue[i].request.workflow.wf_driver_assess_cust_datetime,
					wf_cust_assess_driver_datetime: global.request_queue[i].request.workflow.wf_cust_assess_driver_datetime,
					wf_closed_datetime: global.request_queue[i].request.workflow.wf_closed_datetime,
					wf_closed_route_complete_datetime: global.request_queue[i].request.workflow.wf_closed_route_complete_datetime,
					wf_closed_driver_not_available_datetime: global.request_queue[i].request.workflow.wf_closed_driver_not_available_datetime,
					wf_closed_driver_pickup_timeout_datetime: global.request_queue[i].request.workflow.wf_closed_driver_pickup_timeout_datetime,
					wf_closed_driver_drop_timeout_datetime: global.request_queue[i].request.workflow.wf_closed_driver_drop_timeout_datetime,
					wf_closed_driver_cancel_request_datetime: global.request_queue[i].request.workflow.wf_closed_driver_cancel_request_datetime,
					wf_closed_cust_cancel_request_datetime: global.request_queue[i].request.workflow.wf_closed_cust_cancel_request_datetime,
					wf_closed_oms_cancel_request_datetime: global.request_queue[i].request.workflow.wf_closed_oms_cancel_request_datetime,
					create_datetime: global.request_queue[i].request.workflow.create_datetime					
					});								
			}	
		}			
	  
		
	  callback(pool_array);
				
	};  //this.Match_Memory_Pool_List = function(req, callback){
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Console_Router_Handler;