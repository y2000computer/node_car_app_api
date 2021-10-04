//NPM Library
const moment= require('moment');
const async = require('async');
const mysql= require('mysql');

//Self Build Library
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Cust_Request_Model(){
    
	//no constructor
	
	
	this.Cust_Request_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Insert');
	
	var insertId = null;	
	var pickup_district_id = null;
	var drop_district_id = null;
		
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get pickup_district_id
		if(global.debug) console.log('execute async-function-get pickup_district_id');
		
		var dmOMS = new OMS_Geo_Model();
		var jPickup = {
				"latitude": jData.pickup_latitude,
				"longitude": jData.pickup_longitude
			};		
		var record = dmOMS.Get_District(jPickup, function(data) {
				console.log("execute dmOMS.Get_District()");
				pickup_district_id = data[0].district_id;
				console.log('district_id=' + pickup_district_id);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		// get drop_district_id
		if(global.debug) console.log('execute async-function-get drop_district_id');
		
		var dmOMS = new OMS_Geo_Model();
		var jDrop = {
				"latitude": jData.drop_latitude,
				"longitude": jData.drop_longitude
			};		
		var record = dmOMS.Get_District(jDrop, function(data) {
				console.log("execute dmOMS.Get_District()");
				drop_district_id = data[0].district_id;
				console.log('district_id=' + drop_district_id);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		// get last request estimate record
		if(global.debug) console.log('execute async-function-get last request estimate record');
		var statement ='select * from tbl_rosf_cust_request_estimate where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by irow_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					callback(null,rows) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
	  },
	  function(EstimateRows,callback){
		// insert  tbl_rosf_order_request_flow fee
		if(global.debug) console.log('execute async-function-insert  tbl_rosf_order_request_flow');

		var jData_Insert = {
				"middle_core_server": jData.middle_core_server,
				"middle_slave_server": jData.middle_slave_server,
			    "mobile_token": jData.mobile_token,
				"grade_sub_code":  jData.grade_sub_code,
				"profile_code": jData.profile_code,
				"pickup_location_eng": jData.pickup_location_eng,
				"pickup_location_chn": jData.pickup_location_chn,
				"pickup_latitude": jData.pickup_latitude,
				"pickup_longitude": jData.pickup_longitude,
				"pickup_district_id": pickup_district_id,
				"drop_location_eng": jData.drop_location_eng,
				"drop_location_chn": jData.drop_location_chn,
				"drop_latitude": jData.drop_latitude,
				"drop_longitude": jData.drop_longitude,
				"drop_district_id": drop_district_id,
				"gapi_km": (EstimateRows.length>0 ? EstimateRows[0].gapi_km : null), 
				"gapi_minute": (EstimateRows.length>0 ? EstimateRows[0].gapi_minute : null), 
				"currency_code": (EstimateRows.length>0 ? EstimateRows[0].currency_code : null), 
				"extra_reason": (EstimateRows.length>0 ? EstimateRows[0].extra_reason : null), 
				"extra_code": (EstimateRows.length>0 ? EstimateRows[0].extra_code : null), 
				"extra_rate": (EstimateRows.length>0 ? EstimateRows[0].extra_rate : null), 
				"extra_desc_eng": (EstimateRows.length>0 ? EstimateRows[0].extra_desc_eng : null), 
				"extra_desc_chn": (EstimateRows.length>0 ? EstimateRows[0].extra_desc_chn : null), 
				"extra_desc_time_eng": (EstimateRows.length>0 ? EstimateRows[0].extra_desc_time_eng : null), 
				"extra_desc_time_chn": (EstimateRows.length>0 ? EstimateRows[0].extra_desc_time_chn : null), 
				"fee_surcharge_code": (EstimateRows.length>0 ? EstimateRows[0].fee_surcharge_code : null), 
				"fee_surcharge": (EstimateRows.length>0 ? EstimateRows[0].fee_surcharge : null), 
				"fee_surcharge_desc_eng": (EstimateRows.length>0 ? EstimateRows[0].fee_surcharge_desc_eng : null), 
				"fee_surcharge_desc_chn": (EstimateRows.length>0 ? EstimateRows[0].fee_surcharge_desc_chn : null), 
				"estimated_min": (EstimateRows.length>0 ? EstimateRows[0].estimated_min : null), 
				"estimated_max": (EstimateRows.length>0 ? EstimateRows[0].estimated_max : null), 
				"arrive_min": (EstimateRows.length>0 ? EstimateRows[0].arrive_min : null), 
				"state_code": jData.state_code,
				"simulation_is": jData.simulation_is,
				"wf_driver_matching_datetime": jData.wf_driver_matching_datetime,
				"create_datetime": jData.create_datetime,
				"last_modify_datetime": jData.last_modify_datetime
				};
				
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_order_request_flow SET ?', jData_Insert, function(err,results){
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
		
	  }
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	
			callback(insertId);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/

	};		//this.Cust_Request_Insert = function(jData, callback) {
	
	
	this.Cust_Request_Change_Location_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Change_Location_Insert');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get last request id
		if(global.debug) console.log('execute async-function-get last request id');
		var statement ='select request_id from tbl_rosf_order_request_flow where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by request_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					request_id =rows[0].request_id;
					//console.log('request_id=' + request_id);
					callback(null) //waterfall call back next function
				});
				connection.on('error', function(err) {      
					  throw err;
					  return;     
				});
			});
	  },
	  function(callback){
		// insert  tbl_rosf_order_request_cust_change_location fee
		if(global.debug) console.log('execute async-function-insert  tbl_rosf_order_request_cust_change_location fee');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var jData_Insert = {
				"request_id": request_id,
				"drop_location_eng": jData.drop_location_eng,
				"drop_location_chn": jData.drop_location_chn,
				"drop_latitude": jData.drop_latitude,
				"drop_longitude": jData.drop_longitude,
				"create_datetime": Now
				};		
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_order_request_cust_change_location SET ?', jData_Insert, function(err,results){
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
			statement	+= ' drop_location_chn = "' + jData.drop_location_eng.replace('"','\\"') + '"' + ',';
			statement	+= ' drop_latitude = "' + jData.drop_latitude + '"' + ',';
			statement	+= ' drop_longitude = "' + jData.drop_longitude + '"' + ',';
			statement	+= ' last_modify_datetime = "' + Now + '"' ;
			statement	+= ' where request_id = ' + request_id ;
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
		
		
		
	};		//this.Cust_Request_Change_Location_Insert = function(jData, callback) {
	
	
	
	this.Cust_Request_Profile_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Profile_Update');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get last request id
		if(global.debug) console.log('execute async-function-get last request id');
		var statement ='select request_id from tbl_rosf_order_request_flow where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by request_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					request_id =rows[0].request_id;
					//console.log('request_id=' + request_id);
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
			statement	+= ' profile_code = "' + jData.profile_code + '"' + ',';
			statement	+= ' last_modify_datetime = "' + Now + '"' ;
			statement	+= ' where request_id = ' + request_id ;
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
			callback(true);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/
		
		
		
	};		//this.Cust_Request_Profile_Update = function(jData, callback) {
		
	
	
	this.Cust_Request_Assess_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Assess_Update');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get last request id
		if(global.debug) console.log('execute async-function-get last request id');
		var statement ='select request_id from tbl_rosf_order_request_flow where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by request_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					request_id =rows[0].request_id;
					//console.log('request_id=' + request_id);
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
			statement	+= ' cust_rank_driver = "' + jData.ranking + '"' + ',';
			statement	+= ' wf_cust_assess_driver_datetime = "' + Now + '"' + ' ' ;
			statement	+= ' where request_id = ' + request_id ;
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
	  },
	  function(callback){
		// update  tbl_oms_ride_order if existed
		if(global.debug) console.log('execute async-function- update  tbl_oms_ride_order');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var statement ='update tbl_oms_ride_order  set ';
			statement	+= ' cust_rank_driver = "' + jData.ranking + '"' + ' ';
			statement	+= ' where request_id = ' + request_id ;
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
			callback(request_id);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/
		
		
		
	};		//this.Cust_Request_Assess_Update = function(jData, callback) {



	this.Cust_Request_Cancel_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Cancel_Update');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get last request id
		if(global.debug) console.log('execute async-function-get last request id');
		var statement ='select request_id from tbl_rosf_order_request_flow where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by request_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					request_id =rows[0].request_id;
					//console.log('request_id=' + request_id);
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
			statement	+= ' state_code = "' + 'ERR_CUST_CANCEL' + '"' + ',';
			statement	+= ' wf_closed_cust_cancel_request_datetime = "' + Now + '"' + ',';
			statement	+= ' last_modify_datetime = "' + Now + '"' ;
			statement	+= ' where request_id = ' + request_id ;
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
			callback(request_id);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/
		
		
		
	};		//this.Cust_Request_Cancel_Update = function(jData, callback) {	
	

	this.Driver_Info_Select = function(req, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Insert');

	
	var statement ='select driver.last_name, driver.first_name, driver.mobile_country, driver.mobile, \
					concat(up.path ,"/" , up.filename) as picture from tbl_driver_user_info as driver \
					left outer join tbl_driver_upload as up  on driver.driver_user_id = up.driver_user_id \
					where driver.driver_user_id=' + req.body.driver_user_id + ' and up.upload_code ="PHOTO" and \
					up.upload_state_code="ACCEPTED" and  up.status = 1 ';

					
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
	
	};		//this.Driver_Info_Select = function(jData, callback) {	


	
	this.Registration_Info_Select = function(req, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Registration_Info_Select');


	/*
	var statement ='select tran.registration_id, model_m.brand_code, tran.model_code, tran.registration_mark, tran.colour, \
					concat(tran_upload.path ,"/" , tran_upload.filename) as picture \
					from tbl_transport_registration as tran \
					left outer join tbl_transport_model_master as model_m on tran.model_code = model_m.model_code \
					left outer join tbl_transport_registration_upload as tran_upload on tran.registration_id = tran_upload.registration_id \
					where tran.registration_id =' + req.body.registration_id + ' and tran_upload.upload_code="HK_CAR_PHOTO" and  \
					tran_upload.upload_state_code="ACCEPTED" and tran_upload.status=1 ';
	*/
	
	var statement ='select tran.registration_id, model_m.brand_code, tran.model_code, tran.registration_mark, tran.colour, \
					model_m.grade_sub_code, \
					gsm.grade_code, gsm.sub_grade_name_eng, gsm.sub_grade_name_chn, gsm.max_passenger \
					from tbl_transport_registration as tran  \
					left outer join tbl_transport_model_master as model_m on tran.model_code = model_m.model_code  \
					left outer join tbl_transport_grade_sub_master as gsm on model_m.grade_sub_code = gsm.grade_sub_code \
					where tran.registration_id =' + req.body.registration_id + ';';


					
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
	
	};		//this.Registration_Info_Select = function(jData, callback) {	
	

	this.Last_Request_Id_Select = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Last_Request_Id_Select');

	var request_id = null;
	
	var statement ='select request_id from tbl_rosf_order_request_flow where ';
	statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
	statement	+= ' order by request_id desc limit 1;';
	console.log(statement);

					
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				for (var i = 0; i < rows.length; i++) {
					request_id =rows[0].request_id;
				}
				callback(request_id);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
	
	};		//this.Last_Request_Id_Select = function(jData, callback) {

	
	
	this.Cust_Request_Donation_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Request_Donation_Update');
	
	var request_id = null;
	
	/************************************************************/
	/***water fall routine*******************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get last request id
		if(global.debug) console.log('execute async-function-get last request id');
		var statement ='select request_id from tbl_rosf_order_request_flow where ';
		statement	+= ' mobile_token = "' + jData.mobile_token + '"' ;
		statement	+= ' order by request_id desc limit 1;';
		//console.log(statement);
		DB_OMS_Pool.getConnection(function(err, connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					connection.release();
					request_id =rows[0].request_id;
					//console.log('request_id=' + request_id);
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
			statement	+= ' donation_amount = "' + jData.donation_amount + '"' + ' ';
			statement	+= ' where request_id = ' + request_id ;
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
	  },
	  function(callback){
		// update  tbl_oms_ride_order if existed
		if(global.debug) console.log('execute async-function- update  tbl_oms_ride_order');
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var statement ='update tbl_oms_ride_order  set ';
			statement	+= ' donation_amount = "' + jData.donation_amount + '"' + ' ';
			statement	+= ' where request_id = ' + request_id ;
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
			callback(request_id);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine**************************************/
	/************************************************************/
		
		
		
	};		//this.Cust_Request_Donation_Update = function(jData, callback) {

	
	
	this.Driver_Online_Handshaking_Clear_Update = function(driver_user_id, callback){

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Online_Handshaking_Clear_Update');

	var statement ='update tbl_rosf_driver_online_gps set ';
		statement	+= ' handshaking_datetime = NULL ' + ' ';
		statement	+= ' where ';
		statement	+= ' driver_user_id = ' + '"' + driver_user_id + '"';

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
		
	};	//this.Driver_Online_Handshaking_Clear_Update = function(request_id, callback){


	
	this.Cust_Location_History_Select = function(jData, callback) {

		//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Location_History_Select');
		
		var statement = 'select * from tbl_rosf_cust_location_history ';
			statement += ' where mobile_token ="' + jData.mobile_token + '"';
			statement += ' order by last_modify_datetime desc limit 20 ';
		
							
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
			
			};		//this.Cust_Location_History_Select = function(jData, callback) {	
		
		
		

	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Request_Model;