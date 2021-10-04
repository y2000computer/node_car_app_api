const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';



function ModelLogger(model_name,logDir,filename){

	//constructor
	
	//console.log('constructor ModelLogger');
	
	const logFileName = model_name +'_' + filename;
	
	if (!fs.existsSync(logDir)) {
	  fs.mkdirSync(logDir);
	}
	const tsFormat = () => (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString();
	const Logger = new (winston.Logger)({
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
	
	//constructor - end 
	
	
	this.Err = function(message) {
		//console.log('execute ModelLogger.this.err()');
		Logger.error(message);
	};

	this.Info = function(message) {
		//console.log('execute ModelLogger.this.info()');
		Logger.info(message);
	};
	
	this.Debug = function(message) {
		//console.log('execute ModelLogger.this.debug()');
		Logger.debug(message);
	};
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	
}



module.exports= ModelLogger;