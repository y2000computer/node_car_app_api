//NPM Library
const moment= require('moment');
const async = require('async');
const mysql= require('mysql');

//Self Build Library
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Request_WorkFlow_Router_Model(){
    
	//no constructor

	
	this.Load_New_Request = function(request_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List_Unclosed_Request');

	
	var statement ='select f.*, c.cust_user_id,d.driver_user_id, \
								district_m.region_code,district_m.district_name_eng,district_m.district_name_chn, \
								region_m.stream_code, region_m.region_name_eng, region_m.region_name_chn, region_m.stream_code, \
								gs_m.grade_code, \
								fee_m.fee_start_up, fee_m.fee_per_km, fee_m.fee_per_min,  fee_m.fee_min_charge \
								from tbl_rosf_order_request_flow as f \
								left outer join tbl_cust_user_info as c on f.mobile_token = c.mobile_token \
								left outer join tbl_driver_user_info as d on f.driver_user_id = d.driver_user_id \
								left outer join tbl_oms_geo_district_master as district_m on f.pickup_district_id = district_m.district_id \
								left outer join tbl_oms_geo_region_master as region_m on district_m.region_code = region_m.region_code \
								left outer join tbl_transport_grade_sub_master as gs_m on f.grade_sub_code = gs_m.grade_sub_code \
								left outer join tbl_oms_standard_fee_master as fee_m on f.grade_sub_code = fee_m.grade_sub_code and district_m.region_code = fee_m.region_code \
								where f.request_id='+request_id+' and f.wf_closed_datetime is null order by f.request_id ;';

	//console.log(statement);
	
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
		
	};	//this.Load_New_Request = function(callback){


	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Request_WorkFlow_Router_Model;