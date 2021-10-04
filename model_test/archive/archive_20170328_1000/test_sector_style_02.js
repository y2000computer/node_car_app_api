var mysql= require("mysql");

function test_sector_style_02(){
    
	//constructor
	this.iAm = 'an object : ';
	
	this.conn = mysql.createConnection({
	  host     : global.appConfig.db_order_management.host,
	  port     : global.appConfig.db_order_management.port,
	  user     : global.appConfig.db_order_management.user,
	  password : global.appConfig.db_order_management.password,
	  database : global.appConfig.db_order_management.database
	});
	

	this.conn.connect(function (err) {
		if(err) console.log("connection err test_information_model : " + err);
	});

	
	this.list_all = function(fallback) {

		var query = this.conn.query('select * from tbl_test', function (err, results, fields) {
			if(err) console.log("SQL err : " + err);
			fallback(results);
				});	
		console.log('execute list_all()');
		
	};


	
	//////////////////////////////////////////////////////////////////////////
	
	
    this.whatAmI = function(){
        console.log('I am ' + this.iAm);
    };
	
    this.save = function(str){
        console.log('execute this.save');
		this.iAm = this.iAm + str;
    };

    this.repeat = function(){
        console.log('execute this.repeat');
		this.save('repeat');
    };
	
    this.display = function(){
        console.log('execute this.get');
		return this.iAm;
    };
	
	
};


module.exports= test_sector_style_02;