const mysql= require('mysql');
const Cache = require("lite-node-cache"); // if es6 support. 
 
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

const statement= 'select fee.grade_sub_code, reg.region_code, reg.region_name_eng, reg.region_name_chn,  \
					fee.currency_code, fee.fee_start_up,fee.fee_per_km, fee.fee_per_min, fee.fee_min_charge,  \
					fee.donation_is \
					from tbl_oms_standard_fee_master  as fee  \
					left outer join tbl_oms_geo_region_master as reg on fee.region_code = reg.region_code \
					order by fee.grade_sub_code,fee.region_code ; ';



function OMS_Standard_Fee_Master_Model_Cache(){
    
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

module.exports= OMS_Standard_Fee_Master_Model_Cache;