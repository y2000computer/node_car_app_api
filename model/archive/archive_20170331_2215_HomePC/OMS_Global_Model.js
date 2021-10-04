const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Global_Model(){
    
	//no constructor
	
	this.Global_Response_Code_Master_List = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Global_Response_Code_Master_List');
	
    DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query('select category, code, msg_eng, msg_chi from tbl_global_response_code_master order by category, code;', function(err, rows){
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
	

	this.Global_Language_Master_List = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Global_Language_Master_List');
	
    DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query('select  language_code, language_name, country_code from tbl_global_language_master;', function(err, rows){
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
	

	this.Global_Mobile_Country_Master_List = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Global_Mobile_Country_Master_List');
	
	var statement ='select mobile_country_code as "code", mobile_country_name as "name",case default_is \
				when 1 then "true"	when 0 then "false"	end as "default"	\
				from tbl_global_mobile_country_master order by default_is desc , name asc;';
	
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

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Global_Model;