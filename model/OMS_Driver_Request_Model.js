//NPM Library
const moment= require('moment');
const async = require('async');
const mysql= require('mysql');

//Self Build Library
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Driver_Request_Model(){
    
	//no constructor
	
	
	this.Request_Acknowlege_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Request_Acknowlege_Update');
	
	var insertId = null;	
	var jDriver_Vehicle = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' status = 0 ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		//console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_order_request_match_driver
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_match_driver');

		var statement ='update tbl_rosf_order_request_match_driver set ';
			statement	+= ' driver_order_confirm_datetime = now() ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';
			statement	+= ' and ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		//console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_flow');

		var statement ='update tbl_rosf_order_request_flow set ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"' + ',';
			statement	+= ' registration_id = "' + jData.registration_id + '"' + ',';
			statement	+= ' state_code = "' + '02_DRIVER_MATCHED' + '"' + ',';
			statement	+= ' wf_driver_matched_datetime = now() ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';

		//console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
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
			callback(jDriver_Vehicle);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Cust_Request_Insert = function(jData, callback) {
	


	this.Request_Driver_GPS_Tracking_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_GPS_Tracking_Insert');
	
	var insertId = null;	
	var jDriver_Vehicle = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// insert  tbl_rosf_order_request_driver_gps
		if(global.debug) console.log('execute async-function-insert tbl_rosf_order_request_driver_gps');

		var jData_Insert = {
				"request_id": jData.request_id,
				"gps_provider": "N/A",
				"gps_location_provider": "N/A",
				"gps_time": 0,
				"gps_latitude": jData.latitude,
				"gps_longitude": jData.longitude,
				"gps_accuracy": 0,
				"gps_speed": 0,
				"gps_altitude": 0,
				"gps_accuracy": 0,
				"gps_speed": 0,
				"gps_altitude": 0,
				"gps_bearing": 0,
				"mobile_apps_version": "N/A",
				"mobile_source_ip": "N/A",
				"mobile_datetime": jData.create_datetime,
				"district_id": null,
				"zone_id": null,
				"status": 1,
				"server_log_datetime": jData.create_datetime
				};
				

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_order_request_driver_gps SET ?', jData_Insert, function(err,results){
					if(err) throw err;
					insertId = results.insertId;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_flow');

		var statement ='update tbl_rosf_order_request_flow set ';
			statement	+= ' state_code = "' + '03_DRIVER_GOTO_PICKUP' + '"' + ',';
			statement	+= ' wf_driver_goto_pickup_datetime = now() ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';
			statement	+= ' and  state_code="02_DRIVER_MATCHED"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
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
			callback(jDriver_Vehicle);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Request_Driver_GPS_Tracking_Insert = function(jData, callback) {
	
	
	
	this.Request_Driver_Arrive_Pickup_Update = function(request_id, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Arrive_Pickup_Update');

	var statement ='update tbl_rosf_order_request_flow set ';
		statement	+= ' state_code = "' + '04_DRIVER_ARRIVE_PICKUP' + '"' + ',';
		statement	+= ' wf_driver_arrive_pickup_datetime = now() ';
		statement	+= ' where ';
		statement	+= ' request_id = "' + request_id + '"';

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


	

	this.Request_Driver_Pickup_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Pickup_Update');

	var statement ='update tbl_rosf_order_request_flow set ';
		statement	+= ' state_code = "' + '05_DRIVER_GOTO_DROP' + '"' + ',';
		statement	+= ' wf_driver_goto_drop_datetime = now() ';
		statement	+= ' where ';
		statement	+= ' request_id = "' + jData.request_id + '"';

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


	
	this.Request_Driver_Change_Location_Insert = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Change_Location_Insert');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// insert  tbl_rosf_order_request_cust_change_location fee
		if(global.debug) console.log('execute async-function-insert  tbl_rosf_order_request_cust_change_location fee');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var jData_Insert = {
				"request_id": jData.request_id,
				"drop_location_eng": jData.drop_location_eng,
				"drop_location_chn": jData.drop_location_chn,
				"drop_latitude": jData.drop_latitude,
				"drop_longitude": jData.drop_longitude,
				"create_datetime": Now
				};		
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_order_request_driver_change_location SET ?', jData_Insert, function(err,results){
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },	  
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function- update  tbl_rosf_order_request_flow');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var statement ='update tbl_rosf_order_request_flow  set ';
			statement	+= ' drop_location_eng = "' + jData.drop_location_eng.replace('"','\\"') + '"' + ',';
			statement	+= ' drop_location_chn = "' + jData.drop_location_chn.replace('"','\\"') + '"' + ',';
			statement	+= ' drop_latitude = "' + jData.drop_latitude + '"' + ',';
			statement	+= ' drop_longitude = "' + jData.drop_longitude + '"' + ',';
			statement	+= ' last_modify_datetime = "' + Now + '"' ;
			statement	+= ' where request_id = ' + jData.request_id ;
		//console.log(statement);
								
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, null, function(err,results){
					if(err) throw err;
					connection.release();
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
			callback({ result: true });
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Request_Driver_Change_Location_Insert = function(jData, callback) {
		
	

	this.Request_Driver_Arrive_Drop_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Request_Driver_Arrive_Drop_Update');
	
	var insertId = null;	
	var jDriver_Vehicle = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_flow');

		var statement ='update tbl_rosf_order_request_flow set ';
			statement	+= ' state_code = "' + '06_DRIVER_ARRIVE_DROP' + '"' + ',';
			statement	+= ' wf_driver_arrive_drop_datetime = now() , ';
			statement	+= ' wf_closed_route_complete_datetime = now() ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' status = 1 ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
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
			callback(jDriver_Vehicle);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Request_Driver_Arrive_Drop_Update = function(jData, callback) {	



	this.Driver_Access_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Access_Update');
	
	var insertId = null;	
	var jDriver_Vehicle = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_flow');

		var statement ='update tbl_rosf_order_request_flow set ';
			statement	+= ' driver_rank_cust = "' + jData.ranking + '"' + ',';
			statement	+= ' wf_driver_assess_cust_datetime = now()  ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' status = 1 ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_oms_ride_order if existed
		if(global.debug) console.log('execute async-function- update  tbl_oms_ride_order');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');

		var statement ='update tbl_oms_ride_order  set ';
			statement	+= ' driver_rank_cust = "' + jData.ranking + '"' + ' ';
			statement	+= ' where request_id = ' + jData.request_id ;
			
		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
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
			callback(jDriver_Vehicle);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Driver_Access_Update = function(jData, callback) {	



	this.Driver_Request_Cancel_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Request_Cancel_Update');
	
	var insertId = null;	
	var jDriver_Vehicle = null;
	/************************************************************/
	/***water fall routine********************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// update  tbl_rosf_order_request_flow
		if(global.debug) console.log('execute async-function-update tbl_rosf_order_request_flow');


		var statement ='update tbl_rosf_order_request_flow  set ';
			statement	+= ' driver_cancel_selection = "' +jData.driver_cancel_selection + '"' + ',';
			statement	+= ' state_code = "' + 'ERR_DRIVER_CANCEL' + '"' + ',';
			statement	+= ' wf_closed_driver_cancel_request_datetime = now() ' + ',';
			statement	+= ' last_modify_datetime = now()  ';
			statement	+= ' where ';
			statement	+= ' request_id = "' + jData.request_id + '"';


		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});				
		
	  },
	  function(callback){
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' status = 1 ';
			statement	+= ' where ';
			statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';

		console.log(statement);

		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
					if(err) throw err;
					connection.release();
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
			callback(jDriver_Vehicle);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Driver_Request_Cancel_Update = function(jData, callback) {	


	


	
	
	


	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Request_Model;