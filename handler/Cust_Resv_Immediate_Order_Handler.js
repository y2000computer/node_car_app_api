//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	

//Data Model
//const OMS_Geo_Model = require('../model/OMS_Geo_Model.js');
const OMS_Resv_Order_Geo_Model = require('../model/OMS_Resv_Order_Geo_Master_Model.js');
const OMS_Resv_Order_Common_Model = require('../model/OMS_Resv_Order_Common_Model.js');
const OMS_Cust_Resv_Estimated_Fee_Model= require('../model/OMS_Cust_Resv_Estimated_Fee_Model.js');	
const OMS_Cust_Resv_Immediate_Order_Model= require('../model/OMS_Cust_Resv_Immediate_Order_Model.js');	


function Cust_Resv_Immediate_Order_Handler(){
    
	//constructor

	var order = [];
	var order_matched_driver = [];
	var id = 0;
	
	this.Order_Get = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Get');
	
	id = jData.id;
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
		function(callback){
			// get immediate order  
			console.log('execute async-function get immediate order');
			var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
			var record = dmOMS.Order_Select(id, function(data) {
					console.log("execute dmOMS.Order_Select()");
					order = data[0];
					callback(null) //waterfall call back next function
				});		
	  },
	  function(callback){
		// get driver if confirmed order  
		  
		 console.log('execute async-function get immediate order');
		  if (order.driver_user_id) {
			  var dmOMS = new OMS_Cust_Resv_Immediate_Order_Model();
			  var record = dmOMS.Order_Driver_Select(id, function (data) {
				  console.log("execute dmOMS.Order_Driver_Select()");
				  order_matched_driver = data[0];
				  callback(null) //waterfall call back next function
			  });
		  } else {
			callback(null) //waterfall call back next function
		  }	

  }	  
  ], function (err, result) {
		if(global.debug) console.log('end waterfall execute');	

		var order_info = new Object;
		var cust = new Object;
		var vehicle = new Object;
		var pickup = new Object;
		var pickup_district = new Object;
		var drop = new Object;
		var drop_district = new Object;
		var gapi = new Object;
		  var fee = new Object;  
		  var extra = new Object;
		  var extra_desc = new Object;
		  var surcharge = new Object;
		  var surcharge_desc = new Object;
		  var driver = new Object;
		  var status = new Object;
		  
		  order_info.id = order.id;
		  order_info.reference = order.reference;
		  order_info.create_datetime = order.create_datetime;
		  order_info.schedule_dm_hm = order.schedule_dm_hm

		  cust.cust_user_id = order.cust_user_id;
		  cust.last_name = order.cust_last_name;
		  cust.first_name = order.cust_first_name;
		  cust.mobile_country = order.cust_mobile_country;
		  cust.mobile = order.cust_mobile;
		  
		  vehicle.code = order.grade_sub_code;
		  vehicle.grade_name_eng = order.grade_name_eng;
		  vehicle.grade_name_chn = order.grade_name_chn
		  vehicle.seat_name_eng = order.seat_name_eng;
		  vehicle.seat_name_chn = order.seat_name_chn;

		  pickup.eng = order.pickup_location_eng;
		  pickup.chn = order.pickup_location_chn;
		  pickup.lat = order.pickup_latitude;
		  pickup.lng = order.pickup_longitude;
		  pickup_district.id = order.pickup_district_id;
		  pickup_district.eng = order.pickup_district_name_eng;
		  pickup_district.chn = order.pickup_district_name_chn;
		  pickup.district = pickup_district;

		  drop.eng = order.drop_location_eng;
		  drop.chn = order.drop_location_chn;
		  drop.lat = order.drop_latitude;
		  drop.lng = order.drop_longitude;
		  drop_district.id = order.drop_district_id;
		  drop_district.eng = order.drop_district_name_eng;
		  drop_district.chn = order.drop_district_name_chn;
		  drop.district = drop_district;

		  gapi.km = order.gapi_km;
		  gapi.minute = order.gapi_minute;

		  fee.profile_code = order.profile_code;
		  fee.currency_code = order.currency_code;
		  fee.start_up = order.fee_start_up;
		  fee.min_charge = order.fee_min_charge;
		  fee.per_km = order.fee_per_km;
		  fee.per_min = order.fee_per_min;
		  fee.estimate_fee = order.estimate_fee;
		  fee.tips = order.tips;
		  fee.estimate_fee_notes_eng = order.estimate_fee_notes_eng;
		  fee.estimate_fee_notes_chn = order.estimate_fee_notes_chn;
		  
		  if (order.extra_reason) {
			  extra.reason = order.extra_reason;
			  extra.code = order.extra_code;
			  extra.rate = order.extra_rate;

			  extra_desc.eng = order.extra_desc_eng;
			  extra_desc.chn = order.extra_desc_chn;
			  extra_desc.time_eng = order.extra_desc_time_eng;
			  extra_desc.time_chn = order.extra_desc_time_chn;

			  extra.desc = extra_desc;
			
		  }
		  
		  if (order.fee_surcharge_code) {
			  surcharge.charge = order.fee_surcharge;

			  surcharge_desc.eng = order.fee_surcharge_desc_eng;
			  surcharge_desc.chn = order.fee_surcharge_desc_chn;
			  surcharge.desc = surcharge_desc;

		  }	

	 	 if (order_matched_driver.driver_user_id) {
			driver.driver_user_id = order_matched_driver.driver_user_id;
			driver.last_name = order_matched_driver.driver_last_name;
			driver.frist_name = order_matched_driver.driver_first_name;
			driver.mobile_country = order_matched_driver.driver_mobile_country;
			driver.mobile = order_matched_driver.driver_mobile;
			driver.registration_id = order_matched_driver.registration_id;
			driver.registration_mark = order_matched_driver.registration_mark;
			driver.brand = order_matched_driver.brand_code;
			driver.model = order_matched_driver.model_code;
			driver.picture = order_matched_driver.picture
		  }
		  
		  status.code = order.state_code;
		  status.name_eng = order.state_name_eng;
		  status.name_chn = order.state_name_chn;
		  

		  var jResponse = {
			  id: order_info.id,
			  reference: order_info.reference,
			  create_datetime: order_info.create_datetime,
			  schedule: order_info.schedule_dm_hm,
			  cust: cust,
			  vehicle: vehicle,
			  pickup: pickup,
			  drop: drop,
			  gapi: gapi,
			  fee: fee,
			  extra: extra,
			  surcharge: surcharge,
			  driver: driver,
			  status: status
				};
			
	
		callback(jResponse);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/
	
	};
	


	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Resv_Immediate_Order_Handler;