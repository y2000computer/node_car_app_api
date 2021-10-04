const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Driver_Token_Model(){
    
	//no constructor
	


	this.Token_Insert = function(jData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_driver_token SET ?', jData, function(err,results){
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
	
	
	
	this.Token_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Token_Select');

	
	var statement ='select token.mobile_token,token.status, map.driver_user_id from tbl_driver_token  as token \
					left outer join tbl_driver_user_info_token as map on token.mobile_token = map.mobile_token ';
		statement	+= ' where token.mobile_token="' + req.body.token + '";' ;
	
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


	this.Token_Mapped_Select = function(j, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Token_Mapped_Select');

	
	var statement ='select * from tbl_driver_user_info_token \ ';
		statement	+= ' where mobile_token="' + j.token + '";' ;
	
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

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Token_Model;