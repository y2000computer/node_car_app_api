//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
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
				LogErr.Err('func: ' + Model_Name + '.conn.connect' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.conn.connect' + ' > success ');
					}
	});

	//constructor - end 
	
	
	
	this.List_All = function(fallback) {

	console.log('execute List_All()');
	var query = this.conn.query('select * from tbl_test', function (err, results, fields) {
			if(err) {
				LogErr.Err('func: ' + Model_Name + '.List_All' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.List_All' + ' > success ');
					fallback(results); }
					}
				);	
		
	};


	
	this.Insert = function(JsonData,fallback) {

	console.log('execute Insert()');
	var query = this.conn.query('INSERT INTO tbl_test SET ?',JsonData,function (err, results ) {
			if(err) {
				LogErr.Err('func: ' + Model_Name + '.Insert' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.Insert' + ' > success ');
					fallback(results.insertId); }
					}
				);	
		
	};


	
	
	this.Disconnect = function(fallback) {

		this.conn.end(
			function(err){
			if(err) {
				 LogErr.Err('func: ' + Model_Name + '.Disconnect' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.Disconnect' + ' > success ');
					}
			});
		
	};

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Test_Section_Model;