const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Geo_Model(){
    
	//no constructor
	
	this.Geo_Station_Master_List = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Geo_Station_Master_List');

	var statement ='select station_id, stream_code, station_name_eng, station_name_chn, center_latitude, center_longitude, \
						sorting,status from tbl_oms_geo_station_master order by sorting asc, status asc;';

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


module.exports= OMS_Geo_Model;