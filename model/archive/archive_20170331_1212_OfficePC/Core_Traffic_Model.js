const moment= require('moment');
const mysql= require("mysql");
const DB_Core_Pool = require('../func/DB_Core_Pool.js').DB_Core_Pool;


function Core_Traffic_Model(){
    
	//no constructor
	
	this.writeLog = function(req, mobile_token, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'writeLog');

	var Now = moment().format('YYYY-MM-DD H:mm:ss');
	var jData = {
		"api_server_domain": global.api_server_domain,
		"req_ip": req.ip,
		"req_originalUrl": req.originalUrl,
		"mobile_token": mobile_token,
		"server_log_datetime": Now
	};
	
    DB_Core_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_sys_api_traffic_log SET ?', jData, function(err, results){
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


module.exports= Core_Traffic_Model;