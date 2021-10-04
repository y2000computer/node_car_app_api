const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Driver_Resv_Panel_Order_Model(){
    
	//no constructor
	

	this.Driver_Select = function(driver_user_id, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Select');
	
		var statement ='select * from  v_driver_ready_for_online  ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + driver_user_id + '"';
			statement	+= ' limit 1 ';
		
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


	this.Order_Confirm_Update = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Confirm_Update');
		
		var statement ='update tbl_resv_order_flow set ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"' + ',';
			statement	+= ' driver_mobile_token = "' + jData.driver_mobile_token + '"' + ',';
			statement 	+= ' registration_id = "' + jData.registration_id + '"' + ',';
			statement 	+= ' resv_driver_confirmed_datetime = NOW() ' + ',';
			statement	+= ' state_code = "' + 'GRE_DRIVER_CONFIRMED' + '"' + ',';
			statement	+= ' state_name_eng = "' + 'Driver Confirmed' + '"' + ',';
			statement	+= ' state_name_chn = "' + '司機己確認' + '"' + ' ';
			statement	+= ' where ';
			statement	+= ' id = "' + jData.id + '"';
			statement	+= ' and ';
			statement	+= ' driver_user_id is NULL ';
		
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
	
	

		this.Order_Mapped_Driver_Select = function(jData, callback){

			if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Mapped_Driver_Select');
		
			var statement ='select * from  tbl_resv_order_flow  ';
				statement	+= ' where ';
				statement	+= ' id = "' + jData.id + '"';
				statement	+= ' and ';
				statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';
				statement	+= ' limit 1 ';
			
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
		
	

			this.Driver_Sea_Order_Select = function(jData, callback){

				if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Mapped_Driver_Select');
			
				var statement ='select f.*, \
								tm.type_name_eng, tm.type_name_chn, \
								DATE_FORMAT(f.create_datetime, "%d/%m/%Y %H:%i:%s") as create_datetime, \
								DATE_FORMAT(f.schedule_datetime, "%d/%m %H:%i") as schedule_dm_hm \
								from tbl_resv_order_flow as f \
								left join tbl_resv_order_service_type_master as tm on f.type_code = tm.type_code ';
				statement	+= ' where ';
				statement	+= ' f.state_code = "' + 'YEL_WAIT_DRIVER_CONFIRM' + '"' + ' ';
				statement	+= ' order by f.id desc limit 50 ';

				
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
			
		
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Resv_Panel_Order_Model;