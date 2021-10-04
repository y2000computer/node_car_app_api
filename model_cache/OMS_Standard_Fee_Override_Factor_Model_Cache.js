const mysql= require('mysql');
const Cache = require("lite-node-cache"); // if es6 support. 
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;


const statement= 'select grade.stream_code, grade.grade_code, \
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

					
function OMS_Standard_Fee_Override_Factor_Model_Cache(){
    
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

module.exports= OMS_Standard_Fee_Override_Factor_Model_Cache;