//Create Date: 24 Mar, 2017
//Last Update: 28 Mar, 2017
var express = require('express');
var router = express.Router();
var moment= require("moment");
var DmTestSection= require('../model/dm_test_section.js');	



router.route('/display_appConfig')
    .get(function (req, res, next) {
		
        console.log('access  /test/display_appConfig');
		res.send('access  /test/display_appConfig');
		try {
			
			console.log('process.env.NODE_ENV = '+process.env.NODE_ENV);
			
			console.log('global.appConfig.db_order_management.host = '+global.appConfig.db_order_management.host);
			console.log('global.appConfig.db_order_management.database = '+global.appConfig.db_order_management.database);

			console.log('global.appConfig.db_middle_core_tier.host = '+global.appConfig.db_middle_core_tier.host);
			console.log('global.appConfig.db_middle_core_tier.database = '+global.appConfig.db_middle_core_tier.database);

			console.log('global.appConfig.db_middle_slave_tier.host = '+global.appConfig.db_middle_slave_tier.host);
			console.log('global.appConfig.db_middle_slave_tier.database = '+global.appConfig.db_middle_slave_tier.database);

			} catch (err) {
			  console.log('error at access  /display_appConfig_db_order_management'+err);
			}		
			
		});


router.route('/dm_test_section_list_all')
    .get(function (req, res, next) {

		console.log('access  dm_test_section_list_all -start');
	
		var Dm = new DmTestSection();
				
		var record = Dm.ListAll(function(data) {
					res.send(data);	
				});		

		Dm.Disconnect(function() {});
				
		
    });
	

	
router.route('/dm_test_section_create')
    .get(function (req, res, next) {

		console.log('access  dm_test_section_create -start');

		var D = new Date();
		var N = D.getTime();
		var R = 'email-' + N+ Math.floor(Math.random() * (999999 - 1)) + 1
		
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		
		var JsonData = {
			email: R,
			password: 'xxxxxx',
			depart_code: 'xxxxxx',
			last_name: 'xxxxxx',
			first_name: 'xxxxxx',
			status: 'xxxxxx',
			last_visit_date: 'xxxxxx',
			create_user: 'xxxxxx',
			create_datetime: Now,
			modify_user: 'xxxxxx',
			modify_datetime: Now
		};

		var Dm = new DmTestSection();

		var record = Dm.Insert(JsonData, function(insertId) {
					res.send('last insert id=' + insertId);	
					console.log('call back from Dm.Create last insert_id=' + insertId);
				});		

				
		Dm.Disconnect(function() {});
				
		
    });

	
		
router.route('/test_object')
    .get(function (req, res, next) {
		
        console.log('access  /test_object');
		var myobject = require('../samtest/myobject.js');	
		var o = new myobject();
		o.whatAmI();
		o.save('paramter');
		o.repeat();
		console.log('object.get: ' + o.display());
		res.send('access  /test_object')
		
		
		});


		

	
router.route('/json_output')
    .get(function (req, res, next) {
        console.log('access /test/json_output');
				
		var sitePersonel = {};
		var employees = []
		sitePersonel.employees = employees;
		console.log(sitePersonel);

		var firstName = "John-C2";
		var lastName = "Smith";
		var employee = {
		  "firstName": firstName,
		  "lastName": lastName
		}
		sitePersonel.employees.push(employee);
		console.log(sitePersonel);

		var manager = "Jane Doe";
		sitePersonel.employees[0].manager = manager;
		console.log(sitePersonel);

		console.log(JSON.stringify(sitePersonel));
		
		res.send(JSON.stringify(sitePersonel));
     
    });





	
module.exports = router;



