const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Resv_Estimated_Fee_Model(){
    
	//no constructor
	
	
	this.Get_Closly_Driver_List_All = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Get_Closly_Driver_List_All');


	var statement ='CALL sp_get_closely_driver_v01( ';
		statement	+= '"' + jData.grade_sub_code + '"' + ',';
		statement	+= '"' + jData.region_code + '"' + ',';
		statement	+= '' + jData.latitude + '' + ',';
		statement	+= '' + jData.longitude + '' + ' ';
		statement	+= ') ; ';

	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(results[0]);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	
	
	this.Cust_Resv_Estimated_Fee_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Resv_Estimated_Fee_Insert');
	
	var statement ='insert into tbl_rosf_cust_request_estimate \
							(middle_core_server, mobile_token, grade_sub_code, \
							pickup_location_eng, pickup_location_chn, pickup_latitude, \
							pickup_longitude, pickup_district_id, \
							drop_location_eng, drop_location_chn, drop_latitude, \
							drop_longitude, drop_district_id, \
							gapi_km, gapi_minute, currency_code, extra_reason, extra_code, extra_rate, extra_desc_eng, \
							extra_desc_chn, extra_desc_time_eng, extra_desc_time_chn, fee_surcharge_code, fee_surcharge, fee_surcharge_desc_eng, fee_surcharge_desc_chn, \
							type_code, discount_percent,estimate_fee,\
							estimated_min, estimated_max, arrive_min, server_log_datetime) ';
			statement	+= ' values (';
			statement	+= '"' + jData.api_server_domain+ '"' +  ',';
			statement	+= '"' + jData.mobile_token+ '"' +  ',';
			statement	+= '"' + jData.grade_sub_code+ '"' +  ',';
			//statement	+= '"' + jData.pickup_location_eng.replace('"','\\"') + '"' +  ',';
			//statement	+= '"' + jData.pickup_location_chn.replace('"','\\"') + '"' +  ',';

			statement 	+= '"' + jData.pickup_location_eng + '"' + ',';
			statement	+= '"' + jData.pickup_location_chn + '"' +  ',';
			statement	+= jData.pickup_latitude +  ',';
			statement	+= jData.pickup_longitude +  ',';
			statement	+= jData.pickup_district_id +  ',';

			statement 	+= '"' + jData.drop_location_eng + '"' + ',';
			statement	+= '"' + jData.drop_location_chn + '"' +  ',';
			statement	+= jData.drop_latitude +  ',';
			statement	+= jData.drop_longitude +  ',';
			statement	+= jData.drop_district_id +  ',';
			
			statement 	+= jData.gapi_km + ',';
			statement	+= jData.gapi_minute +  ',';
			statement	+= '"' + jData.currency_code+ '"' +  ',';
			statement	+= '"' + jData.extra_reason + '"' +  ',';
			statement	+= '"' + jData.extra_code + '"' +  ',';
			statement	+= jData.extra_rate +  ',';
			statement	+= '"' + jData.extra_desc_eng + '"' +  ',';
			statement	+= '"' + jData.extra_desc_chn + '"' +  ',';
			statement	+= '"' + jData.extra_desc_time_eng + '"' +  ',';
			statement	+= '"' + jData.extra_desc_time_chn + '"' +  ',';

			statement	+= jData.fee_surcharge_code +  ',';
			statement	+= '"' + jData.fee_surcharge + '"' +  ',';
			statement	+= '"' + jData.fee_surcharge_desc_eng + '"' +  ',';
			statement	+= '"' + jData.fee_surcharge_desc_chn + '"' +  ',';

			statement	+= '"' + jData.type_code + '"' +  ',';
			statement	+= '"' + jData.discount_percent + '"' +  ',';
		
			statement	+= jData.estimated_fee +  ',';
			statement	+= jData.estimated_min +  ',';
			statement	+= jData.estimated_max +  ',';
			statement	+= jData.arrive_min +  ',';
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

	
		

	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Resv_Estimated_Fee_Model;