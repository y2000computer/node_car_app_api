const moment= require('moment');
const mysql= require("mysql");
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;


function OMS_Api_Startup_Model(){
    
	//no constructor
	
	this.writeLog = function(callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'writeLog');

	var Now = moment().format('YYYY-MM-DD H:mm:ss');
	var jData = {
		"api_server_domain": global.api_server_domain,
		"server_log_datetime": Now
	};
	
    DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_sys_api_startup_log SET ?', jData, function(err, results){
				if(global.debug)console.log('write Log insert_id= ' + results.insertId);
				connection.release();
				callback(results.insertId);
				if(err) throw err;
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};	
	


	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	
};


module.exports= OMS_Api_Startup_Model;