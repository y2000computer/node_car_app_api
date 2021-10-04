const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Driver_Resv_Confirmed_Order_Model(){
    
	//no constructor
	

	this.Order_Cancel_Update = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Cancel_Update');
		
		var statement ='update tbl_resv_order_flow set ';
			statement += ' resv_err_driver_cancel_order_datetime = NOW() ' + ',';
			statement	+= ' state_code = "' + 'RED_ERR_ORDER_CANCEL_BY_DRIVER' + '"' + ',';
			statement	+= ' state_name_eng = "' + 'Driver had cancelled the order' + '"' + ',';
			statement	+= ' state_name_chn = "' + '司機已取消訂單' + '"' + ' ';
			statement	+= ' where ';
			statement	+= ' id = "' + jData.id + '"';
		
		console.log(statement);
		
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, results){
					if(err) throw err;
					connection.release();
					callback(true);
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
			
		};
	
	

	this.Order_Start_Update = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Start_Update');
		
		var statement ='update tbl_resv_order_flow set ';
			statement += ' resv_driver_goto_pickup_datetime = NOW() ' + ',';
			statement	+= ' state_code = "' + 'GRE_DRIVER_RIDE_GOTO_PICKUP' + '"' + ',';
			statement	+= ' state_name_eng = "' + 'Driver Going To Pickup Location' + '"' + ',';
			statement	+= ' state_name_chn = "' + '司機正往上車地點途中' + '"' + ' ';
			statement	+= ' where ';
			statement	+= ' id = "' + jData.id + '"';
		
		console.log(statement);
		
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, results){
					if(err) throw err;
					connection.release();
					callback(true);
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
			
		};
	
			
		
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Resv_Confirmed_Order_Model;