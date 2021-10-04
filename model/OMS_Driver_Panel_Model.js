const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	

function OMS_Driver_Panel_Model(){
    
	//no constructor
	
	
	this.Switch_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Switch_Insert');
	
	var insertId = null;	
	var district_id = null;
	var jDestination = {
		"location_eng": null,
		"location_chn": null,
		"latitude": null,
		"longitude": null,
		"district_id": null
	};
						
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get distict_id
		if(global.debug) console.log('execute async-function-get district_id');
		
		var dmOMS = new OMS_Geo_Model();
		var record = dmOMS.Get_District(jData, function(data) {
				console.log("execute dmOMS.Get_District()");
				district_id = data[0].district_id;
				console.log('district_id=' + district_id);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		// select   tbl_rosf_driver_destination
		if(global.debug) console.log('execute async-function-select tbl_rosf_driver_destination');

		var statement ='select * from tbl_rosf_driver_destination ';
			statement	+= ' where ' ;					
			statement	+= 'driver_user_id="' + jData.driver_user_id + '"' ;			
			statement	+= ' and status=1 order by irow_id desc limit 1;';			

	    console.log(statement);
			
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, rows){
					if(err) throw err;
					for (var i = 0; i < rows.length; i++) {
					    
						jDestination = {
							location_eng: rows[i].location_eng,
							location_chn: rows[i].location_chn,
							latitude: rows[i].latitude,
							longitude: rows[i].longitude,
							district_id: rows[i].district_id
						};	
						console.log('rows[i].location_eng=' +rows[i].location_eng);
						console.log('jDestination=' +jDestination.location_eng);

					}
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
		// insert  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-insert tbl_rosf_driver_online_gps');

		 console.log('CCC> jDestination.location_eng = '+jDestination.location_eng);
		 
		var jData_Insert = {
				"driver_user_id": jData.driver_user_id,
				"middle_core_server_code": "CORE_HK",
				"middle_slave_server_code": "HK_SLAVE_01",
				"mobile_token": jData.mobile_token,
				"registration_id": jData.registration_id,
				"gps_provider": jData.from_gps_type,
				"gps_location_provider": "N/A",
				"gps_time": "N/A",
				"gps_latitude": jData.latitude,
				"gps_longitude": jData.longitude,
				"gps_accuracy": 0,
				"gps_speed": 0,
				"gps_altitude": 0,
				"gps_bearing": 0,
				"mobile_apps_version": "N/A",
				"mobile_source_ip": "N/A",
				"mobile_datetime": jData.create_datetime,
				"district_id": district_id,
				"dest_location_eng": jDestination.location_eng,
				"dest_location_chn": jDestination.location_chn,
				"dest_latitude": jDestination.latitude,
				"dest_longitude": jDestination.longitude,
				"dest_district_id": jDestination.district_id,
				"status": 1,
				"server_log_datetime": jData.create_datetime
				};
				
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_driver_online_gps SET ?', jData_Insert, function(err,results){
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
		// insert  tbl_rosf_driver_online_region_queue if *airport district 
		if(global.debug) console.log('execute async-function-tbl_rosf_driver_online_region_queue if *airport district ');

		if(district_id == 88 || district_id == 89 || district_id == 90) {
	
			var statement ='INSERT INTO tbl_rosf_driver_online_region_queue (district_id, driver_user_id, `status`,\
									server_log_datetime) SELECT * FROM (SELECT ';
			statement	+= district_id + ',' + jData.driver_user_id + ',1,  NOW() ) AS tmp';					
			statement	+= ' WHERE NOT EXISTS ( \
									SELECT driver_user_id FROM tbl_rosf_driver_online_region_queue WHERE ';				
			statement	+= ' driver_user_id' + '=' + jData.driver_user_id ;			
			statement	+= ' AND ';	
			statement	+= ' `status` = 1 ) LIMIT 1;' ;			
		
			console.log(statement);
					
			DB_OMS_Pool.getConnection(function(err,connection){
					if (err) throw err;
					connection.query(statement, function(err, results){			
						if(err) throw err;
						connection.release();
					});
					connection.on('error', function(err) {      
						  throw err;
						  return;     
					});
				});
		}// if(district_id == 88 || district_id == 89 || district_id == 90) {
		
		callback(null) //waterfall call back next function

	  }
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	
			callback(insertId);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/

	};		//this.Switch_Insert = function(jData, callback) {
	
	
	
	this.Switch_Archive = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Switch_Archive');
	
	var insertId = null;	
	var district_id = null;
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// insert into tbl_rosf_driver_online_gps_archive
		if(global.debug) console.log('execute async-function-get insert into tbl_rosf_driver_online_gps_archive');

		var statement ='insert into tbl_rosf_driver_online_gps_archive \
					(driver_user_id, middle_core_server_code, middle_slave_server_code, mobile_token, \
					registration_id, gps_provider, gps_location_provider, gps_time, gps_latitude, gps_longitude, \
					gps_accuracy, gps_speed, gps_altitude, gps_bearing, mobile_apps_version, mobile_source_ip, \					mobile_datetime, district_id,  \
					dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id, \
					status, handshaking_datetime, server_log_datetime) \
					select * from tbl_rosf_driver_online_gps ';
		statement	+= ' where ' ;					
		statement	+= ' driver_user_id="' + jData.driver_user_id + '"';				

		console.log(statement);
		
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
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
		// delete  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function- delete  tbl_rosf_driver_online_gps');

		
		var statement ='delete from tbl_rosf_driver_online_gps ';
		statement	+= ' where ' ;					
		statement	+= ' driver_user_id="' + jData.driver_user_id + '"';				

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
		// delete  tbl_rosf_driver_online_region_queue 
		if(global.debug) console.log('execute async-function-delete  tbl_rosf_driver_online_region_queue  ');
	
		var statement ='DELETE from tbl_rosf_driver_online_region_queue ';
		statement	+= ' WHERE ' ;					
		statement	+= ' driver_user_id="' + jData.driver_user_id + '"';				

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
			callback(insertId);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/

	};		//this.Switch_Archive = function(jData, callback) {

	
	
	
	this.Online_GPS_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Online_GPS_Update');
	
	var district_id = null;
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// insert into tbl_rosf_driver_online_gps_archive
		if(global.debug) console.log('execute async-function-get insert into tbl_rosf_driver_online_gps_archive');

		var statement ='insert into tbl_rosf_driver_online_gps_archive \
					(driver_user_id, middle_core_server_code, middle_slave_server_code, mobile_token, \
					registration_id, gps_provider, gps_location_provider, gps_time, gps_latitude, gps_longitude, \
					gps_accuracy, gps_speed, gps_altitude, gps_bearing, mobile_apps_version, mobile_source_ip, \					mobile_datetime, district_id,  \
					dest_location_eng, dest_location_chn, dest_latitude, dest_longitude, dest_district_id, \
					status, handshaking_datetime, server_log_datetime) \
					select * from tbl_rosf_driver_online_gps ';
		statement	+= ' where ' ;					
		statement	+= ' driver_user_id="' + jData.driver_user_id + '"';				

		console.log(statement);
		
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query(statement, function(err, results){			
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
		// get distict_id
		if(global.debug) console.log('execute async-function-get district_id');
		
		var dmOMS = new OMS_Geo_Model();
		var record = dmOMS.Get_District(jData, function(data) {
				console.log("execute dmOMS.Get_District()");
				district_id = data[0].district_id;
				console.log('district_id=' + district_id);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function- update tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' gps_provider = "' + jData.from_gps_type + '"' + ',';
			statement	+= ' gps_latitude = "' + jData.latitude + '"' + ',';
			statement	+= ' gps_longitude = "' + jData.longitude + '"' + ',';
			statement	+= ' district_id = "' + district_id + '"' + ',';
			statement	+= ' server_log_datetime = "' + jData.last_modify_datetime + '"' + ' ';
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
		// delete  tbl_rosf_driver_online_region_queue any
		if(global.debug) console.log('execute async-function-delete tbl_rosf_driver_online_region_queue any ');

		if(district_id != 88 && district_id != 89 && district_id != 90) {
	

			var statement ='DELETE from tbl_rosf_driver_online_region_queue ';
			statement	+= ' WHERE ' ;					
			statement	+= ' driver_user_id="' + jData.driver_user_id + '"';				

			console.log(statement);
					
			DB_OMS_Pool.getConnection(function(err,connection){
					if (err) throw err;
					connection.query(statement, function(err, results){			
						if(err) throw err;
						connection.release();
					});
					connection.on('error', function(err) {      
						  throw err;
						  return;     
					});
				});
		}// if(district_id != 88 && district_id @= 89 && district_id != 90) {
		
		callback(null) //waterfall call back next function

	  },	  
	  function(callback){
		// insert  tbl_rosf_driver_online_region_queue if *airport district 
		if(global.debug) console.log('execute async-function-tbl_rosf_driver_online_region_queue if *airport district ');

		if(district_id == 88 || district_id == 89 || district_id == 90) {
	
			var statement ='INSERT INTO tbl_rosf_driver_online_region_queue (district_id, driver_user_id, `status`,\
									server_log_datetime) SELECT * FROM (SELECT ';
			statement	+= district_id + ',' + jData.driver_user_id + ',1,  NOW() ) AS tmp';					
			statement	+= ' WHERE NOT EXISTS ( \
									SELECT driver_user_id FROM tbl_rosf_driver_online_region_queue WHERE ';				
			statement	+= ' driver_user_id' + '=' + jData.driver_user_id ;			
			statement	+= ' AND ';	
			statement	+= ' `status` = 1 ) LIMIT 1;' ;			
		
			console.log(statement);
					
			DB_OMS_Pool.getConnection(function(err,connection){
					if (err) throw err;
					connection.query(statement, function(err, results){			
						if(err) throw err;
						connection.release();
					});
					connection.on('error', function(err) {      
						  throw err;
						  return;     
					});
				});
		}// if(district_id == 88 || district_id == 89 || district_id == 90) {
		
		callback(null) //waterfall call back next function

	  }
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	
			callback(result);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/

	};		//this.Online_GPS_Update = function(jData, callback) {
	
	

	this.Destination_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Destination_Select');

	
	var statement ='select location_eng,location_chn,latitude,longitude from tbl_rosf_driver_destination where ';
		statement	+= 'driver_user_id=' + jData.driver_user_id + ' and status=1 order by irow_id; ';

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

	
	this.Destination_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Destination_Insert');
	
	var insertId = null;	
	var district_id = null;
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// get distict_id
		if(global.debug) console.log('execute async-function-get district_id');
		
		var dmOMS = new OMS_Geo_Model();
		var record = dmOMS.Get_District(jData, function(data) {
				console.log("execute dmOMS.Get_District()");
				district_id = data[0].district_id;
				console.log('district_id=' + district_id);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		// update  tbl_rosf_driver_destination
		if(global.debug) console.log('execute async-function- update tbl_rosf_driver_destination');

		var statement ='update tbl_rosf_driver_destination set ';
			statement	+= ' status = 0  ,';
			statement	+= ' server_log_datetime = "' + jData.last_modify_datetime + '"' + ' ';
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
		// insert  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-insert tbl_rosf_driver_destination');

		var jData_Insert = {
				"driver_user_id": jData.driver_user_id,
				"location_eng": jData.location_eng,
				"location_chn": jData.location_chn,
				"latitude": jData.latitude,
				"longitude": jData.longitude,
				"district_id": district_id,
				"status": 1,
				"server_log_datetime": jData.create_datetime
				};
				
		DB_OMS_Pool.getConnection(function(err,connection){
				if (err) throw err;
				connection.query('INSERT INTO tbl_rosf_driver_destination SET ?', jData_Insert, function(err,results){
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
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update  tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' dest_location_eng = "' + jData.location_eng + '"' + ',';
			statement	+= ' dest_location_chn = "' + jData.location_chn + '"' + ',';
			statement	+= ' dest_latitude = "' + jData.latitude + '"' + ',';
			statement	+= ' dest_longitude = "' + jData.longitude + '"' + ',';
			statement	+= ' dest_district_id = "' +district_id + '"' ;
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
			callback(insertId);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/

	};		//this.Destination_Insert = function(jData, callback) {
	
	
	
	this.Destination_Update = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Destination_Update');
	
	var insertId = null;	
	var district_id = null;
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
	  function(callback){
		// update  tbl_rosf_driver_destination
		if(global.debug) console.log('execute async-function- update tbl_rosf_driver_destination');

		var statement ='update tbl_rosf_driver_destination set ';
			statement	+= ' status = 0  ,';
			statement	+= ' server_log_datetime = "' + jData.last_modify_datetime + '"' + ' ';
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
		// update  tbl_rosf_driver_online_gps
		if(global.debug) console.log('execute async-function-update  tbl_rosf_driver_online_gps');

		var statement ='update tbl_rosf_driver_online_gps set ';
			statement	+= ' dest_location_eng = null' + ',';
			statement	+= ' dest_location_chn = null' + ',';
			statement	+= ' dest_latitude = null'  + ',';
			statement	+= ' dest_longitude = null' + ',';
			statement	+= ' dest_district_id = null'  ;
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
			callback(insertId);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/

	};		//this.Destination_Update = function(jData, callback) {
	


	
	this.Online_Vehicle_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Online_Vehicle_Update');

					
	var statement ='update tbl_rosf_driver_online_gps set ';
		statement	+= ' registration_id = "' + jData.registration_id + '"' + ',';
		statement	+= ' server_log_datetime = "' + jData.last_modify_datetime + '"' + ' ';
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
	


	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Panel_Model;