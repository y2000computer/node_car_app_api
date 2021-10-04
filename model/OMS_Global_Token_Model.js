const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Global_Token_Model(){
    
	//no constructor
	

	this.Global_Token_Map_Select = function(token, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Global_Token_Map_Select');

	var statement ='select mobile_token,user_type,user_id,status  from tbl_global_token_map where ';
	statement	+= ' mobile_token="' + token + '"';
	
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
		
	
	
	this.Global_Token_Map_Select_Insert = function(jData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_global_token_map SET ?', jData, function(err,results){
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
	
	

	this.Global_Token_Map_UDID_Black_List_Is = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Global_Token_Map_UDID_Black_List_Is');

	var statement ='select count(*) as black_list_count from tbl_cust_udid_black_list where ';
		statement	+= ' udid="' + jData.udid + '"' ;
		statement	+= ' and status = 1; ';

	console.log(statement);
	
	var found_is = false;
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				if(rows[0].black_list_count != 0) {
					found_is = true ;
				}
				callback(found_is);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};	
	
	

	this.Push_Message_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Push_Message_Update');

					
	var statement ='update tbl_global_token_map  set ';
		//statement	+= ' mobile_os = "' + jData.mobile_brand + '"' + ' ';
		statement	+= ' push_message_token = "' + jData.push_message_token + '"' + ' ';
		statement	+= ' where mobile_token = "' + jData.token + '"';
	
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


module.exports= OMS_Global_Token_Model;