const moment= require('moment');
const async = require('async');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Driver_Account_Model(){
    
	//no constructor
	
	
	this.Account_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Account_Select');

	
	var statement ='select driver_user_id,email,password,grade_sub_code,last_name,first_name, \
							mobile_country,mobile,language_code, \
							mail_add_1, mail_add_2, mail_add_3, mail_add_4, \
							mail_receipt_name, \
							fund_method_code, \
							bank_code, bank_branch_code, bank_holder_name, bank_account_no, alipay_id,\
							alipay_sc_cash_add_ac_no, \
							alipay_cash_add_daily_limit, \
							ready_for_online, status \
					from tbl_driver_user_info '
		statement	+= ' where ' ;					
		statement	+= ' email="' + jData.email + '"';				
	
	//console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	this.Account_Token_Map_Insert = function(jData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Account_Token_Map_Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_driver_user_info_token SET ?', jData, function(err,results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	
	
	this.Account_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Account_Update');

					
	var statement ='update tbl_driver_user_info set ';
		statement	+= ' facebook_id = "' + jData.facebook_id + '"' + ',';
		statement	+= ' mobile_country = "' + jData.mobile_country + '"' + ',';
		statement	+= ' mobile = "' + jData.mobile + '"' + ',';
		statement	+= ' fund_method_code = "' + jData.fund_method_code + '"' + ',';
		statement	+= ' bank_code = "' + jData.bank_code + '"' + ',';
		statement	+= ' bank_branch_code = "' + jData.bank_branch_code + '"' + ',';
		statement	+= ' bank_account_no = "' + jData.bank_account_no + '"' + ',';
		statement	+= ' bank_holder_name = "' + jData.bank_holder_name + '"' + ',';
		statement	+= ' alipay_id = "' + jData.alipay_id + '"' + ',';
		statement	+= ' alipay_sc_cash_add_ac_no = "' + jData.alipay_sc_cash_add_ac_no + '"' + ',';
		statement	+= ' alipay_cash_add_daily_limit = "' + jData.alipay_cash_add_daily_limit + '"' + ',';
		statement	+= ' last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' driver_user_id = "' + jData.driver_user_id + '"';
	
	//console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	

	this.Mapped_Account_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Account_Select');

	
	
	var statement ='select info.driver_user_id, info.email, info.facebook_id, info.grade_sub_code, info.last_name, \
					info.first_name, info.mobile_country, info.mobile, info.language_code, info.fund_method_code, \
					info.bank_code, info.bank_branch_code, info.bank_account_no, \
					info.bank_holder_name, \
					info.alipay_id, info.alipay_sc_cash_add_ac_no, \
					info.alipay_cash_add_daily_limit, \
					info.mail_add_1, info.mail_add_2, info.mail_add_3, info.mail_add_4, info.mail_receipt_name, info.ready_for_online \
					from tbl_driver_user_info as info \
					left join tbl_driver_user_info_token as token on info.driver_user_id = token.driver_user_id ';
		statement	+= ' where ' ;					
		statement	+= 'token.mobile_token="' + req.body.token + '"';				

	
	console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	

	this.Mapped_Account_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Account_Without_FacebookID_Update');

					
	var statement ='update tbl_driver_user_info as info, tbl_driver_user_info_token as token set ';
		statement	+= ' facebook_id = "' + jData.facebook_id + '"' + ',';
		statement	+= ' info.mobile_country = "' + jData.mobile_country + '"' + ',';
		statement	+= ' info.mobile = "' + jData.mobile + '"' + ',';
		statement	+= ' info.fund_method_code = "' + jData.fund_method_code + '"' + ',';
		statement	+= ' info.bank_code = "' + jData.bank_code + '"' + ',';
		statement	+= ' info.bank_branch_code = "' + jData.bank_branch_code + '"' + ',';
		statement	+= ' info.bank_account_no = "' + jData.bank_account_no + '"' + ',';
		statement	+= ' info.bank_holder_name = "' + jData.bank_holder_name + '"' + ',';
		statement	+= ' info.alipay_id = "' + jData.alipay_id + '"' + ',';
		statement	+= ' info.alipay_sc_cash_add_ac_no = "' + jData.alipay_sc_cash_add_ac_no + '"' + ',';
		statement	+= ' info.alipay_cash_add_daily_limit = "' + jData.alipay_cash_add_daily_limit + '"' + ',';
		statement	+= ' info.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where info.driver_user_id = token.driver_user_id and  ';
		statement	+= ' token.mobile_token = "' + jData.mobile_token + '"';
	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};


	this.Mapped_Account_Without_facebook_id_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Account_Without_FacebookID_Update');

					
	var statement ='update tbl_driver_user_info as info, tbl_driver_user_info_token as token set ';
		statement	+= ' info.mobile_country = "' + jData.mobile_country + '"' + ',';
		statement	+= ' info.mobile = "' + jData.mobile + '"' + ',';
		statement	+= ' info.fund_method_code = "' + jData.fund_method_code + '"' + ',';
		statement	+= ' info.bank_code = "' + jData.bank_code + '"' + ',';
		statement	+= ' info.bank_branch_code = "' + jData.bank_branch_code + '"' + ',';
		statement	+= ' info.bank_account_no = "' + jData.bank_account_no + '"' + ',';
		statement	+= ' info.bank_holder_name = "' + jData.bank_holder_name + '"' + ',';
		statement	+= ' info.alipay_id = "' + jData.alipay_id + '"' + ',';
		statement	+= ' info.alipay_sc_cash_add_ac_no = "' + jData.alipay_sc_cash_add_ac_no + '"' + ',';
		statement	+= ' info.alipay_cash_add_daily_limit = "' + jData.alipay_cash_add_daily_limit + '"' + ',';
		statement	+= ' info.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where info.driver_user_id = token.driver_user_id and  ';
		statement	+= ' token.mobile_token = "' + jData.mobile_token + '"';
	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	this.Mapped_Vehicle_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Vehicle_Select');

	
	var statement ='select info.driver_user_id, ass.registration_id, \
					grade.grade_code, grade.grade_name_eng,\
					mm.grade_sub_code, sub.sub_grade_name_eng, sub.sub_grade_name_chn, \
					mm.brand_code, reg.model_code, reg.registration_mark, reg.colour, \
					reg.down_to_x_is, \
					reg.default_is \
					from tbl_driver_user_info as info \
					left join tbl_driver_user_info_token as token on info.driver_user_id = token.driver_user_id \
					left join tbl_driver_associate_transport as ass on info.driver_user_id = ass.driver_user_id \
					left join tbl_transport_registration as reg on ass.registration_id = reg.registration_id\
					left join tbl_transport_model_master as mm on reg.model_code = mm.model_code\
					left join tbl_transport_grade_sub_master as sub on mm.grade_sub_code = sub.grade_sub_code\
					left join tbl_transport_grade_master as grade on sub.grade_code = grade.grade_code';
		statement	+= ' where ' ;					
		statement	+= 'token.mobile_token="' + req.body.token + '"';				
		statement	+= ' and reg.verify_is = 1 and reg.status = 1;' ;					

	
	//console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	this.Mapped_Vehicle_Clear_Default_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Vehicle_Clear_Default_Update');

					
	var statement ='UPDATE tbl_transport_registration reg JOIN tbl_driver_associate_transport tra ON (reg.registration_id = tra.registration_id) \
							SET reg.default_is = 0 WHERE tra.driver_user_id =' + jData.driver_user_id ;

	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};


	this.Mapped_Vehicle_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Vehicle_Update');

					
	var statement ='update tbl_transport_registration set ';
		statement	+= ' down_to_x_is = ' + jData.down_to_x_is + ',';
		statement	+= ' last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' registration_id = "' + jData.registration_id + '"';
	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	this.Mapped_Vehicle_Default_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Vehicle_Default_Update');

					
	var statement ='update tbl_transport_registration set ';
		statement	+= ' default_is = ' + jData.default_is + ',';
		statement	+= ' last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' registration_id = "' + jData.registration_id + '"';
	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	this.Mapped_Performance_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Performance_Select');

	
	
	var statement ='select info.driver_user_id, info.ranking_one_week, info.ranking_one_month, info.ranking_average, \
					info.order_ratio_one_week, info.order_cancel_one_week \
					from tbl_driver_user_info as info \
					left join tbl_driver_user_info_token as token on info.driver_user_id = token.driver_user_id ';
		statement	+= ' where ' ;					
		statement	+= 'token.mobile_token="' + req.body.token + '"';				

	
	//console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	this.Mapped_Vehicle_Default_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Mapped_Vehicle_Default_Select');

	
	var statement ='select info.driver_user_id, ass.registration_id, \
					grade.grade_code, grade.grade_name_eng,\
					mm.grade_sub_code, sub.sub_grade_name_eng, sub.sub_grade_name_chn, \
					mm.brand_code, reg.model_code, reg.registration_mark, reg.colour, \
					reg.down_to_x_is, \
					reg.default_is \
					from tbl_driver_user_info as info \
					left join tbl_driver_user_info_token as token on info.driver_user_id = token.driver_user_id \
					left join tbl_driver_associate_transport as ass on info.driver_user_id = ass.driver_user_id \
					left join tbl_transport_registration as reg on ass.registration_id = reg.registration_id\
					left join tbl_transport_model_master as mm on reg.model_code = mm.model_code\
					left join tbl_transport_grade_sub_master as sub on mm.grade_sub_code = sub.grade_sub_code\
					left join tbl_transport_grade_master as grade on sub.grade_code = grade.grade_code';
		statement	+= ' where ' ;					
		statement	+= 'token.mobile_token="' + jData.mobile_token + '"';				
		statement	+= ' and reg.verify_is = 1 and reg.status = 1 and default_is = 1;' ;					

	
	console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	
	this.Driver_Current_Mode_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Driver_Current_Mode_Select');

	
	
	var statement ='select mt.driver_user_id, mt.mobile_token \
								from tbl_driver_user_info_token as mt\
								right join tbl_rosf_driver_online_gps as og on mt.driver_user_id = og.driver_user_id ' ;
		statement	+= ' where ' ;					
		statement	+= 'mt.mobile_token="' + req.body.token + '"';				
	
	console.log(statement);
									
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				callback(rows);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	
	this.Push_Message_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Push_Message_Update');

					
	var statement ='update tbl_driver_token  set ';
		//statement	+= ' mobile_os = "' + jData.mobile_brand + '"' + ' ';
		statement	+= ' push_message_token = "' + jData.push_message_token + '"' + ' ';
		statement	+= ' where mobile_token = "' + jData.mobile_token + '"';
	
	console.log(statement);
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, results){
				if(err) throw err;
				connection.release();
				callback(true);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Driver_Account_Model;