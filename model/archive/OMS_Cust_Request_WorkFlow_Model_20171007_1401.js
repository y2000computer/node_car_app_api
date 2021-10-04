//NPM Library
const moment= require('moment');
const async = require('async');
const mysql= require('mysql');

//Self Build Library
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Request_WorkFlow_Model(){
    
	//no constructor

	
	this.List_Unclosed_Request = function(callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List_Unclosed_Request');

	
	var statement ='select f.*, c.cust_user_id,d.driver_user_id, \
								district_m.region_code,district_m.district_name_eng,district_m.district_name_chn, \
								region_m.stream_code, region_m.region_name_eng, region_m.region_name_chn, region_m.stream_code, \
								gs_m.grade_code, \
								fee_m.fee_start_up, fee_m.fee_per_km, fee_m.fee_per_min,  fee_m.fee_min_charge, \
								district_m_drop.district_name_eng as drop_district_name, district_m_drop.district_name_chn as drop_district_name_chn \
								from tbl_rosf_order_request_flow as f \
								left outer join tbl_cust_user_info as c on f.mobile_token = c.mobile_token \
								left outer join tbl_driver_user_info as d on f.driver_user_id = d.driver_user_id \
								left outer join tbl_oms_geo_district_master as district_m on f.pickup_district_id = district_m.district_id \
								left outer join tbl_oms_geo_district_master as district_m_drop on f.drop_district_id = district_m_drop.district_id \
								left outer join tbl_oms_geo_region_master as region_m on district_m.region_code = region_m.region_code \
								left outer join tbl_transport_grade_sub_master as gs_m on f.grade_sub_code = gs_m.grade_sub_code \
								left outer join tbl_oms_standard_fee_master as fee_m on f.grade_sub_code = fee_m.grade_sub_code and district_m.region_code = fee_m.region_code \
								where f.wf_closed_datetime is null order by f.request_id ;';


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
		
	};	//this.List_Unclosed_Request = function(callback){


	
	this.Close_Request_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Close_Request_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' wf_closed_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Close_Request_Update = function(request_id, callback){
	

	this.Driver_Not_Available_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Close_Request_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "ERR_NO_DRIVER_AVAILABLE"' + ',';
		statement	+= ' wf_closed_driver_not_available_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Driver_Not_Available_Update = function(request_id, callback){


	this.Driver_Online_Active_Update = function(driver_user_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Online_Active_Update');

	var statement ='update tbl_rosf_driver_online_gps set ';
		statement	+= ' status = 1 ' + ' ';
		statement	+= ' where ';
		statement	+= ' driver_user_id = ' + '"' + driver_user_id + '"';

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
		
	};	//this.Driver_Online_Active_Update = function(request_id, callback){
	

	
	this.Nearly_Driver_Select = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Nearly_Driver_Select');
	if (jData.seek_dedicated_car_type==false) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff  ';
			statement	+= 'FROM v_driver_online WHERE region_code="'+jData.region_code+'"';					
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_4') 	statement	+= ' AND grade_sub_code<>"HK_CAR_X_SEAT_4" AND down_to_x_is = 1 ';
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_7') 	statement	+= ' AND grade_sub_code="HK_CAR_BLACK_SEAT_7"  AND down_to_x_is = 1 ';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 1 ;';
	}
	if (jData.seek_dedicated_car_type==true) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff  ';
			statement	+= 'FROM v_driver_online WHERE region_code="'+jData.region_code+'"';					
			statement	+= ' AND grade_sub_code="'+jData.grade_sub_code+'"';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 1 ;';
	}		

	//console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, row){
				if(err) throw err;
				connection.release();
				callback(row);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};		//this.Nearly_Driver_Select_V2 = function(request_id, callback){


	
	this.Match_Driver_Insert = function(jData, callback) {

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Match_Driver_Insert');
	
	var statement ='insert into tbl_rosf_order_request_match_driver (request_id, driver_user_id, registration_id, driver_latitude, driver_longitude, driver_distance_km,  create_datetime)  ';
			statement	+= ' values (';
			statement	+= '"' + jData.request_id+ '"' +  ',';
			statement	+= '"' + jData.driver_user_id+ '"' +  ',';
			statement	+= '"' + jData.registration_id+ '"' +  ',';
			statement	+= '"' + jData.driver_latitude+ '"' +  ',';
			statement	+= '"' + jData.driver_longitude+ '"' +  ',';
			statement	+= '"' + jData.driver_distance_km+ '"' +  ',';
			statement	+= ' NOW()  ';
			statement	+= ' ); ';
	
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
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
	
	
	this.Driver_Matched_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Matched_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "02_DRIVER_MATCHED"' + ',';
		statement	+= ' wf_driver_matched_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Driver_Matched_Update = function(request_id, callback){
	


	this.Driver_Acknowledge_Update = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Acknowledge_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' driver_user_id = ' + jData.driver_user_id +  ',';
		statement	+= ' registration_id = ' + jData.registration_id +  ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + jData.request_id 

	//console.log(statement);	

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
		
	};	//this.Driver_Acknowledge_Update = function(request_id, callback){
	

	this.Driver_Online_Disable_Update = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Online_Disable_Update');

	var statement ='update tbl_rosf_driver_online_gps s set ';
		statement	+= ' status = 0 '
		statement	+= ' where ';
		statement	+= ' driver_user_id = ' + jData.driver_user_id 

	//console.log(statement);	

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
		
	};	//this.Driver_Online_Disable_Update = function(request_id, callback){

	
	this.Driver_Goto_Pickup_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Goto_Pickup_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "03_DRIVER_GOTO_PICKUP"' + ',';
		statement	+= ' wf_driver_goto_pickup_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Driver_Goto_Pickup_Update = function(request_id, callback){	


	this.Driver_Arrive_Pickup_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Arrive_Pickup_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "04_DRIVER_ARRIVE_PICKUP"' + ',';
		statement	+= ' wf_driver_arrive_pickup_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Driver_Arrive_Pickup_Update = function(request_id, callback){	

	
	
	this.Driver_Goto_Drop_Update = function(request_id, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Goto_Drop_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "05_DRIVER_GOTO_DROP"' + ',';
		statement	+= ' wf_driver_goto_drop_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 


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
		
	};	//this.Driver_Goto_Drop_Update = function(request_id, callback){	
	
	
	
	this.Driver_Arrive_Drop_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Arrive_Drop_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "06_DRIVER_ARRIVE_DROP"' + ',';
		statement	+= ' wf_driver_arrive_drop_datetime = now() ' + ' , ';
		statement	+= ' wf_closed_route_complete_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 

	//console.log(statement);

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
		
	};	//this.Driver_Arrive_Drop_Update = function(request_id, callback){	



	this.Driver_Assess_Cust_Update = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Assess_Cust_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' driver_rank_cust = ' + jData.driver_rank_cust +  ',';
		statement	+= ' wf_driver_assess_cust_datetime = now() ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + jData.request_id 

	//console.log(statement);

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
		
	};	//this.Driver_Assess_Cust_Update = function(request_id, callback){	

	

	this.Driver_Online_Enabled_Update = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Online_Enabled_Update');

	var statement ='update tbl_rosf_driver_online_gps s set ';
		statement	+= ' status = 1 '
		statement	+= ' where ';
		statement	+= ' driver_user_id = ' + jData.driver_user_id 

	//console.log(statement);	

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
		
	};	//this.Driver_Online_Enabled_Update = function(request_id, callback){

	

	this.Driver_Pickup_Timeout_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Pickup_Timeout_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "ERR_GOTO_PICKUP_TIMEOUT"' + ',';
		statement	+= ' wf_closed_driver_pickup_timeout_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 
	
	//console.log(statement);

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
		
	};	//this.Driver_Pickup_Timeout_Update = function(request_id, callback){
	


	this.Driver_Drop_Timeout_Update = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Drop_Timeout_Update');

	var statement ='update tbl_rosf_order_request_flow s set ';
		statement	+= ' state_code = "ERR_GOTO_DROP_TIMEOUT"' + ',';
		statement	+= ' wf_closed_driver_drop_timeout_datetime = now() ' + ' ';
		statement	+= ' where ';
		statement	+= ' request_id = ' + request_id 
	
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
		
	};	//this.Driver_Drop_Timeout_Update = function(request_id, callback){
	
	
	
	this.Request_Driver_GPS_Insert = function(jData, callback) {

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_GPS_Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_rosf_order_request_driver_gps SET ?', jData, function(err,results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	}; //this.Request_Driver_GPS_Insert = function(request_id, callback){
	
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Request_WorkFlow_Model;