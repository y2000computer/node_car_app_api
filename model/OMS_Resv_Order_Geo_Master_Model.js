const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Resv_Order_Geo_Master_Model(){
    
	//no constructor
	
	this.Get_District = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Get_District');

	var statement ='CALL sp_get_resv_order_district_v01( ';
		statement	+= '' + jData.latitude + '' + ',';
		statement	+= '' + jData.longitude + '' + ' ';
		statement	+= ') ; ';

	console.log(statement);
		
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(results[0]);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	

	this.Get_Surcharge_District = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Get_Surcharge_District');

	var statement ='select * from tbl_oms_geo_district_surcharge_master 	where ';
		statement	+= 'ne_latitude>"' + jData.latitude + '"' ;
		statement	+= ' and ';
		statement	+= 'sw_latitude<"' + jData.latitude + '"' ;
		statement	+= ' and ';
		statement	+= 'ne_longitude>"' + jData.longitude + '"' ;
		statement	+= ' and ';
		statement	+= 'sw_longitude<"' + jData.longitude + '"' ;

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


module.exports= OMS_Resv_Order_Geo_Master_Model;