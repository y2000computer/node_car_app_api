//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	

//Data Model
//const OMS_Geo_Model = require('../model/OMS_Geo_Model.js');
const OMS_Cust_Request_Model= require('../model/OMS_Cust_Request_Model.js');	


function Cust_Request_Location_History_Handler(){
    
	//constructor

	this.List = function(jData, callback){

	var order_list = [];

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List');
	
	var dmOMS = new OMS_Cust_Request_Model();
	var record = dmOMS.Cust_Location_History_Select(jData, function(data) {
			var order = new Object;
			var pickup = new Object;
			var drop = new Object;
			var gapi = new Object;
		
			for (var i = 0; i < data.length; i++) {

				pickup.eng = data[i].pickup_location_eng;
				pickup.chn = data[i].pickup_location_chn;
				pickup.lat = data[i].pickup_latitude;
				pickup.lng = data[i].pickup_longitude;
	  
				drop.eng = data[i].drop_location_eng;
				drop.chn = data[i].drop_location_chn;
				drop.lat = data[i].drop_latitude;
				drop.lng = data[i].drop_district_name_chn;

				gapi.km = data[i].gapi_km;
				gapi.minute = data[i].gapi_minute;
				
		  
				var jOrder_Set = {
					pickup: pickup,
					drop: drop,
					gapi: gapi
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


module.exports= Cust_Request_Location_History_Handler;