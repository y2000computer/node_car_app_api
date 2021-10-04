var xCfg = {
    mysql: {
        acquireTimeout: 10000,
        connectionLimit: 40,
        waitForConnections: true,
        host: appConfig.db_order_management.host,
        port: appConfig.db_order_management.port,
        user: appConfig.db_order_management.user,
        password: appConfig.db_order_management.password,
        default: 'order',
        dbs: {
            'order': appConfig.db_order_management.database,
            'middle': appConfig.db_middle_slave_tier.database
        }
    }
}
module.exports = xCfg;