//NPM Library
const moment= require('moment');
const async = require('async');
const winston = require('winston');
const fs = require('fs');


//Self Build Library
var common = require('../lib/common');
const GPS= require('../func/GPS.js');	


//Data Model
const OMS_Cust_Request_WorkFlow_Matching_Model= require('../model/OMS_Cust_Request_WorkFlow_Matching_Model.js');	


function Cust_Request_WorkFlow_Matching_Handler(){
    
	//constructor

	var dmOMS = new OMS_Cust_Request_WorkFlow_Matching_Model();
	var gps = new GPS();
	
	this.driver_matching = function(driver_handshaking_pool, seq, jData, callback){

	
	if(global.debug) console.log ('__filename: '+__filename+' & func: '+'driver_matching');

	var isPickup_Inside_Zone = false;
	var isDrop_Inside_Zone = false;
	var jDriverData = {
		"driver_user_id": null,
		"registration_id": null,
		"gps_latitude": null,
		"gps_longitude": null,
		"driver_to_pickup_distance": null,
	};

	
	//console.log('request_id =' + global.request_queue[seq].request_id + ' running driver_matching');

	//console.log('request_id =' + global.request_queue[seq].request_id + ' >pickup.district.id=' + global.request_queue[seq].pickup.district.id);
	//console.log('request_id =' + global.request_queue[seq].request_id + ' >drop.district.id=' + global.request_queue[seq].drop.district.id);
	
	if(global.request_queue[seq].pickup.district.id == 88 || global.request_queue[seq].pickup.district.id == 89 || global.request_queue[seq].pickup.district.id == 90) {
		isPickup_Inside_Zone = true;
	}
	
	if(global.request_queue[seq].drop.district.id == 88 || global.request_queue[seq].drop.district.id == 89 || global.request_queue[seq].drop.district.id == 90) {
		isDrop_Inside_Zone = true;
	}

	//console.log('request_id =' + global.request_queue[seq].request_id + ' >isPickup_Inside_Zone=' + isPickup_Inside_Zone);
	//console.log('request_id =' + global.request_queue[seq].request_id + ' >isDrop_Inside_Zone=' + isDrop_Inside_Zone);
	
	if(isPickup_Inside_Zone == false){
		//console.log('request_id =' + global.request_queue[seq].request_id + ' >Execute Online_Driver_Select');
		var record = dmOMS.Online_Driver_Select(jData, function(data) {
				for (var i = 0; i < data.length; i++) {
					gps_distance  = gps.distance(global.request_queue[seq].pickup.lat, global.request_queue[seq].pickup.lng, data[i].gps_latitude, data[i].gps_longitude, 'K');
					if(gps_distance<=RW_MAXDRVDISTANCE) {   
						var index = driver_handshaking_pool.indexOf(data.driver_user_id);
						var h = global.request_queue[seq].request.nearly_driver.nearly_driver_history;
							if(  index == -1)  { // driver NOT found in driver_handshaking_pool;

								if(data[i].dest_latitude>0) {  //driver set preference destination
									//DD = Driver GPS to Driver Preference Destination GPS , CD = order destinatin GPS to Driver Preference Destination GPS
									//check distance CD < DD
									var CD_distance  = gps.distance(global.request_queue[seq].drop.lat, global.request_queue[seq].drop.lng, data[i].dest_latitude, data[i].dest_longitude, 'K');
									var DD_distance  = gps.distance(data[i].gps_latitude, data[i].gps_longitude, data[i].dest_latitude, data[i].dest_longitude, 'K');
									var jSSS={
										"driver_lat": data[i].gps_latitude, 
										"driver_long": data[i].gps_longitude,
										"drop_lat": global.request_queue[seq].drop.lat,
										"drop_long": global.request_queue[seq].drop.lng,
										"targe_destination_lat":  data[i].dest_latitude,
										"targe_destination_long":  data[i].dest_longitude
									};
									
									/*
									console.log("driver_lat"+jSSS.driver_lat);
									console.log("driver_long"+jSSS.driver_long);
									console.log("drop_lat"+jSSS.drop_lat);
									console.log("drop_long"+jSSS.drop_long);
									console.log("targe_destination_lat"+jSSS.targe_destination_lat);
									console.log("targe_destination_long"+jSSS.targe_destination_long);
									*/

									if (CD_distance<DD_distance && gps.driver_angle(jSSS)<45) {
										jDriverData = {
											"driver_user_id": data[i].driver_user_id,
											"registration_id": data[i].registration_id,
											"gps_latitude": data[i].gps_latitude,
											"gps_longitude": data[i].gps_longitude,
											"driver_to_pickup_distance": gps_distance
										};
										console.log('CD_distance<DD_distance is true and driver angle <45 - Driver matched - pass back to Matching Handler');
										//console.log(jDriverData);
										callback(jDriverData);
										return;
									} //if (CD_distance<CD_distance) {
								} else {
										jDriverData = {
											"driver_user_id": data[i].driver_user_id,
											"registration_id": data[i].registration_id,
											"gps_latitude": data[i].gps_latitude,
											"gps_longitude": data[i].gps_longitude,
											"driver_to_pickup_distance": gps_distance
										};
										console.log('CD_distance<DD_distance is false - Driver Matched - pass back to Matching Handler');
										//console.log(jDriverData);
										callback(jDriverData);
										return;
								}//if(data[i]dest_latitude>0) {

							} //if(  index == -1)
								
					} //if(gps_distance<=RW_MAXDRVDISTANCE) {   			
					
					//console.log('request_id =' + global.request_queue[seq].request_id + ' >data[i].driver_user_id=' + data[i].driver_user_id);
					//console.log('request_id =' + global.request_queue[seq].request_id + ' >data[i].dest_location_eng=' + data[i].dest_location_eng);
				} //for (var i = 0; i < data.length; i++) {
				console.log('End Loop of Nearly Driver - NO driver matched - pass back to Matching Handler');
				//console.log(jDriverData);
				console.log('*****End Loop of Nearly Driver - NO driver matched - pass back to Matching Handler');
				callback(jDriverData);
				return;
			});
	} //if(isPickup_Inside_Zone == true){


	if(isPickup_Inside_Zone == true){
		console.log('request_id =' + global.request_queue[seq].request_id + ' >Execute Online_Driver_Region_Queue_Select');
		var record = dmOMS.Online_Driver_Region_Queue_Select(jData, function(data) {
				for (var i = 0; i < data.length; i++) {

					gps_distance  = gps.distance(global.request_queue[seq].pickup.lat, global.request_queue[seq].pickup.lng, data[i].gps_latitude, data[i].gps_longitude, 'K');
					var index = driver_handshaking_pool.indexOf(data.driver_user_id);
					var h = global.request_queue[seq].request.nearly_driver.nearly_driver_history;
					if(  index == -1)  { // driver NOT found in driver_handshaking_pool;
						if(global.request_queue[seq].drop.district.id == 88 || global.request_queue[seq].drop.district.id == 89 || global.request_queue[seq].drop.district.id == 90) {
							console.log('Execute if case drop district within airport*');
							jDriverData = {
								"driver_user_id": data[i].driver_user_id,
								"registration_id": data[i].registration_id,
								"gps_latitude": data[i].gps_latitude,
								"gps_longitude": data[i].gps_longitude,
								"driver_to_pickup_distance": gps_distance
							};
							console.log('Driver matched - pass back to Matching Handler');
							//console.log(jDriverData);
							callback(jDriverData);
							return;
						}
						if(global.request_queue[seq].drop.district.id != 88 && global.request_queue[seq].drop.district.id != 89 && global.request_queue[seq].drop.district.id != 90) {
							console.log('Execute drop district outside airport*');
							if(data[i].dest_latitude>0) {  //driver set preference destination
								console.log('Execute if data[i].dest_latitude>0');
								//DD = Driver GPS to Driver Preference Destination GPS , CD = order destinatin GPS to Driver Preference Destination GPS
								//check distance CD < DD
								var CD_distance  = gps.distance(global.request_queue[seq].drop.lat, global.request_queue[seq].drop.lng, data[i].dest_latitude, data[i].dest_longitude, 'K');
								var DD_distance  = gps.distance(data[i].gps_latitude, data[i].gps_longitude, data[i].dest_latitude, data[i].dest_longitude, 'K');
								var jSSS={
									"driver_lat": data[i].gps_latitude, 
									"driver_long": data[i].gps_longitude,
									"drop_lat": global.request_queue[seq].drop.lat,
									"drop_long": global.request_queue[seq].drop.lng,
									"targe_destination_lat":  data[i].dest_latitude,
									"targe_destination_long":  data[i].dest_longitude
								};
								
								/*
								console.log("driver_lat"+jSSS.driver_lat);
								console.log("driver_long"+jSSS.driver_long);
								console.log("drop_lat"+jSSS.drop_lat);
								console.log("drop_long"+jSSS.drop_long);
								console.log("targe_destination_lat"+jSSS.targe_destination_lat);
								console.log("targe_destination_long"+jSSS.targe_destination_long);
								*/
								
								if (CD_distance<DD_distance && gps.driver_angle(jSSS)<45) {
									jDriverData = {
										"driver_user_id": data[i].driver_user_id,
										"registration_id": data[i].registration_id,
										"gps_latitude": data[i].gps_latitude,
										"gps_longitude": data[i].gps_longitude,
										"driver_to_pickup_distance": gps_distance
									};
									console.log('CD_distance<DD_distance is true and driver angle <45 - Driver matched - pass back to Matching Handler');
									//console.log(jDriverData);
									callback(jDriverData);
									return;
								} else {
									console.log('CD_distance<DD_distance is false');
								} //if (CD_distance<CD_distance) {
							} else {
									console.log('if(data[i].dest_latitude>0) is false');
									jDriverData = {
										"driver_user_id": data[i].driver_user_id,
										"registration_id": data[i].registration_id,
										"gps_latitude": data[i].gps_latitude,
										"gps_longitude": data[i].gps_longitude,
										"driver_to_pickup_distance": gps_distance
									};
									console.log('data[i].dest_latitude>0 is false - Driver matched - pass back to Matching Handler');
									//console.log(jDriverData);
									callback(jDriverData);
									return;
						
							} //if(data[i]dest_latitude>0) {
						}  //if(global.request_queue[seq].drop.district.id != 88 && global.request_queue[seq].drop.district.id != 89 && global.request_queue[seq].drop.district.id != 90) {
					
					} // if(  index == -1)  { // driver NOT found in driver_handshaking_pool;
					//console.log('request_id =' + global.request_queue[seq].request_id + ' >data[i].driver_user_id=' + data[i].driver_user_id);
					//console.log('request_id =' + global.request_queue[seq].request_id + ' >data[i].dest_location_eng=' + data[i].dest_location_eng);
				} //for (var i = 0; i < data.length; i++) {
				//console.log('End Loop of Driver Region Queue - NO driver matched - pass back to Matching Handler');
				callback(jDriverData);
				return;
			});
	} //if(isPickup_Inside_Zone == true){

	//return;

	};
	


	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= Cust_Request_WorkFlow_Matching_Handler;