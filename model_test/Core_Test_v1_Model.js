const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func_test/DB_OMS_Pool.js').DB_OMS_Pool;

function Core_Test_v1_Model(){
    
	//no constructor
	
	this.List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List_All');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('select * from tbl_test limit 10',function(err,rows){
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
	
	

	this.Insert = function(jData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_test SET ?', jData, function(err,results){
				if(err) throw err;
				connection.release();
				callback(results.insertId);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Core_Test_v1_Model;