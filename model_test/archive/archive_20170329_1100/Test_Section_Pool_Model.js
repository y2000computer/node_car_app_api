//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
const Model_Name = 'Test_Section_Pool_Model';
const Model_Logger= require('../func/Model_Logger.js');	
const mysql= require("mysql");
var	 pool = require('../func/pool.js').pool;


function Test_Section_Pool_Model(){
    
	//constructor
	
	var LogInfo = new Model_Logger(Model_Name,'../model_log_info','info.log');
	var LogErr = new Model_Logger(Model_Name,'../model_log_err','err.log');

	/*
	this.conn = mysql.createConnection({
	  host     : global.appConfig.db_order_management.host,
	  port     : global.appConfig.db_order_management.port,
	  user     : global.appConfig.db_order_management.user,
	  password : global.appConfig.db_order_management.password,
	  database : global.appConfig.db_order_management.database
	});
	*/
	
	
	/*
	this.conn.connect(function (err) {
			if(err) {
				LogErr.Err('func: ' + Model_Name + '.conn.connect' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.conn.connect' + ' > success ');
					}
	});
	*/
	//this.pool = new Db_Order_Management_Pool();

	//var pool = require('../func/pool.js').pool;
	
	/*
    pool.getConnection(function(err) {
			if(err) {
				LogErr.Err('func: ' + Model_Name + '.conn.connect' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.conn.connect' + ' > success ');
					}
	});
	*/

	//constructor - end 
	
	/*
	this.List_All_Pool = function(callback) {

	console.log('execute List_All_Pool()');
	
	
	var query = function(req, res) {
		pool.getConnection(function(err, conn){
			console.log('select * from tbl_test');
			 conn.query("select * from tbl_test", function(err, results) {
				if(err) {
					LogErr.Err('func: ' + Model_Name + '.List_All' + ' > SQL err: ' + err);
					} else {
						if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.List_All' + ' > success ');
						fallback(results); }
					});
				});
		};
			
			
		 
	};
	*/
	
	
	
	this.List_All_Pool = function(callback){
		
    pool.getConnection(function(err,connection){
			if (err) {
			  connection.release();
			  throw err;
			}   
			connection.query('select * from tbl_test',function(err,rows){
				connection.release();
				if(!err) {
					callback(rows);
				}           
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	

	
	
	this.List_All = function(fallback) {

	console.log('execute List_All()');
	var query = pool.query('select * from tbl_test', function (err, results, fields) {
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
	var query = pool.query('INSERT INTO tbl_test SET ?',JsonData,function (err, results ) {
			if(err) {
				LogErr.Err('func: ' + Model_Name + '.Insert' + ' > SQL err: ' + err);
				} else {
					if (process.env.NODE_ENV != 'production') LogInfo.Info('func: ' + Model_Name + '.Insert' + ' > success ');
					fallback(results.insertId); }
					}
				);	
		
	};


	
	
	this.Disconnect = function(fallback) {

		pool.release(
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


module.exports= Test_Section_Pool_Model;