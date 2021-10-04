const Mysql = require('mysql');

var DB_Middle_Slave_Pool = Mysql.createPool({
	host     : global.appConfig.db_middle_slave_tier.host,
	port     : global.appConfig.db_middle_slave_tier.port,
	user     : global.appConfig.db_middle_slave_tier.user,
	password : global.appConfig.db_middle_slave_tier.password,
	database : global.appConfig.db_middle_slave_tier.database,
	timezone : "Asia/Hong_Kong",
    connectionLimit: 50
});


exports.DB_Middle_Slave_Pool = DB_Middle_Slave_Pool;