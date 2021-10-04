const express = require('express');
const moment= require('moment');
const async = require('async');

const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	
const OMS_Standard_Model= require('../model/OMS_Standard_Model.js');	
const OMS_Transport_Model= require('../model/OMS_Transport_Model.js');	


router.route('/station-list')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Geo_Model();
		var record = dmOMS.Geo_Station_Master_List_All(function(data) {
					res.json({ list: data });
				});		

		
    });
	
	
router.route('/fee-peak-hour')
    .get(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Standard_Model();
		var record = dmOMS.Standard_Fee_Peak_Hour_Master_List_All(function(data) {
				var HK_CAR_X_SEAT_4_arry = []; 
				var HK_CAR_BLACK_SEAT_4_arry = [];
				var HK_CAR_BLACK_SEAT_7_arry = [];
				for (var i = 0; i < data.length; i++) {
					if(data[i].grade_sub_code == 'HK_CAR_X_SEAT_4')  HK_CAR_X_SEAT_4_arry.push(data[i]);
					if(data[i].grade_sub_code == 'HK_CAR_BLACK_SEAT_4')  HK_CAR_BLACK_SEAT_4_arry.push(data[i]);
					if(data[i].grade_sub_code == 'HK_CAR_BLACK_SEAT_7')  HK_CAR_BLACK_SEAT_7_arry.push(data[i]);
				}
				
				var result = {
				HK_CAR_X_SEAT_4: HK_CAR_X_SEAT_4_arry,
				HK_CAR_BLACK_SEAT_4: HK_CAR_BLACK_SEAT_4_arry,	
				HK_CAR_BLACK_SEAT_7: HK_CAR_BLACK_SEAT_7_arry	
				};
		
				
				res.json({ list: result });
				});			
		
    });
	

router.route('/fee-standard')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Standard_Model();
		var record = dmOMS.Standard_Fee_Standard_Select(req, function(data) {
					res.json({ list: data });
				});		
		
    });	
	


router.route('/transport-grade')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var dmOMS = new OMS_Transport_Model();
		var record = dmOMS.Transport_Grade_Master_List_All(function(data) {
				var list = [];
				var grades = [];
				for (var i = 0; i < data.length; i++) grades.push(data[i]);
							
				async.forEachSeries(grades, function(grade, callback_async) {
					var dmOMS = new OMS_Transport_Model();
					var records = dmOMS.Transport_Grade_Sub_Master_Select(grade.grade_code, function(data) {
							grade.sub = [];
							for (var i = 0; i < data.length; i++) grade.sub.push(data[i]);
							list.push(grade); // Finished the data loop 
							callback_async();
							});	
				},	function () {
								res.json(list); // Finished the series
							}	
				);
				
			}); //var record 
		
    })
   .put(function (req, res) {

   		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var field = 'user_type,apps_version,mobile_brand,mobile_os,mobile_model'.split(',');
        var err = false;
        for (var f in field) { if (!req.body[field[f]]) { throw new Error('Input Error'); } }
        if (!regex.IsUserType(req.body.user_type)) { throw new Error('Input Error'); }
        var rnd = common.getTimehash();
		console.log('dump md:');
		console.log(md);
    });
	



	
module.exports = router;



