//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
const Model_Name = 'Test_Section_Pool_Model';
const Model_Logger= require('../func/Model_Logger.js');	
const mysql= require("mysql");
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function Test_Section_Pool_2_Model(){
    
	//constructor
	
	var LogInfo = new Model_Logger(Model_Name,'../model_log_info','info.log');
	var LogErr = new Model_Logger(Model_Name,'../model_log_err','err.log');

	//constructor - end 
	
	
	
	this.List_All_Pool = function(callback){
		
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) {
			  connection.release();
			  throw err;
			}   
			connection.query('select * from tbl_test limit 10',function(err,rows){
				connection.release();
				if(!err) {
					callback(rows);
				}           
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	


	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Test_Section_Pool_2_Model;