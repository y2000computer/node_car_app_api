const Mysql = require('mysql');

var DB_OMS_Pool = Mysql.createPool({
	host     : global.appConfig.db_order_management.host,
	port     : global.appConfig.db_order_management.port,
	user     : global.appConfig.db_order_management.user,
	password : global.appConfig.db_order_management.password,
	database : global.appConfig.db_order_management.database,
	timezone : "Asia/Hong_Kong",
    connectionLimit: 180
});


exports.DB_OMS_Pool = DB_OMS_Pool;