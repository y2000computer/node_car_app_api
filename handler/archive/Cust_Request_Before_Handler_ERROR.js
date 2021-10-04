//NPM Library
const moment= require('moment');
const async = require('async');

//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	

//Data Model
const OMS_Global_Model= require('../model/OMS_Global_Model.js');	
const OMS_Geo_Model= require('../model/OMS_Geo_Model.js');	
const OMS_Cust_Search_Driver_Model= require('../model/OMS_Cust_Search_Driver_Model.js');	
const OMS_Standard_Fee_Master_Model= require('../model/OMS_Standard_Fee_Master_Model.js');	



function Cust_Request_Before_Handler(){
    
	//constructor
	var grade_code ='';
	var grade_sub_code ='';
	var pickup_latitude = 0;
	var pickup_longitude = 0;
	var pickup_region_code = '';
	var pickup_district_id = 0;

	var HK_CAR_X_SEAT_4_arry = [];  // [driver_user_id,registration_id,gps_distance,gps_latitude,gps_longitude
	var HK_CAR_BLACK_SEAT_4_arry = [];
	var HK_CAR_BLACK_SEAT_7_arry = [];

	var standard_fee =[];
	var standard_fee_override_factor =[];
	var standard_fee_peak_hour =[];

	var new_extra_reason = null;
	var new_extra_peak_code =  null;
	var new_extra_extra_rate = null;
	var new_extra_desc_eng = null;
	var new_extra_desc_chn = null;
	var new_extra_desc_time_eng = null;
	var new_extra_desc_time_chn = null;

	//var closly_driver_distance_km = 0;  // convert to arrive_min to json return
	var closly_driver_distance_km = 0;  // convert to arrive_min to json return

	this.Search_Driver = function(jData, callback){

	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'Search_Driver');
	
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
		// get district first
		console.log('execute async-function-get district first');
		var jData = {
			latitude: pickup_latitude,
			longitude: pickup_longitude
		};
		var dmOMS = new OMS_Geo_Model();
		var record = dmOMS.Get_District(jData, function(data) {
				console.log("execute dmOMS.Get_District()");
				pickup_district_id = data[0].district_id;
				pickup_region_code = data[0].region_code;
				//console.log('pickup_district_id=' + pickup_district_id);
				//console.log('pickup_region_code=' + pickup_region_code);
				callback(null) //waterfall call back next function
			});		
		
	  },
	  function(callback){
		// get standard fee
		console.log('execute async-function-get standard fee');
		//var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Master_Model_Cache.List_All(function(data) {
		var dmOMS = new OMS_Standard_Fee_Master_Model();
		var record = dmOMS.Standard_Fee_Master_List_All(function(data) {
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
		// get standard override rate (by district)
		console.log('execute async-function-get standard override rate (by district)');
		//do something 
		//var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Override_Factor_Model_Cache.List_All(function(data) {
		var dmOMS = new OMS_Standard_Fee_Master_Model();
		var record = dmOMS.Standard_Fee_Override_Factor_List_All(function(data) {
				if(global.debug) console.log(new Date());
				if(global.debug) console.log("execute dmOMS.Standard_Fee_Override_Factor_List_All()");
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
				
		});		

		callback(null) //waterfall call back next function
		
	  },
	  function(callback){
		// get standard peak hour rate (by grade and region)
		console.log('execute async-function-get standard peak hour rate (by grade and region)');
		//do something 
		//var record = dm_OMS_Standard_Model_Cache.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.List_All(function(data) {
		var dmOMS = new OMS_Standard_Fee_Master_Model();
		var record = dmOMS.Standard_Fee_Peak_Hour_Master_List_All(function(data) {
				if(global.debug) console.log(new Date());
				if(global.debug) console.log("execute dmOMS.Standard_Fee_Peak_Hour_Master_List_All()");
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
						/*
						if(isHoliday_Week) {
							var dmOMS_Global = new OMS_Global_Model();
							//var record = dm_OMS_Standard_Model_Cache.OMS_Global_Public_Holiday_Model_Cache.List_All(function(data) {
							var record = dmOMS_Global.Global_Public_Holiday_List_All(function(data) {
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
						*/
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
						//isTime_Match = true     //must remove after prod
						if(isTime_Match) {
							console.log('MATCH MATCHMATCHMATCHMATCHMATCHMATCH eak hour');
							//standard_fee_peak_hour.push(data[i]);
							//if(global.debug) console.log(standard_fee_peak_hour);

							new_extra_reason = 'PEAKHOUR';
							new_extra_peak_code = data[i].peak_code;
							new_extra_extra_rate = data[i].percent_factor;
							new_extra_desc_eng = data[i].desc_eng;
							new_extra_desc_chn = data[i].desc_chn;
							new_extra_desc_time_eng = data[i].desc_time_eng;
							new_extra_desc_time_chn = data[i].desc_time_chn;

						
							console.log('new_extra_reason = ' + new_extra_reason);
							console.log('new_extra_peak_code = ' + new_extra_peak_code);
							console.log('new_extra_extra_rate = ' + new_extra_extra_rate);
							console.log('new_extra_desc_eng = ' + new_extra_desc_eng);
							console.log('new_extra_desc_chn = ' +new_extra_desc_chn);
							console.log('new_extra_desc_time_eng = ' + new_extra_desc_time_eng);
							console.log('new_extra_desc_time_chn = ' + new_extra_desc_time_chn);
					
							
							/*
							console.log('peak_code = ' + data[i].peak_code);
							console.log('grade_code = ' + data[i].grade_code);
							console.log('region_code = ' + data[i].region_code);
							console.log('percent_factor = ' + data[i].percent_factor);
							console.log('sat_is = ' + data[i].sat_is);
							console.log('holiday_is = ' + data[i].holiday_is);
							console.log('time_from = ' + data[i].time_from);
							console.log('time_to = ' + data[i].time_to	);
							*/
							
						}
			
						new_extra_reason = 'PEAKHOUR';
						new_extra_peak_code = '001'
						new_extra_extra_rate = 1.4;
						new_extra_desc_eng = 'test111';
						new_extra_desc_chn = 'test1111';
						new_extra_desc_time_eng = 'test111';
						new_extra_desc_time_chn = 'test1111';
				
							if(!isTime_Match) {
							//standard_fee_peak_hour.push(data[i]);  //Have to remove after test 8 Nov, 2017
							console.log('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUMatched peak hour');
					
						}						
					}
				}		


						new_extra_reason = 'PEAKHOUR';
						new_extra_peak_code = '001'
						new_extra_extra_rate = 1.4;
						new_extra_desc_eng = 'test22222';
						new_extra_desc_chn = 'test22222';
						new_extra_desc_time_eng = 'test2222';
						new_extra_desc_time_chn = 'test2222';
		
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
		var dmOMS = new OMS_Cust_Search_Driver_Model();
				var record = dmOMS.Get_Closly_Driver_List_All(jData, function(data) {
				var gps = new GPS();
			
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
					if(gps_distance<=global.RW_MAXDRVDISTANCE) {	
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
			fee.per_km = standard_fee[0].fee_per_km ;
			fee.per_min = standard_fee[0].fee_per_min ;
		
			/*
			new_extra_reason = 'PEAKHOUR';
			new_extra_peak_code = '001'
			new_extra_extra_rate = 1.4;
			new_extra_desc_eng = 'test';
			new_extra_desc_chn = 'test';
			new_extra_desc_time_eng = 'test';
			new_extra_desc_time_chn = 'test';
			*/	
		
		
			var extra = new Object;
			extra.reason = ( (new_extra_reason) ? new_extra_reason : null );
			extra.code =   ( (new_extra_peak_code) ? new_extra_peak_code : null );
			extra.rate =  ( (new_extra_extra_rate) ? new_extra_extra_rate : null );
			fee.extra = extra;		
			var desc = new Object;
			desc.eng =  ( (new_extra_desc_eng) ? new_extra_desc_eng : null );
			desc.chn =  ( (new_extra_desc_chn) ? new_extra_desc_chn : null );
			desc.time_eng =  ( (new_extra_desc_time_eng) ? new_extra_desc_time_eng : null );
			desc.time_chn =  ( (new_extra_desc_time_chn) ? new_extra_desc_time_chn : null );
			fee.extra.desc = desc ;

			if(!new_extra_reason) {
				fee.extra  = null;  //remove after prod
			}
			

							console.log('.............................................');
							console.log('new_extra_reason = ' + new_extra_reason);
							console.log('new_extra_peak_code = ' + new_extra_peak_code);
							console.log('new_extra_extra_rate = ' + new_extra_extra_rate);
							console.log('new_extra_desc_eng = ' + new_extra_desc_eng);
							console.log('new_extra_desc_chn = ' +new_extra_desc_chn);
							console.log('new_extra_desc_time_eng = ' + new_extra_desc_time_eng);
							console.log('new_extra_desc_time_chn = ' + new_extra_desc_time_chn);
							console.log('.............................................');
							console.log('extra.reason = ' + extra.reason);
							console.log('extra.code = ' + extra.code);
							console.log('extra.rate  = ' + extra.rate );
							console.log('desc.eng = ' + desc.eng);
							console.log('desc.time_chn = ' +desc.time_chn);
							console.log('new_extra_desc_time_eng = ' + desc.time_eng);
							console.log('new_extra_desc_time_chn = ' + desc.time_chn);
							console.log('.............................................');
		
		
			/*
			var extra = new Object;
			extra.reason = null;
			extra.code =  null;
			extra.rate = null;
			var desc = new Object;
			desc.eng = null;
			desc.chn = null;
			desc.time_eng = null;
			desc.time_chn = null;
			*/
	
			/*
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
			*/
			//need remove after test
			/*
					extra.reason = 'PEAKHOUR';
					extra.code = '001';
					extra.rate = 1.4;
					fee.extra = extra;		
					var desc = new Object;
					desc.eng = 'Test Peak Hour - Mon to Fri - Morning';
					desc.chn = 'Test Peak Hour - Mon to Fri - Morning';
					desc.time_eng = '(AM 08:00 - AM 10:00)';
					desc.time_chn = '(AM 08:00 - AM 10:00)';
					fee.extra.desc = desc ;
			*/	
			//need remove after test			
			//fee.extra  = null;
			
			if(!standard_fee_override_factor[0] && !standard_fee_peak_hour[0]) {
				// fee.extra  = null;  //remove after prod
			}



					
			var estimated = new Object;
			var km = fee.start_up + jData.gapi.km * fee.per_km;
			km = km <= fee.min_charge ? fee.min_charge : km;
			var min = fee.start_up + jData.gapi.minute * fee.per_min;
			min = min <= fee.min_charge ? fee.min_charge : min;
			var price = km >= min ? km : min;
			if (fee.extra) { price = price * fee.extra.rate; }
			//estimated.min = common.round(price * 0.9 <= fee.min_charge ? fee.min_charge : price * 0.9, 2),
			//estimated.max = common.round(price * 0.9 <= fee.min_charge ? price * 1.2 : price * 1.1, 2)
			estimated.min = common.round(price * 0.9 <= fee.min_charge ? fee.min_charge : price * 0.9, 0),
			estimated.max = common.round(price * 0.9 <= fee.min_charge ? price * 1.2 : price * 1.1, 0)

			if (jData.gapi.km == 0) {
			estimated.min = 0;
			estimated.max = 0;
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
			
			/*
			var jData_Insert = {
				api_server_domain: global.api_server_domain,
				mobile_token: jData.token,
				grade_sub_code: jData.grade_sub_code,
				pickup_location_eng: jData.pickup.eng,
				pickup_location_chn: jData.pickup.chn,
				pickup_latitude: jData.pickup.lat,
				pickup_district_id: pickup_district_id,
				pickup_longitude: jData.pickup.lng,
				gapi_km: jData.gapi.km,
				gapi_minute: jData.gapi.minute,
				currency_code: fee.currency_code,
				extra_reason: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.reason : null ),
				extra_code:  ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.code : null ),
				extra_rate: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? extra.rate : null ),
				extra_desc_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.eng : null ),
				extra_desc_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.chn : null ),
				extra_desc_time_eng: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_eng : null ),
				extra_desc_time_chn: ( (standard_fee_override_factor[0] || standard_fee_peak_hour[0]) ? desc.time_chn : null ),
				estimated_min: estimated.min,
				estimated_max: estimated.max,
				arrive_min: arrive_min
				};
			*/

			var jData_Insert = {
				api_server_domain: global.api_server_domain,
				mobile_token: jData.token,
				grade_sub_code: jData.grade_sub_code,
				pickup_location_eng: jData.pickup.eng,
				pickup_location_chn: jData.pickup.chn,
				pickup_latitude: jData.pickup.lat,
				pickup_district_id: pickup_district_id,
				pickup_longitude: jData.pickup.lng,
				gapi_km: jData.gapi.km,
				gapi_minute: jData.gapi.minute,
				currency_code: fee.currency_code,
				extra_reason: ( (extra.reason) ? extra.reason : null ),
				extra_code:  ( (extra.code) ? extra.code : null ),
				extra_rate: ( (extra.rate) ? extra.rate : null ),
				extra_desc_eng: ( (desc.eng) ? desc.eng : null ),
				extra_desc_chn: ( (desc.chn) ? desc.chn : null ),
				extra_desc_time_eng: ( (desc.time_eng) ? desc.time_eng : null ),
				extra_desc_time_chn: ( (desc.time_chn) ? desc.time_chn : null ),
				estimated_min: estimated.min,
				estimated_max: estimated.max,
				arrive_min: arrive_min
				};
						
	
			var dmOMS = new OMS_Cust_Search_Driver_Model();
			var record = dmOMS.Cust_Request_Estimate_Insert(jData_Insert, function(data) {
				//do something
			});
				
			
			var result = {
				arrive_min: arrive_min,
				fee: fee,
				estimated: estimated,
				driver_list: glist
				};
		
		callback(result);
	  }
	);
	
	/************************************************************/
	/***<end> water fall routine*********************************/
	/************************************************************/
	
	
	

	};
	


	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Request_Before_Handler;