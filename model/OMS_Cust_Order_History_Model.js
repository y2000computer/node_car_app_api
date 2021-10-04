const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Order_History_Model(){
    
	//no constructor
	
	
	this.Cust_Order_History_Select = function(req, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_History_Select');

	
	
	
	var statement ='select o.ride_order_ref, date_format(o.create_datetime,"%d/%m/%Y %H:%m") as create_datetime, \
					gm.grade_name_eng, gsm.sub_grade_name_eng, gsm.sub_grade_name_chn, \
					tmm.brand_code, tmm.model_code, o.currency_code, o.fee_grand_total, \
					(case o.pickup_location_eng  \
						when "empty" then o.pickup_location_chn\
						else  o.pickup_location_eng\
					end) as pickup_location_eng,\
					(case o.pickup_location_chn \
						when "empty" then o.pickup_location_eng\
						else  o.pickup_location_chn\
					end) as pickup_location_chn,\
					(case o.drop_location_eng  \
						when "empty" then o.drop_location_chn\
						else  o.drop_location_eng\
					end) as drop_location_eng,\
					(case o.drop_location_chn \
						when "empty" then o.drop_location_eng\
						else  o.drop_location_chn\
					end) as drop_location_chn\
					from tbl_oms_ride_order as o \
					left outer join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id \
					left outer join tbl_transport_grade_sub_master as gsm on  o.grade_sub_code = gsm.grade_sub_code \
					left outer join tbl_transport_grade_master as gm on gsm.grade_code = gm.grade_code \
					left outer join tbl_transport_registration tr on o.registration_id =tr.registration_id \
					left outer join tbl_transport_model_master as tmm on tr.model_code = tmm.model_code \
					where c.mobile_token = "' + req.body.token + '"  order by o.ride_order_ref desc limit 50;	';
	/*
	var statement ='select o.ride_order_ref, date_format(o.create_datetime,"%d/%m/%Y %H:%m") as create_datetime, \
					gm.grade_name_eng, gsm.sub_grade_name_eng, gsm.sub_grade_name_chn, \
					tmm.brand_code, tmm.model_code, o.currency_code, o.fee_grand_total, \
					o.pickup_location_eng, o.pickup_location_chn, o.drop_location_eng, o.drop_location_chn \
					from tbl_oms_ride_order as o \
					left outer join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id \
					left outer join tbl_transport_grade_sub_master as gsm on  o.grade_sub_code = gsm.grade_sub_code \
					left outer join tbl_transport_grade_master as gm on gsm.grade_code = gm.grade_code \
					left outer join tbl_transport_registration tr on o.registration_id =tr.registration_id \
					left outer join tbl_transport_model_master as tmm on tr.model_code = tmm.model_code \
					where c.mobile_token = "' + req.body.token + '"  order by o.ride_order_ref desc limit 50;	';
	*/
	
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


	
	this.Cust_Order_History_Info_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_History_Info_Select');

	
	var statement ='select \
					o.ride_order_id, \
					o.ride_order_ref, date_format(rf.wf_driver_goto_drop_datetime,"%d/%m/%Y %H:%m:%s") as wf_driver_goto_drop_datetime, \
					gm.grade_name_eng, gsm.sub_grade_name_eng, gsm.sub_grade_name_chn, \
					tmm.brand_code, tmm.model_code, o.currency_code, o.fee_grand_total, \
					(case o.pickup_location_eng  \
						when "empty" then o.pickup_location_chn\
						else  o.pickup_location_eng\
					end) as pickup_location_eng,\
					(case o.pickup_location_chn \
						when "empty" then o.pickup_location_eng\
						else  o.pickup_location_chn\
					end) as pickup_location_chn,\
					(case o.drop_location_eng  \
						when "empty" then o.drop_location_chn\
						else  o.drop_location_eng\
					end) as drop_location_eng,\
					(case o.drop_location_chn \
						when "empty" then o.drop_location_eng\
						else  o.drop_location_chn\
					end) as drop_location_chn , \
					dinfo.last_name as driver_name , dinfo.first_name as driver_first_name, \
					o.cust_rank_driver, \
					concat(up.path ,"/" , up.filename) as picture, \
					o.standard_fee_min_charge as standard_fee_min_charge, \
					o.fee_ride_basic as fee_ride_basic, \
					o.fee_surcharge as fee_surcharge, \
					round(o.total_km,0) as total_km, o.fee_ride_km,  o.total_time as total_time , o.fee_ride_min, o.fee_sub_total, \
					o.percent_factor, o.fee_factor_total, \
					o.donation_amount, o.donation_amount, \
					o.fee_notes_eng, o.fee_notes_chn \
					from tbl_oms_ride_order as o  \
					left outer join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id\
					left outer join tbl_transport_grade_sub_master as gsm on  o.grade_sub_code = gsm.grade_sub_code\
					left outer join tbl_transport_grade_master as gm on gsm.grade_code = gm.grade_code\
					left outer join tbl_transport_registration tr on o.registration_id =tr.registration_id\
					left outer join tbl_transport_model_master as tmm on tr.model_code = tmm.model_code\
					left outer join tbl_rosf_order_request_flow as rf on o.request_id = rf.request_id\
					left outer join tbl_driver_user_info as dinfo on o.driver_user_id = dinfo.driver_user_id\
					left outer join tbl_driver_upload as up  on dinfo.driver_user_id = up.driver_user_id ';
		statement	+= '  where  o.ride_order_ref="' + jData.ride_order_ref + '"';
					
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
	

	this.Cust_Order_History_Info_Driver_Photo_Select = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_History_Info_Driver_Photo_Select');

	
	var statement ='select \
					o.ride_order_id, \
					o.ride_order_ref, date_format(rf.wf_driver_goto_drop_datetime,"%d/%m/%Y %H:%m:%s") as wf_driver_goto_drop_datetime, \
					gm.grade_name_eng, gsm.sub_grade_name_eng, gsm.sub_grade_name_chn, \
					tmm.brand_code, tmm.model_code, o.currency_code, o.fee_grand_total, \
					(case o.pickup_location_eng  \
						when "empty" then o.pickup_location_chn\
						else  o.pickup_location_eng\
					end) as pickup_location_eng,\
					(case o.pickup_location_chn \
						when "empty" then o.pickup_location_eng\
						else  o.pickup_location_chn\
					end) as pickup_location_chn,\
					(case o.drop_location_eng  \
						when "empty" then o.drop_location_chn\
						else  o.drop_location_eng\
					end) as drop_location_eng,\
					(case o.drop_location_chn \
						when "empty" then o.drop_location_eng\
						else  o.drop_location_chn\
					end) as drop_location_chn , \
					dinfo.last_name as driver_name , dinfo.first_name as driver_first_name, \
					o.cust_rank_driver, \
					concat(up.path ,"/" , up.filename) as picture, \
					o.standard_fee_min_charge as standard_fee_min_charge, \
					o.fee_ride_basic as fee_ride_basic, \
					round(o.total_km,0) as total_km, o.fee_ride_km,  o.total_time as total_time , o.fee_ride_min, o.fee_sub_total, \
					o.percent_factor, o.fee_factor_total \
					from tbl_oms_ride_order as o  \
					left outer join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id\
					left outer join tbl_transport_grade_sub_master as gsm on  o.grade_sub_code = gsm.grade_sub_code\
					left outer join tbl_transport_grade_master as gm on gsm.grade_code = gm.grade_code\
					left outer join tbl_transport_registration tr on o.registration_id =tr.registration_id\
					left outer join tbl_transport_model_master as tmm on tr.model_code = tmm.model_code\
					left outer join tbl_rosf_order_request_flow as rf on o.request_id = rf.request_id\
					left outer join tbl_driver_user_info as dinfo on o.driver_user_id = dinfo.driver_user_id\
					left outer join tbl_driver_upload as up  on dinfo.driver_user_id = up.driver_user_id ';
		statement	+= '  where  o.ride_order_ref="' + jData.ride_order_ref + '"';
		statement	+= '  and up.upload_code="PHOTO" and up.upload_state_code="ACCEPTED" and up.status="1" ';
					
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
	
	
	this.Cust_Order_History_Info_Tunnel_Select = function(ride_order_id, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_History_Info_Tunnel_Select');

	var statement ='select \
					gtm.tunnel_name_eng, gtm.tunnel_name_chn, ot.tunnel_fee\
					from tbl_oms_ride_order_tunnel as ot\
					left outer join tbl_oms_geo_tunnel_master as gtm on ot.tunnel_id = gtm.tunnel_id\
					where ot.ride_order_id=' + ride_order_id ;

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
	

	this.Cust_Order_History_Info_Settlement_Select = function(ride_order_id, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_History_Info_Settlement_Select');

	var statement ='select \
				date_format(sce.create_datetime,"%d/%m/%Y") as settle_datetime, sce.profile_code, opi.card_no, opi.amount as settle_amount \
				from tbl_settle_cust_entry as sce \
				left outer join tbl_settle_cust_online_pay_instruct as opi on sce.settle_id = opi.settle_id\
				where sce.ride_order_id=' + ride_order_id + ' order by opi.online_id desc limit 1;'

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

	
	
	this.Cust_Order_Feedback_Insert = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Order_Feedback_Insert');

	var statement ='insert into tbl_oms_ride_order_cust_feedback (ride_order_id,feedback,create_datetime,last_modify_datetime) \
				(select ride_order_id , "' + jData.feedback + '" as feedback,  now() as create_datetime , now() as last_modify_datetime\
				  from tbl_oms_ride_order where ride_order_ref = "' + jData.ride_order_ref + '");'
 
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
	

	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Order_History_Model;