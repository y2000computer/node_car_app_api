//NPM Library
const moment= require('moment');
const async = require('async');
const mysql= require('mysql');

//Self Build Library
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Request_WorkFlow_Matching_Model(){
    
	//no constructor


	this.Online_Driver_Select = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Online_Driver_Select');
	if (jData.seek_dedicated_car_type==false) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id ';
			statement	+= 'FROM v_driver_online WHERE region_code="'+jData.region_code+'"';					
			if(jData.grade_sub_code=='HK_CAR_X_SEAT_4') 	statement	+= ' AND down_to_x_is = 1 ';
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_4') 	statement	+= ' AND (grade_sub_code="HK_CAR_BLACK_SEAT_4" OR grade_sub_code="HK_CAR_BLACK_SEAT_7")';
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_7') 	statement	+= ' AND grade_sub_code="HK_CAR_BLACK_SEAT_7" ';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 100 ;';
	}
	if (jData.seek_dedicated_car_type==true) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id ';
			statement	+= 'FROM v_driver_online WHERE region_code="'+jData.region_code+'"';					
			statement	+= ' AND grade_sub_code="'+jData.grade_sub_code+'"';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 100 ;';
			
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
		
	};		//this.Online_Driver_Select = function(request_id, callback){
	

	
	this.Online_Driver_Region_Queue_Select = function(jData, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Online_Driver_Region_Queue_Select');
	if (jData.seek_dedicated_car_type==false) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id ';
			statement	+= 'FROM v_driver_online_region_queue WHERE region_code="'+jData.region_code+'"';					
			if(jData.grade_sub_code=='HK_CAR_X_SEAT_4') 	statement	+= ' AND down_to_x_is = 1 ';
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_4') 	statement	+= ' AND (grade_sub_code="HK_CAR_BLACK_SEAT_4" OR grade_sub_code="HK_CAR_BLACK_SEAT_7")';
			if(jData.grade_sub_code=='HK_CAR_BLACK_SEAT_7') 	statement	+= ' AND grade_sub_code="HK_CAR_BLACK_SEAT_7" ';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 100 ;';
	}
	if (jData.seek_dedicated_car_type==true) {
		var statement ='SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude, gps_longitude, (lat_diff + long_diff) AS diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id \
								 FROM \
								(SELECT driver_user_id,registration_id,grade_sub_code,district_id,region_code,district_name_eng, \
								gps_latitude,if(gps_latitude>'+jData.latitude+', gps_latitude-'+jData.latitude+', '+jData.latitude+'-gps_latitude) AS lat_diff, \
								gps_longitude, \
								if(gps_longitude >'+jData.longitude+', gps_longitude-'+jData.longitude+', '+jData.longitude+'-gps_longitude ) AS long_diff, \
								dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id ';
			statement	+= 'FROM v_driver_online_region_queue WHERE region_code="'+jData.region_code+'"';					
			statement	+= ' AND grade_sub_code="'+jData.grade_sub_code+'"';
			if(jData.filter_driver_user_id) 	statement	+= ' AND driver_user_id NOT IN ('+jData.filter_driver_user_id+') ';
			statement	+= ')  AS sb ORDER BY diff LIMIT 100 ;';
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
		
	};		//this.Online_Driver_Region_Queue_Select = function(request_id, callback){
	
	
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Request_WorkFlow_Matching_Model;