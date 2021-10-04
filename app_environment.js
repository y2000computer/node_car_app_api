require('events').EventEmitter.prototype._maxListeners = 500;

 
global.debug = true;
global.log_traffic = true;
global.log_heavy_traffic = true;
global.log_huge_heavy_traffic = false;


process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'production';
//process.env.NODE_ENV = 'localhost';


//lite-node-cache : Table cache 
global.lifetime_msec = 30000 ;  //milliseconds, 30 sec
global.reload_msec = 10000 ;  //milliseconds, 10 sec
global.garbageCollectorTimeInterval_mesc = 30000 ;  //milliseconds, 30 sec


//npm library
//npm install moment
//npm install lite-node-cache 
//npm install wait.for
//npm install winston-daily-rotate-file

