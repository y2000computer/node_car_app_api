//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');

//Data Model
const OMS_CO_History_Model= require('../model/OMS_Cust_Order_History_Model.js');	


function Cust_Order_History_Handler(){
    
	//constructor
	var info = new Object;
	var tunnel = [];

	var dmOMS = new OMS_CO_History_Model();
	
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
		var record = dmOMS.Cust_Order_History_Info_Select(jData, function(data) {
				console.log("execute Cust_Order_History_Info_Select()");
								
				info.ride_order_id = (data.length>0 ? data[0].ride_order_id : null);
				info.ride_order_ref = (data.length>0 ? data[0].ride_order_ref : null);
				info.wf_driver_goto_drop_datetime = (data.length>0 ? data[0].wf_driver_goto_drop_datetime : null);
				info.grade_name_eng = (data.length>0 ? data[0].grade_name_eng : null);
				info.sub_grade_name_eng = (data.length>0 ? data[0].sub_grade_name_eng : null);
				info.sub_grade_name_chn = (data.length>0 ? data[0].sub_grade_name_chn : null);
				info.brand_code = (data.length>0 ? data[0].brand_code : null);
				info.model_code = (data.length>0 ? data[0].model_code : null);
				info.currency_code = (data.length>0 ? data[0].currency_code : null);
				info.fee_grand_total = (data.length>0 ? data[0].fee_grand_total : null);
				info.pickup_location_eng = (data.length>0 ? data[0].pickup_location_eng : null);
				info.pickup_location_chn = (data.length>0 ? data[0].pickup_location_chn : null);
				info.drop_location_eng = (data.length>0 ? data[0].drop_location_eng : null);
				info.drop_location_chn = (data.length>0 ? data[0].drop_location_chn : null);
				//nfo.driver_last_name = (data.length>0 ? data[0].driver_last_name : null);
				//info.driver_first_name =  (data.length>0 ? data[0].driver_first_name : null);
				//info.cust_rank_driver = (data.length>0 ? data[0].cust_rank_driver  : null);
				//info.picture = (data.length>0 ? data[0].picture : null);
				info.standard_fee_min_charge = (data.length>0 ? data[0].standard_fee_min_charge : null);
				info.fee_ride_basic = (data.length>0 ? data[0].fee_ride_basic : null);
				info.fee_surcharge = (data.length>0 ? data[0].fee_surcharge : null);
				info.total_km = (data.length>0 ? data[0].total_km : null);
				info.fee_ride_km = (data.length>0 ? data[0].fee_ride_km : null);
				info.total_time = (data.length>0 ? data[0].total_time : null);
				info.fee_ride_min = (data.length>0 ? data[0].fee_ride_min : null);
				info.fee_sub_total = (data.length>0 ? data[0].fee_sub_total : null);
				info.percent_factor = (data.length>0 ? data[0].percent_factor : null);
				info.fee_factor_total = (data.length>0 ? data[0].fee_factor_total : null);
				info.donation_amount = (data.length>0 ? data[0].donation_amount : null);
				info.fee_notes_eng = (data.length>0 ? data[0].fee_notes_eng : null);
				info.fee_notes_chn = (data.length>0 ? data[0].fee_notes_chn : null);

				callback(null) //waterfall call back next function
			});		
		
	  },
	  function(callback){
		// get driver photo information
		console.log('execute async-function-get ride information');
		var record = dmOMS.Cust_Order_History_Info_Driver_Photo_Select(jData, function(data) {
				console.log("execute Cust_Order_History_Info_Select()");
								
				info.driver_last_name = (data.length>0 ? data[0].driver_last_name : null);
				info.driver_first_name =  (data.length>0 ? data[0].driver_first_name : null);
				info.cust_rank_driver = (data.length>0 ? data[0].cust_rank_driver  : null);
				info.picture = (data.length>0 ? data[0].picture : null);
	
				callback(null) //waterfall call back next function
			});		
		
	  },
	  function(callback){
		// get tunnel detail
		console.log('execute async-function-get tunnel details');
		var record = dmOMS.Cust_Order_History_Info_Tunnel_Select(info.ride_order_id, function(data) {
				console.log("execute Cust_Order_History_Info_Tunnel_Select	()");
				for (var i = 0; i < data.length; i++) {
					tunnel.push(data[i]);
					}
				callback(null) //waterfall call back next function
			});		

		},	  
	  function(callback){
		// get settlement 
		console.log('execute async-function-get settlement');
		var record = dmOMS.Cust_Order_History_Info_Settlement_Select(info.ride_order_id, function(data) {
				console.log("execute Cust_Order_History_Info_Settlement_Select	()");
				info.settle_datetime = null;
				info.profile_code = null;
				info.card_no = null;
				info.settle_amount = null;
				for (var i = 0; i < data.length; i++) {
				info.settle_datetime = (data[0].settle_datetime ? data[0].settle_datetime : null) ;
				info.profile_code = (data[0].profile_code ? data[0].profile_code : null);
				info.card_no = (data[0].card_no ? data[0].card_no : null);
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
				"cust_rank_driver" : info.cust_rank_driver ,
				"picture" : info.picture ,
				"standard_fee_min_charge" : info.standard_fee_min_charge ,
				"fee_ride_basic" : info.fee_ride_basic ,
				"fee_surcharge" : info.fee_surcharge ,
				"total_km" : info.total_km ,
				"fee_ride_km" : info.fee_ride_km ,
				"total_time" : info.total_time ,
				"fee_ride_min" : info.fee_ride_min ,
				"fee_sub_total" : info.fee_sub_total ,
				"percent_factor" : info.percent_factor ,
				"fee_factor_total" :  info.fee_factor_total ,
				"donation_amount" :  info.donation_amount ,
				"fee_notes_eng" :  info.fee_notes_eng ,
				"fee_notes_chn" :  info.fee_notes_chn ,
				"tunnel" : tunnel ,
				"settle_datetime" : info.settle_datetime ,
				"profile_code" : info.profile_code ,
				"card_no" : info.card_no ,
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


module.exports= Cust_Order_History_Handler;