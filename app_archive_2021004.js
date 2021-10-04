const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const moment= require('moment');

//NPM Library
const winston = require('winston');
const fs = require('fs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
function GetIP(req){var temp=req.headers['CF-Connecting-IP']||req.headers['cf_connecting_ip']||req.headers['cf-connecting-ip']||req.headers['http_cf_connecting_ip']||req.headers['http_client_ip']||req.headers['http_x_cluster_client_ip']||req.headers['http_x_forwarded_for']||req.headers['http_x_forwarded']||req.headers['http_x_real_ip']||req.headers['http_forwarded_for']||req.headers['http_forwarded']||req.headers['remote_addrs']||req.headers['client_ip']||req.headers['x_cluster_client_ip']||req.headers['x_forwarded_for']||req.headers['x_forwarded']||req.headers['x_real_ip']||req.headers['forwarded_for']||req.headers['forwarded']||req.headers['remote_addrs']||req.headers['client-ip']||req.headers['x-cluster-client-ip']||req.headers['x-forwarded-for']||req.headers['x-forwarded']||req.headers['x-real-ip']||req.headers['forwarded-for']||req.headers['forwarded']||req.headers['remote-addrs']||req.connection.remoteAddress||req.socket.remoteAddress||req.connection.socket.remoteAddress;return temp}
morgan.token('ms', function (req) { return 'ms'; });
morgan.token('ip', function (req) { return GetIP(req); });
morgan.token('datetime', function (req) { return moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'); });
morgan.token('cstatus', function (req, res) {  
	var color = '';
	switch (true) { 
		case (res.statusCode == 200): color = '\x1b[32m'; break;
		case (res.statusCode >= 300 && res.statusCode < 399): color = '\x1b[36m'; break;
		case (res.statusCode >= 400 && res.statusCode < 499): color = '\x1b[33m'; break;
		case (res.statusCode >= 500 && res.statusCode < 599): color = '\x1b[31m'; break;
	}
	return `${color}${res.statusCode}\x1b[0m`;
});
app.use(morgan('[:datetime] [:ip] [:method :url :cstatus \x1b[4m:response-time:ms\x1b[0m] [:res[content-length] bytes]'));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTION");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token, filename");
	if (req.method == 'OPTIONS') {
		res.send(req.headers['access-control-request-method']);//
	} else { next(); }
});

require('./app_environment.js');		//Add by Sam Lam 
if (process.env.NODE_ENV == 'development') require('./app_config_development.js');		//Add by Sam Lam 
if (process.env.NODE_ENV == 'production') require('./app_config_production.js');		//Add by Sam Lam 
if (process.env.NODE_ENV == 'localhost') require('./app_config_localhost.js');		//Add by Sam Lam 

//const xSea = require('./lib/xSea');
//xSea.Init();

//Init  Api startup table 
const OMS_Api_Startup_Model= require('./model/OMS_Api_Startup_Model.js');	
var record = new OMS_Api_Startup_Model().writeLog(function() {});		

//Init table cache
const OMS_Standard_Model_Cache= require('./model_cache/OMS_Standard_Model_Cache.js');	////Add by Sam Lam 
global.dm_OMS_Standard_Model_Cache = new OMS_Standard_Model_Cache();		


/*******************************************************************************/
/* Loading Logger */
/*******************************************************************************/

const engine_env = process.env.NODE_ENV || 'development';
const engine_logDir = './log/request_workflow_engine';

// Create the log directory if it does not exist
if (!fs.existsSync(engine_logDir)) {
	fs.mkdirSync(engine_logDir);
}
const engine_tsFormat = () => (new Date()).toLocaleTimeString();
const engine_logger = new (winston.Logger)({
  transports: [
	new (require('winston-daily-rotate-file'))({
	  filename: `${engine_logDir}/request_workflow_engine_`,
	  /*timestamp: engine_tsFormat,*/
	  datePattern: 'YYYY_MM_DD',
	  prepend: false,
	  level: engine_env === 'development' ? 'verbose' : 'info'
	})
  ]
});


