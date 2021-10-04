const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Standard_Fee_Master_Model(){
    
	//no constructor
	
	this.Standard_Fee_Peak_Hour_Master_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Standard_Fee_Peak_Hour_Master_List_All');

	var statement ='select peak.peak_code, peak.grade_code, peak.region_code, reg.region_code, reg.region_name_eng, reg.region_name_chn, \
					peak.desc_eng, peak.desc_chn, peak.desc_time_eng, peak.desc_time_chn, peak.percent_factor, peak.mon_is, peak.tue_is, peak.wed_is, \
					peak.thr_is, peak.wed_is, peak.thr_is, peak.fri_is, peak.sat_is,  peak.sun_is, peak.holiday_is, \
					peak.time_from, peak.time_to from tbl_oms_standard_fee_peak_hour_master as peak  \
					left outer join tbl_oms_geo_region_master as reg on peak.region_code = reg.region_code \
					where peak.status = 1 order by peak.peak_code ; ';
	
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
	
	
	this.Standard_Fee_Override_Factor_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Standard_Fee_Override_Factor_List_All');

	var statement= 'select grade.stream_code, grade.grade_code, \
						sub.grade_sub_code, \
						over.factor_id, over.percent_factor, \
						over.district_id,  \
						dist.district_name_eng,  dist.district_name_chn, \
						reg.region_code, reg.region_name_chn, dist.district_name_chn  \
						from tbl_transport_grade_master as grade  \
						left outer join tbl_transport_grade_sub_master as sub on grade.grade_code = sub.grade_code \
						right join tbl_oms_standard_fee_override_factor as over  on grade.grade_code = over.grade_code \
						left outer join tbl_oms_geo_district_master as dist on over.district_id = dist.district_id  \
						left outer join tbl_oms_geo_region_master as reg on dist.region_code = reg.region_code  \
						where grade.stream_code="HK_CAR"  \
						order by grade.grade_code, sub.grade_sub_code , over.factor_id ;';

	
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
	

	
	this.Standard_Fee_Master_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Standard_Fee_Master_List_All');

	var statement='select fee.grade_sub_code, reg.region_code, reg.region_name_eng, reg.region_name_chn,  \
					fee.currency_code, fee.fee_start_up,fee.fee_per_km, fee.fee_per_min, fee.fee_min_charge   \
					from tbl_oms_standard_fee_master  as fee  \
					left outer join tbl_oms_geo_region_master as reg on fee.region_code = reg.region_code \
					order by fee.grade_sub_code,fee.region_code ; ';
	
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
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Standard_Fee_Master_Model;