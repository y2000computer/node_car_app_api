const model_name = 'test_sector_list_all_with_log';

const mysql= require("mysql");
const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = '../model_log_err';
const logFileName = model_name + '_err_log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      filename: `${logDir}/${logFileName}`,
      timestamp: tsFormat,
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
});

function test_sector_list_all_with_log(){
    
	//constructor
	
	this.conn = mysql.createConnection({
	  host     : global.appConfig.db_order_management.host,
	  port     : global.appConfig.db_order_management.port,
	  user     : global.appConfig.db_order_management.user,
	  password : global.appConfig.db_order_management.password,
	  database : global.appConfig.db_order_management.database
	});
	
	
	this.conn.connect(function (err) {
		if(err) {
			logger.error('func : ' + 'this.conn.connect' + ' > SQL err: ' + err);
			}	
	});

	//constructor - end 
	
	this.list_all = function(fallback) {

	console.log('execute list_all()');
	var query = this.conn.query('select * from tbl_test1', function (err, results, fields) {
			if(err) {
				logger.error('func: ' + 'this.list_all' + ' > SQL err: ' + err);
			} else {
				fallback(results); }
				}
				);	
		
	};

	
	
	this.disconnect = function(fallback) {

		this.conn.end(
			function(err){
			if(err) {
				logger.error('func: ' + 'this.disconnect' + ' > SQL err: ' + err);
			} else {
				console.log('closed connection successfully')
				}
			});
		
	};

	
	//////////////////////////////////////////////////////////////////////////
	
	

	
	
};


module.exports= test_sector_list_all_with_log;