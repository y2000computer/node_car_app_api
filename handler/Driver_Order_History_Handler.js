//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');

//Data Model
const OMS_Driver_Order_History_Model= require('../model/OMS_Driver_Order_History_Model.js');	


function Driver_Order_History_Handler(){
    
	//constructor
	var summary = new Object;
	var list = [];
	var info = new Object;
	var tunnel = [];

	var dmOMS = new OMS_Driver_Order_History_Model();
	
	this.get_driver_order_list = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'get_driver_order_list');
	
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get ride information
		console.log('execute async-function-get period');
		var record = dmOMS.Driver_Order_History_Period_Select(jData, function(data) {
				console.log("execute Driver_Order_History_Period_Select()");
				summary.period_from_datetime = data[0].period_from_datetime;
				summary.period_to_datetime = data[0].period_to_datetime;
				summary.currency_code ='HK$';
				callback(null) //waterfall call back next function
			});		
		
	  },
	  function(callback){
		// get summary tunnel fee
		console.log('execute async-function-get summary tunnel fee');
		var record = dmOMS.Driver_Order_History_Summary_Tunnel_Fee_Select(jData, summary, function(data) {
				console.log("execute Driver_Order_History_Summary_Tunnel_Fee_Select	()");
				summary.summary_tunnel_fee = data[0].summary_tunnel_fee;
				callback(null) //waterfall call back next function
			});		

	  },	  
	  function(callback){
		// get summary application fee
		console.log('execute async-function-get summary application fee');
		var record = dmOMS.Driver_Order_History_Summary_Application_Fee_Select(jData, summary, function(data) {
				console.log("execute Driver_Order_History_Summary_Application_Fee_Select	()");
				summary.summary_application_fee = data[0].summary_application_fee;
				callback(null) //waterfall call back next function
			});		

	  },	  
	  function(callback){
		// get summary fee
		console.log('execute async-function-get summary fee');
		var record = dmOMS.Driver_Order_History_Summary_Fee_Select(jData, summary, function(data) {
				console.log("execute Driver_Order_History_Summary_Fee_Select	()");
				summary.summary_fee = data[0].summary_fee;
				callback(null) //waterfall call back next function
			});		

	  },	  
	  function(callback){
		// get summary fee
		console.log('execute async-function-get driver order list ');
		var record = dmOMS.Driver_Order_History_Select(jData, summary, function(data) {
				console.log("execute Driver_Order_History_Select	()");
				for (var i = 0; i < data.length; i++) {
					list.push(data[i]);
					}
				callback(null) //waterfall call back next function
			});		

	  }	  
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	

			var result = {
				"summary" : summary ,
				"list" : list 
				};
		
		callback(result);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/
	

	};
	

	this.get_info = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'get_info');
	
	console.log('jData.token'+'='+jData.token);
	console.log('jData.ride_order_ref'+'='+jData.ride_order_ref);
	
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get ride information
		console.log('execute async-function-get ride information');
		var record = dmOMS.Driver_Order_History_Info_Select(jData, function(data) {
				console.log("execute Driver_Order_History_Info_Select()");
				info.ride_order_id = data[0].ride_order_id;
				info.ride_order_ref = data[0].ride_order_ref;
				info.wf_driver_goto_drop_datetime = data[0].wf_driver_goto_drop_datetime;
				info.grade_name_eng = data[0].grade_name_eng;
				info.sub_grade_name_eng = data[0].sub_grade_name_eng;
				info.sub_grade_name_chn = data[0].sub_grade_name_chn;
				info.brand_code = (data[0].brand_code ? data[0].brand_code : null );
				info.model_code = (data[0].model_code ? data[0].model_code : null );
				info.currency_code = data[0].currency_code;
				info.fee_grand_total = data[0].fee_grand_total;
				info.pickup_location_eng = data[0].pickup_location_eng;
				info.pickup_location_chn = data[0].pickup_location_chn;
				info.drop_location_eng = data[0].drop_location_eng;
				info.drop_location_chn = data[0].drop_location_chn;
				info.driver_last_name = (data[0].driver_last_name ? data[0].driver_last_name : null );
				info.driver_first_name =  (data[0].driver_first_name ? data[0].driver_first_name : null );
				info.driver_rank_cust = (data[0].driver_rank_cust? data[0].driver_rank_cust : null );
				info.picture = (data[0].picture ? data[0].picture : null );
				data[0].fee_surcharge
				basic_and_surcharge = data[0].fee_ride_basic;
				if(data[0].fee_surcharge) basic_and_surcharge = data[0].fee_ride_basic + data[0].fee_surcharge ;
				info.fee_ride_basic = basic_and_surcharge;
				info.total_km = data[0].total_km;
				info.fee_ride_km = data[0].fee_ride_km;
				info.total_time = data[0].total_time;
				info.fee_ride_min = data[0].fee_ride_min;
				info.fee_sub_total = data[0].fee_sub_total;
				info.percent_factor = data[0].percent_factor;
				info.fee_factor_total = data[0].fee_factor_total;
				info.fee_notes_eng = (data.length>0 ? data[0].fee_notes_eng : null);
				info.fee_notes_chn = (data.length>0 ? data[0].fee_notes_chn : null);

				callback(null) //waterfall call back next function
			});		
		
	  },
	  function(callback){
		// get tunnel detail
		console.log('execute async-function-get tunnel details');
		var record = dmOMS.Driver_Order_History_Info_Tunnel_Select(info.ride_order_id, function(data) {
				console.log("execute Driver_Order_History_Info_Tunnel_Select	()");
				for (var i = 0; i < data.length; i++) {
					tunnel.push(data[i]);
					}
				callback(null) //waterfall call back next function
			});		

		},	  
	  function(callback){
		// get settlement 
		console.log('execute async-function-get settlement');
		var record = dmOMS.Driver_Order_History_Info_Settlement_Select(info.ride_order_id, function(data) {
				console.log("execute Driver_Order_History_Info_Settlement_Select	()");
				info.settle_datetime = null;
				info.profile_code = null;
				info.card_no = null;
				info.settle_amount = null;
				for (var i = 0; i < data.length; i++) {
				info.settle_datetime = (data[0].settle_datetime ? data[0].settle_datetime : null) ;
				info.settle_amount = (data[0].settle_amount ? data[0].settle_amount : null)
				}		
				callback(null) //waterfall call back next function
			});		
		
	  }
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	

			var result = {
				"ride_order_ref" : info.ride_order_ref ,
				"wf_driver_goto_drop_datetime" : info.wf_driver_goto_drop_datetime ,
				"grade_name_eng" : info.grade_name_eng ,
				".sub_grade_name_eng" : info.sub_grade_name_eng ,
				"sub_grade_name_chn" : info.sub_grade_name_chn ,
				"brand_code" : info.brand_code ,
				"model_code" : info.model_code ,
				"currency_code" : info.currency_code ,
				"fee_grand_total" : info.fee_grand_total ,
				"pickup_location_eng" : info.pickup_location_eng ,
				"pickup_location_chn" : info.pickup_location_chn ,
				"drop_location_eng" : info.drop_location_eng ,
				"drop_location_chn" : info.drop_location_chn ,
				"driver_last_name" : info.driver_last_name ,
				"driver_first_name" : info.driver_first_name ,
				"driver_rank_cust" : info.driver_rank_cust ,
				"picture" : info.picture ,
				"fee_ride_basic" : info.fee_ride_basic ,
				"total_km" : info.total_km ,
				"fee_ride_km" : info.fee_ride_km ,
				"total_time" : info.total_time ,
				"fee_ride_min" : info.fee_ride_min ,
				"fee_sub_total" : info.fee_sub_total ,
				"percent_factor" : info.percent_factor ,
				"fee_factor_total" :  info.fee_factor_total ,
				"fee_notes_eng" :  info.fee_notes_eng ,
				"fee_notes_chn" :  info.fee_notes_chn ,
				"tunnel" : tunnel ,
				"settle_datetime" : info.settle_datetime ,
				"settle_amount" : info.settle_amount
				};
		
		callback(result);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/
	
	
	

	};
	
	

	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Driver_Order_History_Handler;