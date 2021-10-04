//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
const mysql= require("mysql");
const DB_Middle_Core_Pool = require('../func/DB_Middle_Core_Pool.js').DB_Middle_Core_Pool;


function Core_Traffic_Model(){
    
	//constructor
	

	//constructor - end 
	
		
	this.Insert = function(JsonData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' > func: '+'Insert');
	
    DB_Middle_Core_Pool.getConnection(function(err,connection){
			if (err) {
			  connection.release();
			  throw err;
			}   
			connection.query('INSERT INTO tbl_sys_api_traffic_log SET ?',JsonData,function(err,results){
				connection.release();
				if(!err) {
					callback(results.insertId);
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


module.exports= Core_Traffic_Model;