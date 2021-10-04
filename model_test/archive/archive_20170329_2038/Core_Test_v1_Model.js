//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
const mysql= require("mysql");
const DB_OMS_Pool = require('../func_test/DB_OMS_Pool.js').DB_OMS_Pool;

function Core_Test_v1_Model(){
    
	//constructor
	//constructor - end 
	
	
	this.List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' > func: '+'List_All');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) {
			  connection.release();
			  throw err;
			}   
			connection.query('select * from tbl_test limit 10',function(err,rows){
				connection.release();
				if(!err) {
					callback(rows);
					} else {
						throw err;
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


module.exports= Core_Test_v1_Model;