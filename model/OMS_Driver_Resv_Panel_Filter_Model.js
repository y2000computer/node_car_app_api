const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Driver_Resv_Panel_Filter_Model(){
    
	//no constructor
	

	this.Filter_Select = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Filter_Select');
	
		var statement ='select * from  tbl_resv_order_driver_filter  ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';
			statement	+= ' and status = 1 ';
		
		console.log(statement);
										
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					callback(rows);
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
			
		};
		
		

	this.Filter_Deactive_Update = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Filter_Deactive_Update');
	
		var statement ='update tbl_resv_order_driver_filter set ';
			statement	+= ' status = 0 ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';
		
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
	
	

	this.Filter_Insert = function(jData, callback) {
	
			if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Filter_Insert');
		
			
			var statement ='insert into tbl_resv_order_driver_filter ( \
							driver_user_id, \
							immediate_order_pickup_region_hk_is, \
							immediate_order_pickup_region_kln_is, \
							immediate_order_pickup_region_nt_is, \
							immediate_order_drop_region_hk_is, \
							immediate_order_drop_region_kln_is, \
							immediate_order_drop_region_nt_is, \
							reserved_order_pickup_region_hk_is, \
							reserved_order_pickup_region_kln_is, \
							reserved_order_pickup_region_nt_is, \
							reserved_order_drop_region_hk_is, \
							reserved_order_drop_region_kln_is, \
							reserved_order_drop_region_nt_is, \
							status, \
							create_datetime \
							) values (' ;
				statement	+= jData.driver_user_id +  ',';
				statement	+= jData.immediate_order_pickup_region_hk_is +  ',';
				statement	+= jData.immediate_order_pickup_region_kln_is +  ',';
				statement	+= jData.immediate_order_pickup_region_nt_is +  ',';
				statement	+= jData.immediate_order_drop_region_hk_is +  ',';
				statement	+= jData.immediate_order_drop_region_kln_is +  ',';
				statement	+= jData.immediate_order_drop_region_nt_is +  ',';
				statement	+= jData.reserved_order_pickup_region_hk_is +  ',';
				statement	+= jData.reserved_order_pickup_region_kln_is +  ',';
				statement	+= jData.reserved_order_pickup_region_nt_is +  ',';
				statement	+= jData.reserved_order_drop_region_hk_is +  ',';
				statement	+= jData.reserved_order_drop_region_kln_is +  ',';
				statement	+= jData.reserved_order_drop_region_nt_is +  ',';
				statement	+= ' 1 ' + ',';
				statement	+= ' NOW()  ';
				statement	+= ' ); ';
		
			DB_OMS_Pool.getConnection(function(err,connection){
					if (err) throw err;
					connection.query(statement, function (err, result) {
						//console.log('insertId='+result.insertId);
						if(err) throw err;
						connection.release();
						//callback(true);
						callback(result.insertId);
					});
					connection.on('error', function(err) {      
						  throw err;
						  return;     
					});
				});
				
			};
		
		

	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Resv_Panel_Filter_Model;