//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	

//Data Model
//const OMS_Geo_Model = require('../model/OMS_Geo_Model.js');
const OMS_Resv_Order_Geo_Model = require('../model/OMS_Resv_Order_Geo_Master_Model.js');
const OMS_Resv_Order_Common_Model = require('../model/OMS_Resv_Order_Common_Model.js');
const OMS_Cust_Resv_Estimated_Fee_Model= require('../model/OMS_Cust_Resv_Estimated_Fee_Model.js');	


function Cust_Resv_Estimated_Fee_Handler(){
    
	//constructor

	var cust_user_id = 0;
	var order_priority = 0;

	var grade_code = '';
	var grade_sub_code ='';
	var order_vehicle_grade = [];
	
	var pickup_latitude = 0;
	var pickup_longitude = 0;
	var pickup_district_id = 0;
	var pickup_district_name_eng = '';
	var pickup_district_name_chn = '';
	var pickup_region_code = '';
	var pickup_region_name_eng = '';
	var pickup_region_name_chn = '';

	var drop_latitude = 0;
	var drop_longitude = 0;
	var drop_district_id = 0;
	var drop_district_name_eng = '';
	var drop_district_name_chn = '';
	var drop_region_code = '';
	var drop_region_name_eng = '';
	var drop_region_name_chn = '';
	
	var HK_CAR_X_SEAT_4_arry = [];  // [driver_user_id,registration_id,gps_distance,gps_latitude,gps_longitude
	var HK_CAR_BLACK_SEAT_4_arry = [];
	var HK_CAR_BLACK_SEAT_7_arry = [];

	var standard_fee =[];
	var standard_fee_override_factor =[];
	var standard_fee_peak_hour =[];

	var surcharge =[];
	
	var resv_order_service_type_discount =[];
	
	//var closly_driver_distance_km = 0;  // convert to arrive_min to json return
	var closly_driver_distance_km = 0;  // convert to arrive_min to json return


	this.Estimated_Fee = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Estimated_Fee');
	
	/*
	console.log('jData.token'+'='+jData.token);
	console.log('jData.grade_sub_code'+'='+jData.grade_sub_code);
	console.log('jData.pickup.eng'+'='+jData.pickup.eng);
	console.log('jData.pickup.chn'+'='+jData.pickup.chn);
	console.log('jData.pickup.lat'+'='+jData.pickup.lat);
	console.log('jData.pickup.lng'+'='+jData.pickup.lng);
	console.log('jData.gapi.km'+'='+jData.gapi.km);
	console.log('jData.gapi.minute'+'='+jData.gapi.minute);
	*/
	
	grade_sub_code = jData.grade_sub_code;
	if(jData.grade_sub_code == 'HK_CAR_X_SEAT_4') grade_code = 'HK_CAR_X';
	if(jData.grade_sub_code == 'HK_CAR_BLACK_SEAT_4') grade_code = 'HK_CAR_BLACK';
	if(jData.grade_sub_code == 'HK_CAR_BLACK_SEAT_7') grade_code = 'HK_CAR_BLACK';
	pickup_latitude = jData.pickup.lat;
	pickup_longitude = jData.pickup.lng;
	
		
	drop_latitude = jData.drop.lat;
	drop_longitude = jData.drop.lng;
		
	type_code = jData.type_code;
	
	/*
	console.log('grade_sub_code'+'='+grade_sub_code);
	console.log('pickup_latitude'+'='+pickup_latitude);
	console.log('pickup_longitude'+'='+pickup_longitude);
	*/
	
	/************************************************************/
	/***water fall routine***************************************/
	/************************************************************/
	async.waterfall([
		function(callback){
			// get cust order prioirty 
			console.log('execute async-function-get cust order prioirty');
			var dmOMS = new OMS_Resv_Order_Common_Model();
			var record = dmOMS.Cust_Basic_Select(jData, function(data) {
					console.log("execute dmOMS.Cust_Basic_Select()");
					cust_user_id = data[0].user_id;
					order_priority = data[0].order_priority;
					callback(null) //waterfall call back next function
				});		
		},
		function (callback) {
			// get order vehicle grade info
			console.log('execute async-function-get order vehicle_grade info');
			var jData = {
				grade_sub_code: grade_sub_code
			};
			var dmOMS = new OMS_Resv_Order_Common_Model();
			var record = dmOMS.Order_Vehicle_Grade_Info_Select(jData, function(data) {
				console.log("execute dmOMS.Order_Vehicle_Grade_Info_Select()");
					order_vehicle_grade = data[0]; 
					callback(null) //waterfall call back next function
				});		
		},		
		function(callback){
			// get pickup district first
			console.log('execute async-function-get pickup district first');
			var jData = {
				latitude: pickup_latitude,
				longitude: pickup_longitude
			};
			var dmOMS = new OMS_Resv_Order_Geo_Model();
			var record = dmOMS.Get_District(jData, function(data) {
					console.log("execute dmOMS.Get_District()");
					pickup_district_id = data[0].district_id;
					pickup_district_name_eng = data[0].district_name_eng;
					pickup_district_name_chn = data[0].district_name_chn;
				
					pickup_region_code = data[0].region_code;
					pickup_region_name_eng = data[0].region_name_eng;
					pickup_region_name_chn = data[0].region_name_chn;
					//console.log('pickup_district_id=' + pickup_district_id);
					//console.log('pickup_region_code=' + pickup_region_code);
					callback(null) //waterfall call back next function
				});		
	
		},		
	  function(callback){
		// get drop district second
		console.log('execute async-function-get drop district second');
		var jData = {
			latitude: drop_latitude,
			longitude: drop_longitude
		};
		var dmOMS = new OMS_Resv_Order_Geo_Model();
		var record = dmOMS.Get_District(jData, function(data) {
				console.log("execute dmOMS.Get_District()");
				drop_district_id = data[0].district_id;
				drop_district_name_eng = data[0].district_name_eng;
				drop_district_name_chn = data[0].district_name_chn;

				drop_region_code = data[0].region_code;
				drop_region_name_eng = data[0].region_name_eng;
				drop_region_name_chn = data[0].region_name_chn;
				//console.log('drop_district_id=' + drop_district_id);
				//console.log('drop_region_code=' + drop_region_code);
				callback(null) //waterfall call back next function
			});		
	  },
	  function(callback){
		console.log('execute async-function-get surcharge district ');
		var jData = {
			latitude: pickup_latitude,
			longitude: pickup_longitude
		};		
		var dmOMS = new OMS_Resv_Order_Geo_Model();
		var record = dmOMS.Get_Surcharge_District(jData, function(data) {
				console.log("execute dmOMS.Get_Surcharge_District()");
				if(data.length>0) {
					surcharge.push(data[0]);
					console.log('surcharge.sur_district_id=' + surcharge[0].sur_district_id);
				}
				callback(null) //waterfall call back next function
			});
	  },
	  function(callback){
		// get standard fee
		console.log('execute async-function-get standard fee');
		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Master_Model_Cache.List_All(function(data) {
				console.log("execute dmOMS.	()");
				for (var i = 0; i < data.length; i++) {
					/*
					console.log('data[i].grade_sub_code = ' + data[i].grade_sub_code);
					console.log('data[i].region_code = ' + data[i].region_code);
					console.log('grade_sub_code = ' + grade_sub_code);
					console.log('pickup_region_code = ' + pickup_region_code);
					*/
					if(data[i].grade_sub_code == grade_sub_code && data[i].region_code == pickup_region_code) {
					standard_fee.push(data[i]);
					//if(global.debug) console.log(standard_fee);
						}
				}
				callback(null) //waterfall call back next function
			});		
		
	  },	  
	  function(callback){
		// get resv order service type discount
		console.log('execute async-function-get resv order service type discount ');
		var record = dm_OMS_Standard_Model_Cache.OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache.List_All(function(data) {
				console.log("execute dmOMS.	()");
				for (var i = 0; i < data.length; i++) {
					if(data[i].type_code == type_code) {
					resv_order_service_type_discount.push(data[i]);
					//if(global.debug) console.log(resv_order_service_type_discount);
						}
				}
				callback(null) //waterfall call back next function
			});		
	  },		  
	  function(callback){
		// get standard override rate (by district)
		console.log('execute async-function-get standard override rate (by district)');
		//do something 
		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Override_Factor_Model_Cache.List_All(function(data) {
				if(global.debug) console.log(new Date());
				if(global.debug) console.log("execute dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Override_Factor_Model_Cache.List_All()");
				for (var i = 0; i < data.length; i++) {
					/*
					console.log('factor_id = ' + data[i].factor_id);
					console.log('grade_sub_code = ' + data[i].grade_sub_code);
					console.log('percent_factor = ' + data[i].percent_factor);
					console.log('district_id = ' + data[i].district_id);
					console.log('district_name_eng = ' + data[i].district_name_eng);
					*/
					if(data[i].grade_sub_code == grade_sub_code && data[i].district_id == pickup_district_id) {
						console.log('Matched override district');
						standard_fee_override_factor.push(data[i]);
						//if(global.debug) console.log(standard_fee_override_factor);
						}
				}		

		callback(null) //waterfall call back next function
				
		});		

		
	  },
	  function(callback){
		// get standard peak hour rate (by grade and region)
		console.log('execute async-function-get standard peak hour rate (by grade and region)');
		//do something 
		var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.List_All(function(data) {
				if(global.debug) console.log(new Date());
				if(global.debug) console.log("execute dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.List_All()");
				for (var i = 0; i < data.length; i++) {
					if(data[i].grade_code == grade_code && data[i].region_code == pickup_region_code ) {
						
						var isPeak_Week = false;
						var isHoliday_Week = false;
						var isHoliday_Match = false;
						var isTime_Match = false;
						var Cur_Week_Day = new Date().getDay(); 
						//console.log('Cur_Week_Day = ' + Cur_Week_Day);
						if(data[i].sun_is == 1 && Cur_Week_Day == 0) isPeak_Week = true;
						if(data[i].mon_is == 1 && Cur_Week_Day == 1) isPeak_Week = true;
						if(data[i].tue_is == 1 && Cur_Week_Day == 2) isPeak_Week = true;
						if(data[i].wed_is == 1 && Cur_Week_Day == 3) isPeak_Week = true;
						if(data[i].thr_is == 1 && Cur_Week_Day == 4) isPeak_Week = true;
						if(data[i].fri_is == 1 && Cur_Week_Day == 5) isPeak_Week = true;
						if(data[i].sat_is == 1 && Cur_Week_Day == 6) isPeak_Week = true; 
						//if(isPeak_Week) console.log('isPeak_Week is true .........');
						
						if(data[i].holiday_is == 1) isHoliday_Week = true; 
						//if(isHoliday_Week) console.log('isHoliday_Week is true.......');
						if(isHoliday_Week) {
							var record = dm_OMS_Standard_Model_Cache.OMS_Global_Public_Holiday_Model_Cache.List_All(function(data) {
								for (var i = 0; i < data.length; i++) {
									if(data[i].holiday_date == moment().format('YYYY-MM-DD') ) {
										isHoliday_Match = true;
										//console.log('Matched Holiday');
										//console.log('holiday_date =' + data[i].holiday_date);
										//console.log('holiday_name_eng =' + data[i].holiday_name_eng);
									}
								}
							});		
						}
						if(isPeak_Week || isHoliday_Week) {
							var Range_From_YMDHHMM  =  moment().format('YYYY-MM-DD') + ' '+data[i].time_from;
							var datestr = Range_From_YMDHHMM;
							//console.log('Range_From_YMDHHMM =' + datestr);
							var Range_From_timestamp = Math.round(new Date(datestr.split("-").join("-")).getTime()/1000);
							//console.log('timestamp =' + Range_From_timestamp);

							var Range_To_YMDHHMM  =  moment().format('YYYY-MM-DD') + ' '+data[i].time_to;
							var datestr = Range_To_YMDHHMM;
							//console.log('Range_To_YMDHHMM =' + datestr);
							var Range_To_timestamp = Math.round(new Date(datestr.split("-").join("-")).getTime()/1000);
							//console.log('timestamp =' + Range_To_timestamp);

							var Now_YMDHHMM  =  moment().format('YYYY-MM-DD') + ' '+data[i].time_to;
							var datestr = Now_YMDHHMM;
							//console.log('Now_YMDHHMM =' + datestr);
							var Now_timestamp = Math.round(new Date().getTime()/1000);
							//console.log('Now_timestamp =' + Range_To_timestamp);
							if(Now_timestamp >= Range_From_timestamp && Now_timestamp <= Range_To_timestamp){
								isTime_Match = true;
							}

						}
						if(isTime_Match) {
							console.log('Matched peak hour');
							standard_fee_peak_hour.push(data[i]);
							//if(global.debug) console.log(standard_fee_peak_hour);
							/*
							c8onsole.log('peak_code = ' + data[i].peak_code);
							console.log('grade_code = ' + data[i].grade_code);
							console.log('region_code = ' + data[i].region_code);
							console.log('percent_factor = ' + data[i].percent_factor);
							console.log('sat_is = ' + data[i].sat_is);
							console.log('holiday_is = ' + data[i].holiday_is);
							console.log('time_from = ' + data[i].time_from);
							console.log('time_to = ' + data[i].time_to	);
							*/
						}
					}
				}		

		callback(null) //waterfall call back next function
				
		});		

		
	  },
	  function(callback){
		// get closly driver
		if(global.debug) console.log('execute async-function-get closly driver');
		var jData = {
			grade_sub_code: grade_sub_code,
			region_code: pickup_region_code,
			latitude: pickup_latitude,
			longitude: pickup_longitude
		};
		var dmOMS = new OMS_Cust_Resv_Estimated_Fee_Model();
				var record = dmOMS.Get_Closly_Driver_List_All(jData, function(data) {
				var gps = new GPS();
			
				if(global.debug) console.log("execute dmOMS.Get_Closly_Driver_List_All()");
				if(global.debug) console.log("execute dmOMS.Get_Closly_Driver_List_All()");

				var latitude = 0;
				var longitude = 0;
				var gps_distance = 0;
				//console.log('data.length=' + data.length);

				for (var i = 0; i < data.length; i++) {
					/*
					console.log('driver_user_id = ' + data[i].driver_user_id);
					console.log('grade_sub_code = ' + data[i].grade_sub_code);
					console.log('driver gps_latitude =' + data[i].gps_latitude);
					console.log('driver gps_longitude =' + data[i].gps_longitude);
					*/
					gps_distance  = gps.distance(pickup_latitude, pickup_longitude, data[i].gps_latitude, data[i].gps_longitude, 'K');
					if(global.debug) console.log('Distance (KM) = ' + gps_distance );
					
					
					//put into array for distace < 15KM
					//if(gps_distance<=15) {
					max_driver_distance = 0 ;
					if(!surcharge[0]) max_driver_distance = global.RW_MAXDRVDISTANCE;
					if(surcharge[0]) max_driver_distance = RW_MAXDRVDISTANCE_SURCHARGE_AREA;

					//if(gps_distance<=global.RW_MAXDRVDISTANCE) {	
					if(gps_distance<=max_driver_distance) {	
						if(data[i].grade_sub_code == 'HK_CAR_X_SEAT_4') {
							if(closly_driver_distance_km == 0) closly_driver_distance_km = gps_distance + 0.5 ;  //buffer if pickup == driver.now
							HK_CAR_X_SEAT_4_arry.push([data[i].driver_user_id,data[i].registration_id,gps_distance,data[i].gps_latitude,data[i].gps_longitude]);
						}
						if(data[i].grade_sub_code == 'HK_CAR_BLACK_SEAT_4') {
							if(closly_driver_distance_km == 0) closly_driver_distance_km = gps_distance + 0.5 ;
							HK_CAR_BLACK_SEAT_4_arry.push([data[i].driver_user_id,data[i].registration_id,gps_distance,data[i].gps_latitude,data[i].gps_longitude]);
						}
						if(data[i].grade_sub_code == 'HK_CAR_BLACK_SEAT_7') {
							if(closly_driver_distance_km == 0) closly_driver_distance_km = gps_distance +0.5;
							HK_CAR_BLACK_SEAT_7_arry.push([data[i].driver_user_id,data[i].registration_id,gps_distance,data[i].gps_latitude,data[i].gps_longitude]);
						}
					}
					
				}


			
				if(global.debug) console.log('HK_CAR_X_SEAT_4_arry :');
				if(global.debug) console.log(HK_CAR_X_SEAT_4_arry);
				if(global.debug) console.log('HK_CAR_BLACK_SEAT_4_arry :');
				if(global.debug) console.log(HK_CAR_BLACK_SEAT_4_arry);
				if(global.debug) console.log('HK_CAR_BLACK_SEAT_7_arry :');
				if(global.debug) console.log(HK_CAR_BLACK_SEAT_7_arry);
				
				callback(null); //waterfall call back next function

			});		
		
	  },
	  function(callback){
		//do someting 
		callback(null); //waterfall call back next function
	  }	  
	  ], function (err, result) {
			if(global.debug) console.log('end waterfall execute');	
			//var arrive_min =Math.round(closly_driver_distance_km) + 1 ;
			//console.log('AAAAA--closly_driver_distance_km');
			//console.log(closly_driver_distance_km);
			//console.log('Math.round closly_driver_distance_km');
			//console.log(Math.round(closly_driver_distance_km));
			//console.log('arrive_min');
			//console.log(arrive_min);
			if(closly_driver_distance_km != 0  &&  closly_driver_distance_km < 1) closly_driver_distance_km = 1;
			if(closly_driver_distance_km > 1) closly_driver_distance_km = Math.round(closly_driver_distance_km) + 1;
			//var arrive_min = (closly_driver_distance_km != 0 ? Math.round(closly_driver_distance_km) + 1 : 1);
			var arrive_min = closly_driver_distance_km;
			var fee = new Object;
			fee.currency_code = standard_fee[0].currency_code ;
			fee.start_up = standard_fee[0].fee_start_up ;
			fee.min_charge = standard_fee[0].fee_min_charge ;
			
			fee.surcharge = 0;
			
			if(surcharge[0]) {
				if(grade_code=='HK_CAR_X')  fee.surcharge = surcharge[0].hkcar_x_fee;
				if(grade_code=='HK_CAR_BLACK')  fee.surcharge = surcharge[0].hkcar_black_fee;
			}

			
			fee.per_km = standard_fee[0].fee_per_km ;
			fee.per_min = standard_fee[0].fee_per_min ;
		
			
			var extra = new Object;
			extra.reason = null;
			extra.code =  null;
			extra.rate = null;
			var desc = new Object;
			desc.eng = null;
			desc.chn = null;
			desc.time_eng = null;
			desc.time_chn = null;
	
	
			if(standard_fee_override_factor[0]) {
				extra.reason = 'OVERRIDE';
				extra.code = 'N/A';
				extra.rate = standard_fee_override_factor[0].percent_factor;
				fee.extra = extra;		
				var desc = new Object;
				desc.eng = '';
				desc.chn = '';
				desc.time_eng = '';
				desc.time_chn = '';
				fee.extra.desc = desc ;
				
			} else {
				if(standard_fee_peak_hour[0]) {
					extra.reason = 'PEAKHOUR';
					extra.code = standard_fee_peak_hour[0].peak_code;
					extra.rate = standard_fee_peak_hour[0].percent_factor;
					fee.extra = extra;		
					var desc = new Object;
					desc.eng = standard_fee_peak_hour[0].desc_eng;
					desc.chn = standard_fee_peak_hour[0].desc_chn;
					desc.time_eng = standard_fee_peak_hour[0].desc_time_eng;
					desc.time_chn = standard_fee_peak_hour[0].desc_time_chn;
					fee.extra.desc = desc ;
				}
			}

			
			if(!standard_fee_override_factor[0] && !standard_fee_peak_hour[0]) {
				fee.extra  = null;
			}
			
			var estimated = new Object;
			//var km = fee.start_up + jData.gapi.km * fee.per_km;
			var km = fee.start_up + fee.surcharge + jData.gapi.km * fee.per_km;
			//var km = fee.start_up + fee.surcharge + jData.gapi.km * fee.per_km;
			km = km <= fee.min_charge ? fee.min_charge : km;
			var min = fee.start_up + jData.gapi.minute * fee.per_min;
			min = min <= fee.min_charge ? fee.min_charge : min;
			var price = km >= min ? km : min;
			if (fee.extra) { price = price * fee.extra.rate; }
			
						
			//estimated.min = common.`round`(price * 0.9 <= fee.min_charge ? fee.min_charge : price , 0),
			//estimated.max = common.round(price * 0.9 <= fee.min_charge ? price * 1.2 : price , 0)
			estimated.min = common.round(price  <= fee.min_charge ? fee.min_charge : price , 0);
			estimated.max = common.round(price  <= fee.min_charge ? price  : price , 0);

			estimated.min = common.round(price * (resv_order_service_type_discount[0].discount_percent/100+1) , 0);
			estimated.max = estimated.min;
			
			//if (jData.gapi.km == 0) {
			if (jData.gapi.km <= 0.2) {
			estimated.min = 0;
			estimated.max = 0;
		 	 }
			
		    estimated.fee = estimated.min;
			
			//Handle service type discount 
		  var estimate_fee_notes_eng = '';
		  var estimate_fee_notes_chn = '';
		  
		  if (resv_order_service_type_discount[0].discount_percent > 0) {
			  estimated.fee_after_discount = estimated.fee - (estimated.fee * (resv_order_service_type_discount[0].discount_percent / 100));
			  estimated.fee_after_discount = common.round(estimated.fee_after_discount, 0);
			  estimated.notes_formula = '($' + estimated.fee + ' - ' + common.round(resv_order_service_type_discount[0].discount_percent, 0) + '%)=$' + estimated.fee_after_discount;

			  estimate_fee_notes_eng = resv_order_service_type_discount[0].type_name_eng;
			  estimate_fee_notes_eng += ' Discount ';
			  estimate_fee_notes_eng +=common.round(resv_order_service_type_discount[0].discount_percent, 0);
			  estimate_fee_notes_eng += '%';
			  estimate_fee_notes_eng += '\n'+estimated.notes_formula;
			  estimate_fee_notes_chn += resv_order_service_type_discount[0].type_name_chn;
			  estimate_fee_notes_chn += ' 折扣 ';
			  estimate_fee_notes_chn +=common.round(resv_order_service_type_discount[0].discount_percent, 0);
			  estimate_fee_notes_chn +='%';
			  estimate_fee_notes_chn += '\n'+estimated.notes_formula;
		  }  
		  	  
			var glist = new Object;
			glist = {
				HK_CAR_X_SEAT_4: [],
				HK_CAR_BLACK_SEAT_4: [],
				HK_CAR_BLACK_SEAT_7: []
			};

            for (var i = 0; i < HK_CAR_X_SEAT_4_arry.length; i++) {
				    if(i<5) {
					glist['HK_CAR_X_SEAT_4'].push({
					direction: 0,
                    lat: HK_CAR_X_SEAT_4_arry[i][3],
                    lng: HK_CAR_X_SEAT_4_arry[i][4]
					});
					}
            };

            for (var i = 0; i < HK_CAR_BLACK_SEAT_4_arry.length; i++) {
				    if(i<5) {
				    glist['HK_CAR_BLACK_SEAT_4'].push({
					direction: 0,
                    lat: HK_CAR_BLACK_SEAT_4_arry[i][3],
                    lng: HK_CAR_BLACK_SEAT_4_arry[i][4]
					});
					}
            };
			
			
            for (var i = 0; i < HK_CAR_BLACK_SEAT_7_arry.length; i++) {
				    if(i<5) {
				    glist['HK_CAR_BLACK_SEAT_7'].push({
					direction: 0,
                    lat: HK_CAR_BLACK_SEAT_7_arry[i][3],
                    lng: HK_CAR_BLACK_SEAT_7_arry[i][4]
					});
					}
            };
			
			
			var jData_Insert = {
				api_server_domain: global.api_server_domain,
				mobile_token: jData.token,
				grade_sub_code: jData.grade_sub_code,
				pickup_location_eng: jData.pickup.eng,
				pickup_location_chn: jData.pickup.chn,
				pickup_latitude: jData.pickup.lat,
				pickup_longitude: jData.pickup.lng,
				pickup_district_id: pickup_district_id,
				drop_location_eng: jData.drop.eng,
				drop_location_chn: jData.drop.chn,
				drop_latitude: jData.drop.lat,
				drop_longitude: jData.drop.lng,
				drop_district_id: drop_district_id,
				gapi_km: jData.gapi.km,
				gapi_minute: jData.gapi.minute,
				currency_code: fee.currency_code,
				fee_start_up: standard_fee[0].fee_start_up,
				fee_min_charge: standard_fee[0].fee_min_charge,
				fee_per_km: standard_fee[0].fee_per_km,
				fee_per_min: standard_fee[0].feeper_min,
				extra_reason: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.reason : null ),
				extra_code:  ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.code : null ),
				extra_rate: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.rate : null ),
				extra_desc_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.eng : null ),
				extra_desc_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.chn : null ),
				extra_desc_time_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_eng : null ),
				extra_desc_time_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_chn : null ),
				fee_surcharge_code: ( (surcharge[0]) ? surcharge[0].sur_district_id : null ),
				fee_surcharge: fee.surcharge,
				fee_surcharge_desc_eng: ( (surcharge[0]) ? surcharge[0].sur_district_name_eng : null ),
				fee_surcharge_desc_chn: ( (surcharge[0]) ? surcharge[0].sur_district_name_chn : null ),
				type_code: resv_order_service_type_discount[0].type_code,
				discount_percent: resv_order_service_type_discount[0].discount_percent,
				estimated_fee: estimated.fee,
				estimated_min: estimated.min,
				estimated_max: estimated.max,
				arrive_min: arrive_min
				};
			

	
			var dmOMS = new OMS_Cust_Resv_Estimated_Fee_Model();
			var record = dmOMS.Cust_Resv_Estimated_Fee_Insert(jData_Insert, function(data) {
				//do something
			});
				
			var jResponse = {
				api_server_domain: global.api_server_domain,
				mobile_token: jData.token,
				type_code: jData.type_code,
				cust_user_id: cust_user_id,
				order_priority: order_priority,
				profile_code: jData.profile_code,
				grade_sub_code: jData.grade_sub_code,
				grade_name_eng: order_vehicle_grade.grade_name_eng,
				grade_name_chn: order_vehicle_grade.grade_name_eng,
				seat_name_eng: order_vehicle_grade.sub_grade_name_eng,
				seat_name_chn: order_vehicle_grade.sub_grade_name_chn,
				pickup_location_eng: jData.pickup.eng,
				pickup_location_chn: jData.pickup.chn,
				pickup_latitude: jData.pickup.lat,
				pickup_longitude: jData.pickup.lng,
				pickup_district_id: pickup_district_id,
				pickup_district_name_eng: pickup_district_name_eng,
				pickup_district_name_chn: pickup_district_name_chn,
				pickup_region_code: pickup_region_code,
				pickup_region_name_eng: pickup_region_name_eng,
				pickup_region_name_chn: pickup_region_name_chn,
				drop_location_eng: jData.drop.eng,
				drop_location_chn: jData.drop.chn,
				drop_latitude: jData.drop.lat,
				drop_longitude: jData.drop.lng,
				drop_district_id: drop_district_id,
				drop_district_name_eng: drop_district_name_eng,
				drop_district_name_chn: drop_district_name_chn,
				drop_region_code: drop_region_code,
				drop_region_name_eng: drop_region_name_eng,
				drop_region_name_chn: drop_region_name_chn,
				gapi_km: jData.gapi.km,
				gapi_minute: jData.gapi.minute,
				currency_code: fee.currency_code,
				fee_start_up: standard_fee[0].fee_start_up,
				fee_min_charge: standard_fee[0].fee_min_charge,
				fee_per_km: standard_fee[0].fee_per_km,
				fee_per_min: standard_fee[0].fee_per_min,
				extra_reason: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.reason : null ),
				extra_code:  ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.code : null ),
				extra_rate: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.rate : null ),
				extra_desc_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.eng : null ),
				extra_desc_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.chn : null ),
				extra_desc_time_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_eng : null ),
				extra_desc_time_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_chn : null ),
				fee_surcharge_code: ( (surcharge[0]) ? surcharge[0].sur_district_id : null ),
				fee_surcharge: fee.surcharge,
				fee_surcharge_desc_eng: ( (surcharge[0]) ? surcharge[0].sur_district_name_eng : null ),
				fee_surcharge_desc_chn: ( (surcharge[0]) ? surcharge[0].sur_district_name_chn : null ),
				discount_percent: resv_order_service_type_discount[0].discount_percent,
				estimated_fee: estimated.fee,
				tips: jData.tips,
				estimate_fee_notes_eng: estimate_fee_notes_eng,
				estimate_fee_notes_chn: estimate_fee_notes_chn,
				simulation_is: jData.simulation_is,
				state_code: jData.state_code,
				state_name_eng: jData.state_name_eng,
				state_name_chn: jData.state_name_chn
				};
			
	
		callback(jResponse);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/
	
	
	

	};
	


	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Resv_Estimated_Fee_Handler;