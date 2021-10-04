const express = require('express');
const moment= require('moment');
const common = require('../lib/common');
const regex = require('../lib/regex');


const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Driver_Token_Model= require('../model/OMS_Driver_Token_Model.js');	
const OMS_Driver_Account_Model= require('../model/OMS_Driver_Account_Model.js');	
	

router.route('/token')
    .put(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

        var j = req.body;
        var err = [];

		
        if (! j.udid) { err.push('driver_token_miss_udid'); }
        if (! j.apps_version) { err.push('driver_token_miss_apps_version'); }
        if (! j.mobile_brand) { err.push('driver_token_miss_mobile_brand'); }
        if (! j.mobile_os) { err.push('driver_token_miss_mobile_os'); }
        if (! j.mobile_model) { err.push('driver_token_mobile_model'); }
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var randomNumber =  common.getTimehash();
		var Now = moment().format('YYYY-MM-DD H:mm:ss');
		var jData = {
				mobile_token: randomNumber,
				udid: req.body.udid,
				apps_version: req.body.apps_version,
				mobile_brand: req.body.mobile_brand,
				mobile_os: req.body.mobile_os,
				mobile_model: req.body.mobile_model,
				create_datetime: Now,
				last_modify_datetime: Now
			};
		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Insert(jData, function(result) {
				if(result == true) res.json({"result" : true, "token" : randomNumber});
			});
    })	

	.post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var dmOMS = new OMS_Driver_Token_Model();
		var record = dmOMS.Token_Mapped_Select(j, function(data) {
					if (data.length == 0) {
						res.json({ result: false });
					}
					if (data.length == 1) {
						var record = data[0];
						if(record.driver_user_id == '0') {
							var jData = {"result" : false, "login" : false};
						}
						if(record.driver_user_id != '0') {
							var jData = {"result" : true, "login" : true, "user_type" : "USER_CUST"};
						}
						res.json(jData);
					} 
				});		

		
    });
	
	
router.route('/account_verify')
    .post(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

        var j = req.body;
        var err = [];
		
        if (! j.email) { err.push('driver_account_wrong_email'); }
        if (! j.password) { err.push('driver_account_wrong_password'); }
        if (err.length > 0) { res.json({ result: false, error: err }); return; } 

		var jData = {
				email: req.body.email,
				password: req.body.password
			};
			
		var dmOMS = new OMS_Driver_Account_Model();
		var record = dmOMS.Account_Select(jData, function(data) {
				if(data.length==0) {
					var err = [];
					err.push('driver_account_wrong_email'); 
					res.json({ result: false, error: err }); return; 
				} 

				if(data.length>0 && data[0].password!=j.password) {
					var err = [];
					err.push('driver_account_wrong_password'); 
					res.json({ result: false, error: err }); return; 
				} 
				
				var jData = {
						"driver_user_id": data[0].driver_user_id,
						"email": data[0].email,
						"grade_sub_code": data[0].grade_sub_code,
						"last_name": data[0].last_name,
						"first_name": data[0].first_name,
						"mobile_country": data[0].mobile_country,
						"mobile": data[0].mobile,
						"language_code": data[0].language_code,
						"fund_method_code": data[0].fund_method_code,
						"bank_code": data[0].bank_code,
						"bank_branch_code": data[0].bank_branch_code,
						"bank_account_no": data[0].bank_account_no,
						"bank_holder_name": data[0].bank_holder_name,
						"alipay_id": data[0].alipay_id,
						"alipay_sc_cash_add_ac_no": data[0].alipay_sc_cash_add_ac_no,
						"alipay_cash_add_daily_limit": data[0].alipay_cash_add_daily_limit,
						"mail_add_1": data[0].mail_add_1,
						"mail_add_2": data[0].mail_add_2,
						"mail_add_3": data[0].mail_add_3,
						"mail_add_4": data[0].mail_add_4,
						"mail_receipt_name": data[0].mail_receipt_name,
						"ready_for_online": data[0].ready_for_online,
						"status": data[0].status
						};
					 
					 res.json(jData);
					 return;
				});
				
		
    });
	

router.route('/registration')
    .put(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.driver_user_id) { err.push('driver_reg_miss_driver_user_id'); }
        if (! j.facebook_id) { err.push('driver_reg_miss_facebook_id'); }
        if (! j.mobile_country) { err.push('driver_reg_miss_mobile_country_code'); }
        if (! j.mobile) { err.push('driver_account_miss_mobile'); }
        if (! j.language_code) { err.push('driver_account_miss_language_code'); }
        if (! j.fund_method_code) { err.push('driver_account_miss_fund_method_code'); }
        if (j.bank_code==undefined) { err.push('driver_account_miss_bank_code'); }
        if (j.bank_branch_code==undefined) { err.push('driver_account_miss_bank_branch_code'); }
        if (j.bank_account_no==undefined) { err.push('driver_account_miss_bank_account_no'); }
        if (j.alipay_id==undefined) { err.push('driver_account_miss_alipay_id'); }
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
					var record = dmOMS.Token_Mapped_Select(j, function(data) {
								if (data.length == 1) {
									var Now = moment().format('YYYY-MM-DD H:mm:ss');
									var jData = {
										mobile_token: req.body.token,
										driver_user_id: req.body.driver_user_id,
										facebook_id: req.body.facebook_id,
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
									var record = dmOMS.Mapped_Account_Update(jData, function(result) {
											if(result == true) res.json({"result" : true});
											});
								
								}
								else {
									
								
									var Now = moment().format('YYYY-MM-DD H:mm:ss');
									var jData = {
											mobile_token: req.body.token,
											driver_user_id: req.body.driver_user_id,
											create_datetime: Now,
											last_modify_datetime: Now
										};
										
									var dmOMS = new OMS_Driver_Account_Model();
									var record = dmOMS.Account_Token_Map_Insert(jData, function(result) {
												var jData = {
													mobile_token: req.body.token,
													driver_user_id: req.body.driver_user_id,
													facebook_id: req.body.facebook_id,
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

												var record = dmOMS.Account_Update(jData, function(result) {
													if(result == true) res.json({"result" : true});
													});
											});
							
								}
						});		
								

				
				} //if (token_data.length == 0) { 
			});		
				

		
		
    });
	

router.route('/push_message_token')
    .put(function (req, res) {

		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, req.body.token, function() {});		
		

        var j = req.body;
        var err = [];

        if (! j.token) { err.push('driver_token_invalid'); }
        if (! j.push_message_token) { err.push('driver_reg_miss_push_message_token'); }
 
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
							push_message_token: req.body.push_message_token,
							create_datetime: Now,
							last_modify_datetime: Now
						};
						var dmOMS = new OMS_Driver_Account_Model();
						var record = dmOMS.Push_Message_Update(jData, function(result) {
										if(result == true) res.json({"result" : true});
								});
				
				} //if (token_data.length == 0) { 
			});		
				
		
		
    });
	
	
	
module.exports = router;



