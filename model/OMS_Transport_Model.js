const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Transport_Model(){
    
	//no constructor
	

	this.Transport_Grade_Master_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Transport_Grade_Master_List_All');

	var statement ='select grade_code, stream_code, grade_name_eng, sorting, status \
							from tbl_transport_grade_master where status=1 order by sorting asc;';

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
	
	
	
	this.Transport_Grade_Sub_Master_Select = function(grade_code, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Transport_Grade_Sub_Master_Select');

	var statement ='select grade_sub_code, grade_code, sub_grade_name_eng, sub_grade_name_chn, max_passenger, \
							service_ride_is, service_reservation_is, sorting, status from tbl_transport_grade_sub_master ';
	statement	+= ' where grade_code="' + grade_code + '"';
	statement	+= ' and service_ride_is=1 and status=1 order by grade_code asc, sorting asc; ';

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


module.exports= OMS_Transport_Model;