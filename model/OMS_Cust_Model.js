const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Model(){
    
	//no constructor
	
	
	this.Cust_Registration_Insert = function(jData, jMobileData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Registration_Insert');
	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query('INSERT INTO tbl_cust_user_info SET ?', jData, function(err,results){
				if(err) throw err;
				var insertId = results.insertId;
				var statement ='UPDATE tbl_global_token_map SET ';
				statement	+= ' user_id=' + insertId ;
				statement	+= ' WHERE  ';
				statement	+= ' mobile_token="' +  jData.mobile_token + '"';
				connection.query(statement, function(err,results){
					if(err) throw err;
					var jInsert = {
							cust_user_id: insertId,
							mobile_country: jMobileData.mobile_country_code,
							mobile: jMobileData.mobile,
							create_datetime: new Date(),
							last_modify_datetime: new Date()		
						};
					
					connection.query('INSERT INTO tbl_cust_mobile SET ?', jInsert, function(err,results){
						if(err) throw err;
						connection.release();
						callback(insertId);
						});
						
					})
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	
	this.Cust_Basic_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Basic_Select');

	
	var statement ='select "true" as "result", map.user_type , c.cust_user_id as "user_id", c.email, c.facebook_id, c.last_name, c.first_name, \
					c.language_code, c.status, c.create_datetime, c.ready_for_tour, m.irow_id as "mobile_id", \
					m.mobile_country as "mobile_country_code", m.mobile \
					from tbl_global_token_map as map \
					left outer join tbl_cust_user_info as c on map.user_id = c.cust_user_id \
					left outer join tbl_cust_mobile as m on  c.cust_user_id = m.cust_user_id \ '
	statement	+= ' where m.status = 1 and map.mobile_token="' + req.body.token + '";' ;
	
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



	this.Cust_Basic_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Basic_Update');

	var statement ='update tbl_global_token_map as map, tbl_cust_user_info as c, tbl_cust_mobile as m set ';
		statement	+= ' c.last_name = "' + jData.last_name.replace('"','\\"') + '"' + ',';
		statement	+= ' c.first_name = "' + jData.first_name.replace('"','\\"') + '"' + ',';
		statement	+= ' c.email = "' + jData.email.replace('"','\\"') + '"' + ',';
		statement	+= ' c.language_code = "' + jData.language_code + '"' + ',';
		statement	+= ' c.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ',';
		statement	+= ' m.mobile_country = "' + jData.mobile_country_code + '"' + ',';
		statement	+= ' m.mobile = "' + jData.mobile.replace('"','\\"') + '"' + ',';
		statement	+= ' m.last_modify_datetime = "' + jData.last_modify_datetime + '"' ;
		statement	+= ' where map.user_id = c.cust_user_id  \
						 and map.user_id = c.cust_user_id  and c.cust_user_id = m.cust_user_id ';
		statement	+= ' and map.mobile_token = "' + jData.token + '"' 
		statement	+= ' and m.status = 1 ; ';
	
	
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

	
	
	
	this.Cust_Credit_Card_Insert = function(jData, callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Insert');

	var statement ='insert into tbl_cust_credit_card \
					(cust_user_id, card_brand, card_no , holder_name_eng, security_no, expiry, \
					default_is, create_datetime, last_modify_datetime) ';
		statement 	+=' select c.cust_user_id as cust_user_id,  ';
		statement	+= '"' + jData.brand.replace('"','\\"') + '"' + ' as card_brand ' + ',';
		//statement	+= '"' + jData.number.replace('"','\\"') + '"' + ' as card_no ' + ',';
		statement	+= '"' + jData.number + '"' + ' as card_no ' + ',';
		statement	+= '"' + jData.name.replace('"','\\"') + '"' + ' as holder_name_eng ' + ',';
		statement	+= '"' + jData.security_no + '"' + ' as security_no ' + ',';
		statement	+= '"' + jData.expiry.replace('"','\\"') + '"' + ' as expiry ' + ',';
		statement	+= '"' + jData.default_is + '"' + ' as default_is ' + ',';
		statement	+= '"' + jData.create_datetime + '"' + ' as create_datetime ' + ',';
		statement	+= '"' + jData.last_modify_datetime + '"' + ' as last_modify_datetime ' + ' ';
		statement	+= ' from tbl_cust_user_info as c where ';
		statement	+= ' c.mobile_token = "' + jData.token + '"' 
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


	this.Cust_Credit_Card_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Update');


	var statement ='update tbl_cust_credit_card as credit  \
					join tbl_cust_user_info as c on credit.cust_user_id  = c.cust_user_id  set  ';
		statement	+= ' credit.card_brand = "' + jData.brand.replace('"','\\"') + '"' + ',';
		statement	+= ' credit.card_no = "' + jData.number.replace('"','\\"') + '"' + ',';
		statement	+= ' credit.holder_name_eng = "' + jData.name.replace('"','\\"') + '"' + ',';
		statement	+= ' credit.security_no = "' + jData.security_no + '"' + ',';
		statement	+= ' credit.expiry = "' + jData.expiry.replace('"','\\"') + '"' + ',';
		statement	+= ' credit.default_is = "' + jData.default_is + '"' + ',';
		statement	+= ' credit.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' credit.card_method_id = "' + jData.id + '"' ;
		statement	+= ' and. c.mobile_token = "' + jData.token + '"' + ';';

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

	
	
	this.Cust_Credit_Card_Remove_Default_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Remove_Default_Update');


	var statement ='update tbl_cust_credit_card set default_is = 0 where cust_user_id = ( \
							select cust_user_id from tbl_cust_user_info where mobile_token=';
		statement	+= '"' +  jData.token + '"' + ')';

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

	this.Cust_Credit_Card_Disable = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Disable');


	var statement ='update tbl_cust_credit_card as credit  \
					join tbl_cust_user_info as c on credit.cust_user_id  = c.cust_user_id  set  ';
		statement	+= ' credit.status = 0 ' + ',';
		statement	+= ' credit.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' credit.card_method_id = "' + jData.id + '"' ;
		statement	+= ' and. c.mobile_token = "' + jData.token + '"' + ';';

	
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

	
	this.Cust_Credit_Card_List = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_List');

	var statement ='select card_method_id as "id", card_brand as "brand", card_no as "number", holder_name_eng as "name", \
					expiry as "expiry", default_is as "default"  , \
					case \
					when isnull(reject_lock_datetime) then 0 \
					when not isnull(reject_lock_datetime) then 1 \
					end as "reject_lock_is" \
					from tbl_cust_credit_card \
					left join tbl_cust_user_info as c on tbl_cust_credit_card.cust_user_id = c.cust_user_id where ';
		statement	+= ' c.mobile_token="' + req.body.token + '"' ;
		statement	+= ' order by tbl_cust_credit_card.card_method_id; ';

	
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
	
	
	this.Cust_Credit_Card_Black_List_Is = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Black_List_Is');

	var statement ='select count(*) as black_list_count from tbl_cust_credit_card_black_list where ';
		statement	+= ' card_no="' + jData.number + '"' ;
		statement	+= ' and status = 1; ';

	//console.log(statement);
	
	var found_is = false;
	
	DB_OMS_Pool.getConnection(function(err, connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
				if(err) throw err;
				connection.release();
				if(rows[0].black_list_count != 0) {
					found_is = true ;
				}
				callback(found_is);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};
	
	
	
	
	this.Cust_Profile_Master_List_All = function(callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Profile_Master_List_All');

	var statement ='select profile_code, profile_name_eng, profile_name_chn from tbl_cust_profile_master;';

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
	



	this.Cust_Profile_Insert = function(jData,callback) {

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Profile_Insert');

 
	var statement ='insert into tbl_cust_user_info_corp \
							(cust_user_id, corp_email, card_method_id, weekly_report_is, monthly_report_is, status, create_datetime, \ last_modify_datetime )  ';
			statement 	+=' select c.cust_user_id as "cust_user_id",  ';
			statement	+= '"' + jData.email.replace('"','\\"') + '"' + ' as "corp_email" ' + ',';
			statement	+= '"' + jData.card_id + '"' + ' as "card_method_id" ' + ',';
			statement	+= '"' + jData.weekly + '"' + ' as "weekly_report_is" ' + ',';
			statement	+= '"' + jData.monthly + '"' + ' as "monthly_report_is" ' + ',';
			statement	+= ' "1" as "status", ';
			statement	+= ' NOW() as "create_datetime", ';
			statement	+= ' NOW() as "last_modify_datetime" ';
			statement	+= ' from tbl_cust_user_info as c where  ';
			statement	+= ' c.mobile_token = "' + jData.token + '"' 	

	
    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query(statement, function(err, rows){
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
	
	
	
	this.Cust_Profile_Update = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Profile_Update');

	var statement ='update tbl_cust_user_info_corp as prof  \
							join tbl_cust_user_info as c on prof.cust_user_id  = c.cust_user_id  set  ';
			statement	+= ' prof.corp_email = "' + jData.email.replace('"','\\"') + '"' + ',';
			//statement	+= ' prof.card_method_id = "' + jData.card_id + '"' + ',';
			statement	+= ' prof.weekly_report_is = "' + jData.weekly + '"' + ',';
			statement	+= ' prof.monthly_report_is = "' + jData.monthly + '"' + ',';
			statement	+= ' prof.last_modify_datetime = now()  ';
			statement	+= ' where ';
			statement	+= '  c.mobile_token = "' + jData.token + '"' + ';';
	

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

	
	this.Cust_Profile_Disable = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Card_Disable');


	var statement ='update tbl_cust_user_info_corp as prof  \
					join tbl_cust_user_info as c on prof.cust_user_id  = c.cust_user_id  set  ';
		statement	+= ' prof.status = 0 ' + ',';
		statement	+= ' prof.last_modify_datetime = "' + jData.last_modify_datetime + '"' + ' ';
		statement	+= ' where ';
		statement	+= ' c.mobile_token = "' + jData.token + '"' + ';';

	
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
	

	
	this.Cust_Credit_Default_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Credit_Default_Select');

	var statement ='select c.email, credit.card_method_id as "id", credit.card_brand as "brand", credit.card_no as "number", \
							credit.holder_name_eng as "name", credit.expiry as "expiry", credit.default_is as "default" \
							from tbl_cust_user_info as c left outer join tbl_cust_credit_card as credit on c.cust_user_id = credit.cust_user_id ';
		statement	+= ' where c.mobile_token="' + req.body.token + '" and credit.default_is = 1 ;' ;
							
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
	

	this.Cust_Profile_Credit_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Profile_Credit_Select');

	var statement ='select corp.corp_email as "email", corp.irow_id as "profile_id", corp.weekly_report_is as "weekly",  \
							corp.monthly_report_is as "monthly", credit.card_method_id as "id", credit.card_brand as "brand", \
							credit.card_no as "number", credit.holder_name_eng as "name", credit.expiry as "expiry", \
							credit.default_is as "default" from tbl_cust_user_info_corp as corp \
							left outer join tbl_cust_user_info as c on corp.cust_user_id = c.cust_user_id \
							left outer join tbl_cust_credit_card as credit on corp.card_method_id = credit.card_method_id ';
			statement	+= ' where c.mobile_token="' + req.body.token + '"' ;
			statement	+= ' and corp.status = 1 ;' ;
	
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
	
	
	this.Cust_Login = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Login');

	var statement ='select * from tbl_cust_user_info where ';
			statement	+= ' mobile_token="' + req.body.token + '"' ;
			statement	+= ' and facebook_id="' + req.body. facebook_id + '"' ;
	
	
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

	
	
		
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Model;