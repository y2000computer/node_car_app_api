const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Cust_Resv_Immediate_Order_Model(){
    
	//no constructor

	
	this.Order_Insert = function(jData, callback) {
	
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Insert');

	
	var statement ='insert into tbl_resv_order_flow ( \
					type_code, \
					schedule_datetime, \
					cust_user_id, \
					cust_mobile_token, \
					order_priority, \
					profile_code, \
					grade_sub_code, \
					grade_name_eng, \
					grade_name_chn, \
					seat_name_eng, \
					seat_name_chn, \
					pickup_location_eng, \
					pickup_location_chn, \
					pickup_latitude, \
					pickup_longitude, \
					pickup_district_id, \
					pickup_district_name_eng, \
					pickup_district_name_chn, \
					pickup_region_code, \
					pickup_region_name_eng, \
					pickup_region_name_chn, \
					drop_location_eng, \
					drop_location_chn, \
					drop_latitude, \
					drop_longitude, \
					drop_district_id, \
					drop_district_name_eng, \
					drop_district_name_chn, \
					drop_region_code, \
					drop_region_name_eng, \
					drop_region_name_chn, \
					gapi_km, \
					gapi_minute, \
					currency_code, \
					fee_start_up, \
					fee_min_charge, \
					fee_per_km, \
					fee_per_min, \
					extra_reason, \
					extra_code, \
					extra_rate, \
					extra_desc_eng, \
					extra_desc_chn, \
					extra_desc_time_eng, \
					extra_desc_time_chn, \
					fee_surcharge_code, \
					fee_surcharge, \
					fee_surcharge_desc_eng, \
					fee_surcharge_desc_chn, \
					type_discount_percent, \
					estimate_fee, \
					tips, \
					estimate_fee_notes_eng, \
					estimate_fee_notes_chn, \
					share_ride_is, \
					dirver_confirmation_simulation_is, \
					state_code, \
					state_name_eng, \
					state_name_chn, \
					create_datetime, \
					last_modify_datetime\
					) values (' ;
		statement	+= '"' + jData.type_code+ '"' +  ',';
		statement	+= ' NOW() ' + ',';
		statement	+= '"' + jData.cust_user_id  + '"' +  ',';
		statement	+= '"' + jData.mobile_token  + '"' +  ',';
		statement	+= '"' + jData.order_priority  + '"' +  ',';
		statement	+= '"' + jData.profile_code  + '"' +  ',';
		statement	+= '"' + jData.grade_sub_code  + '"' +  ',';
		statement	+= '"' + jData.grade_name_eng  + '"' +  ',';
		statement	+= '"' + jData.grade_name_chn  + '"' +  ',';
		statement	+= '"' + jData.seat_name_eng  + '"' +  ',';
		statement	+= '"' + jData.seat_name_chn  + '"' +  ',';
		statement	+= '"' + jData.pickup_location_eng  + '"' +  ',';
		statement	+= '"' + jData.pickup_location_chn  + '"' +  ',';
		statement	+= '"' + jData.pickup_latitude  + '"' +  ',';
		statement	+= '"' + jData.pickup_longitude  + '"' +  ',';
		statement	+= '"' + jData.pickup_district_id  + '"' +  ',';
		statement	+= '"' + jData.pickup_district_name_eng  + '"' +  ',';
		statement	+= '"' + jData.pickup_district_name_chn  + '"' +  ',';
		statement	+= '"' + jData.pickup_region_code  + '"' +  ',';
		statement	+= '"' + jData.pickup_region_name_eng  + '"' +  ',';
		statement	+= '"' + jData.pickup_region_name_chn  + '"' +  ',';
		statement	+= '"' + jData.drop_location_eng  + '"' +  ',';
		statement	+= '"' + jData.drop_location_chn  + '"' +  ',';
		statement	+= '"' + jData.drop_latitude  + '"' +  ',';
		statement	+= '"' + jData.drop_longitude  + '"' +  ',';
		statement	+= '"' + jData.drop_district_id  + '"' +  ',';
		statement	+= '"' + jData.drop_district_name_eng  + '"' +  ',';
		statement	+= '"' + jData.drop_district_name_chn  + '"' +  ',';
		statement	+= '"' + jData.drop_region_code  + '"' +  ',';
		statement	+= '"' + jData.drop_region_name_eng  + '"' +  ',';
		statement	+= '"' + jData.drop_region_name_chn  + '"' +  ',';
		statement	+= '"' + jData.gapi_km  + '"' +  ',';
		statement	+= '"' + jData.gapi_minute  + '"' +  ',';
		statement 	+= '"' + jData.currency_code + '"' + ',';

		statement 	+= '"' + jData.fee_start_up + '"' + ',';
		statement 	+= '"' + jData.fee_min_charge + '"' + ',';
		statement 	+= '"' + jData.fee_per_km + '"' + ',';
		statement 	+= '"' + jData.fee_per_min + '"' + ',';

		statement	+= '"' + jData.extra_reason  + '"' +  ',';
		statement	+= '"' + jData.extra_code  + '"' +  ',';
		statement	+= '"' + jData.extra_rate  + '"' +  ',';
		statement	+= '"' + jData.extra_desc_eng  + '"' +  ',';
		statement	+= '"' + jData.extra_desc_chn  + '"' +  ',';
		statement	+= '"' + jData.extra_desc_time_eng  + '"' +  ',';
		statement	+= '"' + jData.extra_desc_time_chn  + '"' +  ',';
		statement	+= '"' + jData.fee_surcharge_code  + '"' +  ',';
		statement	+= '"' + jData.fee_surcharge  + '"' +  ',';
		statement	+= '"' + jData.fee_surcharge_desc_eng  + '"' +  ',';
		statement	+= '"' + jData.fee_surcharge_desc_chn  + '"' +  ',';
		statement	+= '"' + jData.discount_percent  + '"' +  ',';
		statement	+= '"' + jData.estimated_fee  + '"' +  ',';
		statement	+= '"' + jData.tips  + '"' +  ',';
		statement	+= '"' + jData.estimate_fee_notes_eng  + '"' +  ',';
		statement	+= '"' + jData.estimate_fee_notes_chn  + '"' +  ',';
		statement	+= '0' +  ',';
		statement	+= jData.simulation_is  + ',';
		statement	+= '"' + jData.state_code  + '"' +  ',';
		statement	+= '"' + jData.state_name_eng  + '"' +  ',';
		statement	+= '"' + jData.state_name_chn  + '"' +  ',';
		statement	+= ' NOW() ' + ',';
		statement	+= ' NOW()  ';
		statement	+= ' ); ';

    DB_OMS_Pool.getConnection(function(err,connection){
			if (err) throw err;
			connection.query(statement, function (err, result) {
				//console.log('insertId='+result.insertId);
				if(err) throw err;
				connection.release();
				//callback(true);
				callback(result.insertId);
			});
			connection.on('error', function(err) {      
				  throw err;
				  return;     
			});
		});
		
	};

	
	this.Reference_Update = function(insertId, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Reference_Update');
	
		var schedule_hhmm = moment().format('H:mm');
		console.log('schedule_dmy='+schedule_hhmm);
		
		var YYMMDD = moment().format('YYMMDD');
		console.log('YYMMDD='+YYMMDD);
		
		Number.prototype.pad = function(size) {
		  var s = String(this);
		  while (s.length < (size || 2)) {s = "0" + s;}
		  return s;
		}
		
		var ref = '10-'+YYMMDD;
		var last_no= insertId;
		pad_last_no=last_no.pad(10) // => "000000001"
		console.log('pad_last_no='+pad_last_no);
		
		ref = ref+'-'+pad_last_no;
		console.log('ref='+ref);
		
		
		
		var statement ='update tbl_resv_order_flow set ';
			statement	+= ' reference = "' + ref + '"' + ' ';
			statement	+= ' where ';
			statement	+= ' id = "' + insertId + '"';
		
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
	
	
	
		this.Order_Select = function(id, callback){

			if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Select');
		
			
			var statement = 'select \
							o.*,\
							c.last_name as cust_last_name,\
							c.first_name as cust_first_name ,\
							mobile.mobile_country as cust_mobile_country,\
							mobile.mobile as cust_mobile,\
							driver.last_name as driver_last_name,\
							driver.first_name as driver_first_name,\
							driver.mobile_country as driver_mobile_country,\
							driver.mobile as driver_mobile,\
							reg.model_code,\
							reg.registration_mark,\
							model.brand_code,\
							DATE_FORMAT(o.create_datetime, "%d/%m/%Y %H:%i:%s") as create_datetime, \
							DATE_FORMAT(o.schedule_datetime, "%d/%m %H:%i") as schedule_dm_hm \
							from tbl_resv_order_flow as o \
							left join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id \
							left join tbl_cust_mobile as mobile on o.cust_user_id = mobile.cust_user_id \
							left join tbl_driver_user_info as driver on o.driver_user_id = driver.driver_user_id \
							left join tbl_transport_registration as reg on o.registration_id = reg.registration_id \
							left join tbl_transport_model_master as model on reg.model_code = model.model_code ';
				statement	+= ' where ' ;					
				statement	+= ' o.id="' + id + '"';				

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
			
	
			this.Order_Driver_Select = function(id, callback){

				if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Driver_Select');
			
				
				var statement = 'select \
								o.*,\
								c.last_name as cust_last_name,\
								c.first_name as cust_first_name ,\
								mobile.mobile_country as cust_mobile_country,\
								mobile.mobile as cust_mobile,\
								driver.last_name as driver_last_name,\
								driver.first_name as driver_first_name,\
								driver.mobile_country as driver_mobile_country,\
								driver.mobile as driver_mobile,\
								reg.model_code,\
								reg.registration_mark,\
								model.brand_code,\
								concat(up.path ,"/" , up.filename) as picture, \
								DATE_FORMAT(o.create_datetime, "%d/%m/%Y %H:%i:%s") as create_datetime, \
								DATE_FORMAT(o.schedule_datetime, "%d/%m %H:%i") as schedule_dm_hm \
								from tbl_resv_order_flow as o \
								left join tbl_cust_user_info as c on o.cust_user_id = c.cust_user_id \
								left join tbl_cust_mobile as mobile on o.cust_user_id = mobile.cust_user_id \
								left join tbl_driver_user_info as driver on o.driver_user_id = driver.driver_user_id \
								left join tbl_transport_registration as reg on o.registration_id = reg.registration_id \
								left join tbl_transport_model_master as model on reg.model_code = model.model_code \
								left outer join tbl_driver_upload as up  on o.driver_user_id = up.driver_user_id ';
					statement	+= ' where ' ;					
					statement	+= ' o.id="' + id + '"';				
					statement   += ' and ';
					statement 	+= ' up.upload_code = "PHOTO" ';
					statement 	+= ' and up.upload_state_code = "ACCEPTED" and up.status = "1" ';
	
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

	
			this.Tips_Update = function(jData, callback){

					if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Tips_Update');
				
					var statement ='update tbl_resv_order_flow set ';
						statement	+= ' tips = "' + jData.tips + '"' + ' ';
						statement	+= ' where ';
						statement	+= ' id = "' + jData.id + '"';
					
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
				
				

			this.Cust_Cancel_Update = function(jData, callback){

						if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Cancel_Update');
					
						var statement ='update tbl_resv_order_flow set ';
							statement	+= ' resv_err_cust_cancel_order_datetime = NOW()' + ',';
							statement	+= ' state_code = "' + 'RED_ERR_ORDER_CANCEL_BY_CUST' + '"' + ',';
							statement	+= ' state_name_eng = "' + 'Customer had cancelled the order'+ '"' + ',';
							statement	+= ' state_name_chn = "' + '客戶已取消訂單' +  '"' + ' ';
							statement	+= ' where ';
							statement	+= ' id = "' + jData.id + '"';
						
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
	
					
		
			this.Order_List = function(jData, callback){

						if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_List');
					
						
					var statement = 'select \
										o.id,\
										o.type_code,\
										tm.type_name_eng,\
										tm.type_name_chn \
										from tbl_resv_order_flow as o \
										left join tbl_resv_order_service_type_master as tm on o.type_code=tm.type_code ';
						statement += ' where ';					
						statement	+= ' o.cust_mobile_token="' + jData.token + '"';				
						statement	+= ' order by o.id desc limit 50; ';				
				
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
				
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= OMS_Cust_Resv_Immediate_Order_Model;