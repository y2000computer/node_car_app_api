const moment= require('moment');
const mysql= require('mysql');
const DB_OMS_Pool = require('../func/DB_OMS_Pool.js').DB_OMS_Pool;

function OMS_Resv_Order_Common_Model(){
    
	//no constructor
	
	
	this.Order_Vehicle_Grade_Info_Select = function(jData, callback){

		if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Order_Vehicle_Grade_Info_Select');
	
		
		var statement = 'select \
						grade.grade_code, grade.grade_name_eng, \
						sub.grade_sub_code, sub.sub_grade_name_eng, sub.sub_grade_name_chn\
						from tbl_transport_grade_sub_master as sub \
						left join tbl_transport_grade_master as grade on sub.grade_code = grade.grade_code ';
			statement	+= ' where ' ;					
			statement	+= 'sub.grade_sub_code="' + jData.grade_sub_code + '"';				
	
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

	
	
	this.Cust_Basic_Select = function(jData, callback){

			if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Cust_Basic_Select');
		
			
			var statement ='select "true" as "result", map.user_type , c.cust_user_id as "user_id", c.email, c.facebook_id, c.last_name, c.first_name, \
							c.language_code, c.status, c.create_datetime, c.ready_for_tour, m.irow_id as "mobile_id", \
							m.mobile_country as "mobile_country_code", m.mobile, \
							sub.order_priority \
							from tbl_global_token_map as map \
							left outer join tbl_cust_user_info as c on map.user_id = c.cust_user_id \
							left outer join tbl_cust_grade_sub_master as sub on c.grade_sub_code = sub.grade_sub_code \
							left outer join tbl_cust_mobile as m on  c.cust_user_id = m.cust_user_id \ '
			statement	+= ' where m.status = 1 and map.mobile_token="' + jData.token + '";' ;
			
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


module.exports= OMS_Resv_Order_Common_Model;