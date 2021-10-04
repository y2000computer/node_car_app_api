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
const OMS_Driver_Resv_Panel_Order_Model = require('../model/OMS_Driver_Resv_Panel_Order_Model.js');	


function Driver_Resv_Panel_List_Handler(){
    
	//constructor

	this.List = function(jData, callback){

	var order_list = [];

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List');
	
	var dmOMS = new OMS_Driver_Resv_Panel_Order_Model();
	var record = dmOMS.Driver_Sea_Order_Select(jData, function(data) {
			var order = new Object;
			var vehicle = new Object;
			var pickup_district = new Object;
			var drop_district = new Object;
		 	var fee = new Object;  
			var fee = new Object;  
		
			for (var i = 0; i < data.length; i++) {
				order.id = data[i].id;
				order.type_code = data[i].type_code;
				order.type_name_eng = data[i].type_name_eng;
				order.type_name_chn = data[i].type_name_chn;
				order.create_datetime = data[i].create_datetime;
				order.schedule = data[i].schedule_dm_hm;

				vehicle.grade_name_eng = data[i].grade_name_eng;
				vehicle.grade_name_chn = data[i].grade_name_chn;
				vehicle.seat_name_eng = data[i].seat_name_eng;
				vehicle.seat_name_chn = data[i].seat_name_chn;

				pickup_district.eng = data[i].pickup_district_name_eng;
				pickup_district.chn = data[i].pickup_district_name_chn;
	  
				drop_district.eng = data[i].drop_district_name_eng;
				drop_district.chn = data[i].drop_district_name_chn;
				
				fee.currency_code = data[i].currency_code;
				fee.estimate_fee = data[i].estimate_fee;
				fee.tips = data[i].tips;
		  
				var jOrder_Set = {
					id: data[i].id,
					type_code: data[i].type_code,
					type_name_eng: data[i].type_name_eng,
					type_name_chn: data[i].type_name_chn,
					create_datetime: data[i].create_datetime,
					schedule: data[i].schedule_dm_hm,
					vehicle: vehicle,
					pickup_district: pickup_district,
					drop_district: drop_district,
					fee: fee
					  };
					  
				order_list.push(jOrder_Set);
			}	
		
			var jResult = {
				list: order_list
			}
			callback(jResult);
		});							
	
	};  //this.List = function(driver_user_id, callback){
	
		
	///////////////////////////////////////////////////////////////////////////////////////////////
	

};


module.exports= Driver_Resv_Panel_List_Handler;