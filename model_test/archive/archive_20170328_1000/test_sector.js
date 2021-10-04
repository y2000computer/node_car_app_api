var mysql= require("mysql");

var sql = mysql.createConnection({
  host     : global.appConfig.db_order_management.host,
  port     : global.appConfig.db_order_management.port,
  user     : global.appConfig.db_order_management.user,
  password : global.appConfig.db_order_management.password,
  database : global.appConfig.db_order_management.database
});

sql.connect(function (err) {
    if(err) console.log("connection err test_information_model : " + err);
});


var test_sector= {

}


test_sector.say_hello = function say_hello() {
			console.log('say hello');
};

test_sector.list_all = function list_all(callback) {
	
            var query = sql.query('select * from tbl_test', function (err, results, fields) {
				if (err) throw err
				callback(results);
            });	
	
			console.log('execute list_all()');
};






module.exports= test_sector;