/*******************************************************************************/
/* Loading Request Worfklow dynamic runtime */
/*******************************************************************************/
const Cust_Request_WorkFlow_Handler= require('./handler/Cust_Request_WorkFlow_Handler.js');	
var RW_START_INTERVAL = global.RW_START_INTERVAL  // unit: second  Unit: msec 
global.request_queue =[];    //Request workflow dynamic queue

console.log('Execute load_request_test...');
var WorkFlow = new Cust_Request_WorkFlow_Handler();
var record = WorkFlow.Load_Unclosed_Request(function(data) {
			console.log('Node reboot : execute Load_Unclosed_Request: completed');
			var doing_is = true;
			var startDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
			var cycle = 1;
			setInterval(function () {
				if(doing_is == true) {
				doing_is = false;
				var record = WorkFlow.Workflow_Start(function(data) {
							//console.log('executed Workflow_Start ' +  new Date());
							doing_is = true;
							cycle += 1;
							var currentDate = moment(new Date()).format("YYYY-MM-DD H:mm:ss");
							var secondsDiff = moment(currentDate).diff(startDate, 'seconds');
							if(Math.round((secondsDiff*10)/10) >= 10 ) {
								console.log('Request Worflow Cycle ='+ cycle + ' System time = ' + currentDate);
								engine_logger.info('Request Worflow Cycle ='+ cycle + ' System time = ' + currentDate);
								startDate = currentDate;
							}
					});
				}				

			},RW_START_INTERVAL);	
			
			
			
			app.use('/test', require('./routes_test/test'));  //for internal test 
			app.use('/core', require('./routes/routes_core'));
			app.use('/core/oms', require('./routes/routes_core_oms'));
			app.use('/cust', require('./routes/routes_cust'));
			app.use('/cust_order_history', require('./routes/routes_cust_order_history'));
			app.use('/image', require('./routes/routes_image'));
			app.use('/console', require('./routes/routes_console'));
			app.use('/driver', require('./routes/routes_driver'));
			app.use('/driver_info', require('./routes/routes_driver_info'));
			app.use('/driver_panel', require('./routes/routes_driver_panel'));
			app.use('/driver_request_workflow', require('./routes/routes_driver_request_workflow'));
			app.use('/driver_order_history', require('./routes/routes_driver_order_history'));
			app.use(require('./new_sys/routes/_main.js'));
			
			app.use('/cust_resv_immediate_order', require('./routes/routes_cust_resv_immediate_order'));
			app.use('/cust_resv_transaction', require('./routes/routes_cust_resv_transaction'));
			app.use('/driver_resv_panel', require('./routes/routes_driver_resv_panel'));
			app.use('/driver_resv_confirmed_order', require('./routes/routes_driver_resv_confirmed_order'));
			
			
		});		

/*******************************************************************************/
/* <end> Loading Request Worfklow dynamic runtime */
/*******************************************************************************/

/*
app.use('/test', require('./routes_test/test'));  //for internal test 
app.use('/core', require('./routes/routes_core'));
app.use('/core/oms', require('./routes/routes_core_oms'));
app.use('/cust', require('./routes/routes_cust'));
app.use('/cust_order_history', require('./routes/routes_cust_order_history'));
app.use('/image', require('./routes/routes_image'));
app.use('/console', require('./routes/routes_console'));
app.use('/driver', require('./routes/routes_driver'));
app.use('/driver_info', require('./routes/routes_driver_info'));
app.use('/driver_panel', require('./routes/routes_driver_panel'));
app.use('/driver_request_workflow', require('./routes/routes_driver_request_workflow'));
app.use('/driver_order_history', require('./routes/routes_driver_order_history'));
*/

// catch internal error 
app.use(function (err, req, res, next) {
		if(err.status != 404 ) {
		console.log('app.use output err.message: ' + err.message);
	} 
});

//#!/usr/bin/env node
var debug = require('debug')('HKber');

//app.set('port', process.env.PORT || 3389);
app.set('port', process.env.PORT || 80);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

module.exports = app;
