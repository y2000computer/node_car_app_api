const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Driver_Request_Workflow_Model(){
    
	//no constructor
	
	
	this.Order_Pooling_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Pooling_Select');

	
	var statement ='select md.request_id,\
					rf.grade_sub_code, \
					c.last_name, c.first_name, c.ranking_one_week ,  m.mobile,\
					rf.pickup_location_eng, rf.pickup_location_chn, rf.pickup_latitude, rf.pickup_longitude, \
					rf.drop_location_eng, rf.drop_location_chn, rf.drop_latitude, rf.drop_longitude, rf.gapi_km, rf.gapi_minute, rf.extra_rate, rf.create_datetime, \
					sub.grade_code,gm.grade_name_eng, \
					sub.sub_grade_name_eng, sub_grade_name_chn, \
					rf.arrive_min \
					from tbl_rosf_order_request_match_driver as md \
					left join v_driver_online as online on md.driver_user_id = online.driver_user_id \
					left join tbl_rosf_order_request_flow as rf on md.request_id = rf.request_id\
					left join tbl_transport_grade_sub_master as sub on rf.grade_sub_code = sub.grade_sub_code \
					left join tbl_transport_grade_master as gm  on sub.grade_code = gm.grade_code \
					left join tbl_cust_user_info as c  on rf.mobile_token = c.mobile_token\
					left join tbl_cust_mobile as m on  c.cust_user_id = m.cust_user_id ';
		statement	+= ' where ' ;					
		statement	+= ' md.driver_user_id="' + jData.driver_user_id + '"';				
		statement	+= 'and md.driver_order_confirm_datetime is null  and \
								md.driver_order_confirm_timeout_datetime is null  and \
								md.create_datetime > date_sub(now(), interval 1 year) \
						and rf.wf_driver_matched_datetime is null and wf_closed_datetime is null \
						and m.status = 1\
						order by md.irow_id desc limit 1;';

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
		
	};
	

	this.Driver_Online_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Online_Select');

	var statement ='select * from tbl_rosf_driver_online_gps where ';
	statement	+= ' driver_user_id = "' + jData.driver_user_id + '"' ;
	
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



	this.Queue_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Queue_Select');

	var jOnline = null;
	var rs_queue = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// select  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-select tbl_rosf_driver_online_gps');

		var statement ='select  * from v_driver_online  ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		//console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){				
					if(err) throw err;
					connection.release();
					if(rows.length>0) {
						jOnline = rows[0] ;
					}
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// select  v_driver_online_region_queue
		if(global.debug) console.log('execute async-function-select v_driver_online_region_queue');

		grade_sub_code = null;
		
		if(jOnline != null) {
			grade_sub_code = jOnline.grade_sub_code ;
		}
		

		var statement ='select driver_user_id, queue \
						from( \
						select (@rownum := @rownum + 1) as queue, driver_user_id \
						from v_driver_online_region_queue  \
						JOIN    (SELECT @rownum := 0) r ';
			statement	+= ' where ';
			statement	+= ' grade_sub_code = "' + grade_sub_code + '"' +' ';
			statement	+= ' ) x  \
							where 1 = 1; ';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){			
					if(err) throw err;
					connection.release();
					rs_queue = rows;
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
			
		
	  }
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	
			callback(rs_queue);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/
	
		
	};
	


	this.Request_Id_Select = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Id_Select');

	var request_id = null;
	
	var statement ='select *  from tbl_rosf_order_request_flow where ';
	statement	+= ' request_id = "' + jData.request_id + '"' ;
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
	
	};		//this.Request_Id_Select = function(jData, callback) {
		
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Request_Workflow_Model;