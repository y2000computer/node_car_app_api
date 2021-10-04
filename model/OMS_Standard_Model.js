const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Standard_Model(){
    
	//no constructor
	
	this.Standard_Fee_Peak_Hour_Master_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Standard_Fee_Peak_Hour_Master_List_All');

	var statement ='select gsm.grade_sub_code, sf.peak_code, sf.grade_code, sf.region_code, sf.desc_eng, sf.desc_chn,sf.desc_time_eng, \
						sf.desc_time_chn, sf.percent_factor, sf.mon_is, sf.tue_is, sf.wed_is, sf.thr_is, sf.fri_is, \
						sf.sat_is, sf.sun_is, sf.holiday_is, sf.time_from, sf.time_to, sf.status, reg.stream_code, \
						reg.region_name_eng, reg.region_name_chn from tbl_oms_standard_fee_peak_hour_master as sf \
						left outer join tbl_oms_geo_region_master as reg on sf.region_code = reg.region_code  \
						left outer join tbl_transport_grade_sub_master as gsm on sf.grade_code = gsm.grade_code \
						where sf.status = 1  \
						order by gsm.grade_sub_code, sf.peak_code';


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



	this.Standard_Fee_Standard_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Standard_Fee_Standard_Select');

	var statement ='select grade_sub_code, region_code, currency_code, fee_start_up, fee_per_km, \
							fee_per_min, fee_min_charge, grey_hour, cust_charge_code, driver_charge_code, \
							agency_charge_code, status from tbl_oms_standard_fee_master where ';
	statement	+= 'grade_sub_code="' + req.body.grade_sub_code + '" and  region_code = "' + req.body.region_code + '";' ;
	
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


module.exports= OMS_Standard_Model;