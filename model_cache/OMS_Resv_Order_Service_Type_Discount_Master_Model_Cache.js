const mysql= require('mysql');
const Cache = require("lite-node-cache"); // if es6 support. 
 
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

const statement = 'select \
					dm.type_code,\
					tm.type_name_eng,\
					tm.type_name_chn,\
					dm.discount_percent\
					from tbl_resv_order_service_type_discount_master  as dm \
					left join tbl_resv_order_service_type_master as tm on dm.type_code = tm.type_code \
					where dm.status =1 ';


function OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache(){
    
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

module.exports= OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache;