const mysql= require('mysql');
const Cache = require("lite-node-cache"); // if es6 support. 
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

const statement= 'select peak.peak_code, peak.grade_code, peak.region_code, reg.region_code, reg.region_name_eng, reg.region_name_chn, \
					peak.desc_eng, peak.desc_chn, peak.desc_time_eng, peak.desc_time_chn, peak.percent_factor, peak.mon_is, peak.tue_is, peak.wed_is, \
					peak.thr_is, peak.wed_is, peak.thr_is, peak.fri_is, peak.sat_is,  peak.sun_is, peak.holiday_is, \
					peak.time_from, peak.time_to from tbl_oms_standard_fee_peak_hour_master as peak  \
					left outer join tbl_oms_geo_region_master as reg on peak.region_code = reg.region_code \
					where peak.status = 1 order by peak.peak_code ; ';


function OMS_Standard_Fee_Peak_Hour_Master_Model_Cache(){
    
	//constructor
	const cacheInstance = new Cache({
		ttl: global.lifetime_msec, // the lifetime of the recording in milliseconds 
		garbageCollectorTimeInterval: global.garbageCollectorTimeInterval_mesc,
		garbageCollectorAsyncMode: false,
		debugMode: true
	});


	function storing() {
		let result = cacheInstance.get(statement);
		if (result) {
			if(global.debug) console.log ('__filename: '+__filename+' & func: storing()> get query result from cache');			
		} else {
		
				 DB_OMS_Pool.getConnection(function(err, connection){
						if (err) throw err;
						connection.query(statement, function(err, rows, fields){
							if(err) throw err;
							connection.release();
							cacheInstance.set(statement, rows);
							if(global.debug) console.log ('__filename: '+__filename+' & func: storing()> new query and save result in cache');			
						});
						connection.on('error', function(err) {      
							  throw err;
							  return;     
						});
					});

			}
			return;
	};	
	
	var record = storing(function() {});
	setInterval(storing , reload_msec);

	//<end> constructor
	
	
	this.List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'List_All');

	var record = cacheInstance.get(statement);
	if (record) {
		callback(record);
		return;	
	}	
	
	(function myLoop (i) {          
	   setTimeout(function () {   
		    //console.log('loop:' + i);           
		    var record = cacheInstance.get(statement);
			if (record) {
				callback(record);
				return;
				}
			if (!record) myLoop(--i);
	   }, 5)
	})(10000);   
	
	};



	
	
}; 

module.exports= OMS_Standard_Fee_Peak_Hour_Master_Model_Cache;