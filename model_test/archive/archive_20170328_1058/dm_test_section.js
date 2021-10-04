const model_name = 'DmTestSection';
const ModelLogger= require('../model/model_logger.js');	

const mysql= require("mysql");


function DmTestSection(){
    
	//constructor
	
	var LogInfo = new ModelLogger(model_name,'../model_log_info','info.log');
	var LogErr = new ModelLogger(model_name,'../model_log_err','err.log');

	
	this.conn = mysql.createConnection({
	  host     : global.appConfig.db_order_management.host,
	  port     : global.appConfig.db_order_management.port,
	  user     : global.appConfig.db_order_management.user,
	  password : global.appConfig.db_order_management.password,
	  database : global.appConfig.db_order_management.database
	});
	
	
	this.conn.connect(function (err) {
			if(err) {
				LogErr.Err('func: ' + 'this.connect' + ' > SQL err: ' + err);
			} else {
				LogInfo.Info('func: ' + 'this.connect' + ' > no error ');
				}
	});

	//constructor - end 
	
	
	this.ListAll = function(fallback) {

	console.log('execute list_all()');
	var query = this.conn.query('select * from tbl_test', function (err, results, fields) {
			if(err) {
				LogErr.Err('func: ' + 'this.list_all' + ' > SQL err: ' + err);
			} else {
				LogInfo.Info('func: ' + 'this.list_all' + ' > no error ');
				fallback(results); }
				}
				);	
		
	};

	
	
	this.Disconnect = function(fallback) {

		this.conn.end(
			function(err){
			if(err) {
				LogErr.Err('func: ' + 'this.disconnect' + ' > SQL err: ' + err);
			} else {
				LogInfo.Info('func: ' + 'this.disconnect' + ' > no error ');
				}
			});
		
	};

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= DmTestSection;