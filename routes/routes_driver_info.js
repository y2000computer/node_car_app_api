const express = require('express');
const moment= require('moment');
const common = require('../lib/common');
const regex = require('../lib/regex');


const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
const OMS_Driver_Panel_Model= require('../model/OMS_Driver_Panel_Model.js');	
	


router.route('/basic')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 


		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {

					var dmOMS = new OMS_Driver_Account_Model();
					var record = dmOMS.Mapped_Account_Select(req, function(data) {
								var record = dmOMS.Driver_Current_Mode_Select(req, function(mode_data) {
											var online_mode = 0;
											if (mode_data.length > 0)  online_mode = 1;
											var jData = {
											driver_user_id: data[0].driver_user_id,
											email: data[0].email,
											facebook_id: data[0].facebook_id,
											grade_sub_code: data[0].grade_sub_code,
											last_name: data[0].last_name,
											first_name: data[0].first_name,
											mobile_country: data[0].mobile_country,
											mobile: data[0].mobile,
											language_code: data[0].language_code,
											fund_method_code: data[0].fund_method_code,
											bank_code: data[0].bank_code,
											bank_branch_code: data[0].bank_branch_code,
											bank_account_no: data[0].bank_account_no,
											bank_holder_name: data[0].bank_holder_name,
											alipay_id: data[0].alipay_id,
											alipay_sc_cash_add_ac_no: data[0].alipay_sc_cash_add_ac_no,
											alipay_cash_add_daily_limit: data[0].alipay_cash_add_daily_limit,
											ready_for_online: data[0].ready_for_online,
											online_mode: online_mode
											};
											res.json(jData);
								});
						});	
				
				} //if (token_data.length == 0) { 
			});		
				

	
    })
	
    .patch(function (req, res, next) {
		
		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.mobile_country) { err.push('driver_reg_miss_mobile_country_code'); }
        if (! j.mobile) { err.push('driver_account_miss_mobile'); }
        if (! j.language_code) { err.push('driver_account_miss_language_code'); }
        if (! j.fund_method_code) { err.push('driver_account_miss_fund_method_code'); }
        if (j.bank_code==undefined) { err.push('driver_account_miss_bank_code'); }
        if (j.bank_branch_code==undefined) { err.push('driver_account_miss_bank_branch_code'); }
        if (j.bank_account_no==undefined) { err.push('driver_account_miss_bank_account_no'); }
        if (j.alipay_id==undefined) { err.push('driver_account_miss_alipay_id'); }
        if (j.alipay_sc_cash_add_ac_no==undefined) { err.push('driver_account_miss_alipay_sc_cash_add_ac_no'); }
        if (j.alipay_sc_cash_add_ac_no==undefined) { err.push('driver_account_miss_alipay_sc_cash_add_ac_no'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 
		

		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {

					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					var jData = {
						mobile_token: req.body.token,
						driver_user_id: req.body.driver_user_id,
						mobile_country: req.body.mobile_country,
						mobile: req.body.mobile,
						language_code: req.body.language_code,
						fund_method_code: req.body.fund_method_code,
						bank_code: req.body.bank_code,
						bank_branch_code: req.body.bank_branch_code,
						bank_account_no: req.body.bank_account_no,
						bank_holder_name: req.body.bank_holder_name,
						alipay_id: req.body.alipay_id,
						alipay_sc_cash_add_ac_no: req.body.alipay_sc_cash_add_ac_no,
						alipay_cash_add_daily_limit: req.body.alipay_cash_add_daily_limit,
						create_datetime: Now,
						last_modify_datetime: Now
					};
						
					var dmOMS = new OMS_Driver_Account_Model();
					var record = dmOMS.Mapped_Account_Without_facebook_id_Update(jData, function(result) {
							if(result == true) res.json({"result" : true});
							});
				
					
				} // if (token_data.length == 0) { 
			});		


		
    });
	
	
router.route('/vehicle')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 


		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {

					var dmOMS = new OMS_Driver_Account_Model();
					var record = dmOMS.Mapped_Vehicle_Select(req, function(data) {
					  			var result = {
									"list" : data 
								};
								res.json(result);
							});
				
				} //if (token_data.length == 0) { 
			});		
				

	
    })
    .patch(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 


		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {
					driver_user_id = token_data[0].driver_user_id;
					var Now = moment().format('YYYY-MM-DD H:mm:ss');
					var jData = {
						mobile_token: j.token,
						driver_user_id: driver_user_id,
						registration_id: j.registration_id,
						down_to_x_is: j.down_to_x_is,
						default_is: j.default_is,
						create_datetime: Now,
						last_modify_datetime: Now
					};
						
					var dmOMS = new OMS_Driver_Account_Model();

					if(j.default_is == true) {
					var record = dmOMS.Mapped_Vehicle_Clear_Default_Update(jData, function(result) {
							var record = dmOMS.Mapped_Vehicle_Default_Update(jData, function(result) {
								var record = dmOMS.Mapped_Vehicle_Update(jData, function(result) {
										var dmOMS = new OMS_Driver_Panel_Model();
										var record = dmOMS.Online_Vehicle_Update(jData, function(result) {
												 res.json({"result" : true});
											});
										});
								});
							});
					}
					

					if(j.default_is == false) {
						var record = dmOMS.Mapped_Vehicle_Update(jData, function(result) {
								 res.json({"result" : true});
							});
					}
					



				
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	
	
	

router.route('/performance')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }

        if (err.length > 0) { res.json({ result: false, error: err }); return; } 


		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Select(req, function(token_data) {
				if (token_data.length == 0) { 
					var err = [];
					err.push('driver_token_invalid'); 
					res.json({ result: false, error: err });
					return; 
				} else {

					var dmOMS = new OMS_Driver_Account_Model();
					var record = dmOMS.Mapped_Performance_Select(req, function(data) {
								var jData = {
									driver_user_id: data[0].driver_user_id,
									ranking_one_week: data[0].ranking_one_week,
									ranking_one_month: data[0].ranking_one_month,
									ranking_average: data[0].ranking_average,
									order_ratio_one_week: data[0].order_ratio_one_week,
									order_cancel_one_week: data[0].order_cancel_one_week
								};
								res.json(jData);								
							});
				
				} //if (token_data.length == 0) { 
			});		
				

	
    });
	
	
	

	
	
module.exports = router;



