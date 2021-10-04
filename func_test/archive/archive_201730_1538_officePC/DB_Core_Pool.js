const Mysql = require('mysql');

var DB_Core_Pool = Mysql.createPool({
	host     : global.appConfig.db_middle_core_tier.host,
	port     : global.appConfig.db_middle_core_tier.port,
	user     : global.appConfig.db_middle_core_tier.user,
	password : global.appConfig.db_middle_core_tier.password,
	database : global.appConfig.db_middle_core_tier.database,
    connectionLimit: 50
});


exports.DB_Core_Pool = DB_Core_Pool;