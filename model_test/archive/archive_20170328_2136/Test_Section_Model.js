//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
const Model_Name = 'Test_Section_Model';
const Model_Logger= require('../func/Model_Logger.js');	

const mysql= require("mysql");


function Test_Section_Model(){
    
	//constructor
	
	var LogInfo = new Model_Logger(Model_Name,'../model_log_info','info.log');
	var LogErr = new Model_Logger(Model_Name,'../model_log_err','err.log');

	
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
				if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + 'this.connect' + ' > no error ');
				}
	});

	//constructor - end 
	
	
	
	this.ListAll = function(fallback) {

	console.log('execute list_all()');
	var query = this.conn.query('select * from tbl_test', function (err, results, fields) {
			if(err) {
				LogErr.Err('func: ' + 'this.list_all' + ' > SQL err: ' + err);
			} else {
				if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + 'this.list_all' + ' > no error ');
				fallback(results); }
				}
				);	
		
	};


	
	this.Insert = function(JsonData,fallback) {

	console.log('execute Insert()');
	var query = this.conn.query('INSERT INTO tbl_test SET ?',JsonData,function (err, results ) {
			if(err) {
				LogErr.Err('func: ' + 'this.Insert' + ' > SQL err: ' + err);
			} else {
				if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + 'this.Insert' + ' > no error ');
				fallback(results.insertId); }
				}
				);	
		
	};


	
	
	this.Disconnect = function(fallback) {

		this.conn.end(
			function(err){
			if(err) {
				LogErr.Err('func: ' + 'this.disconnect' + ' > SQL err: ' + err);
			} else {
				//if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + 'this.disconnect' + ' > no error ');
				}
			});
		
	};

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Test_Section_Model;