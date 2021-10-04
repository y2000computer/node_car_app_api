//Create Date: 24 Mar, 2017
//Last Update: 24 Mar, 2018

global.appConfig={
	db_order_management: {
		host: 'uat-oms-vm-os.hkber.com.hk',
		port: 3307,
		database: 'db_order_management_uat',
		user: 'user_uat',
		password: 'www.291073Ma!'
	},
	db_middle_slave_tier: {
		host: 'uat-oms-vm-os.hkber.com.hk',
		port: 3307,
		database: 'db_middle_slave_tier_uat',
		user: 'user_uat',
		password: 'www.291073Ma!'
	}
};


global.api_server_domain = 'uat-middle-hk-core-os.hkber.com.hk';
global.middle_slave_api_server_domain = 'uat-middle-hk-core-os.hkber.com.hk';


//lite-node-cache : Table cache 
global.lifetime_msec = 30000 ;  //milliseconds, 30 sec
global.reload_msec = 10000 ;  //milliseconds, 10 sec
global.garbageCollectorTimeInterval_mesc = 30000 ;  //milliseconds, 30 sec


//Request Worflow Runtime cache engine
global.RW_START_INTERVAL = 100		//Unit: msec 
global.RW_RMDT = 600	 			//Request match driver timeout Unit: second (Different to PROD)
global.RW_DGPICKLT = 3*60*60 		//Driver goto pickup location timeout Unit: second
global.RW_DGDROPLT = 6*60*60		//Driver goto drop location timeout Unit: second
global.RW_DGDROP_GPS_LOST_TO = 2*60	//Driver goto drop location GPS lost tolerance Unit: second (Different to PROD)
global.RW_DACKOT = 60 				//Driver acknowlege order timeout Unit: second (Different to PROD)
global.RW_MAXDRVDISTANCE = 3      	//Max driver distance to pickup location Unit: KM
global.RW_MAXDRVDISTANCE_SURCHARGE_AREA = 10      	//Max driver distance to pickup location (Surcharge Area) Unit: KM
global.RW_CLEARQUEUE = 3*60*60*24	// Max clearing working queue interval Unit: Sec, 
									// waiting 3 day for cust assess driver, if clear up, no need assessment
global.RW_MAX_CACHE = 100000 		//Max no. of request on cache queue


global.image_root_folder =  '/var/www/document/';
global.banner_eng_url =  'http://www.hkber.com.hk/banner/banner.php?language=eng';
global.banner_chn_url =  'http://www.hkber.com.hk/banner/banner.php?language=chn';


global.SeaOrderConfig={
	customer_delay_in_second: {
		internal_reserved_delay: 1,
		normal_reserved_delay: 0,
		observation_reserved_delay: 30,
		under_mark_reserved_delay: 120
	},
	driver_delay_in_seond: {
		order_priority_1: 0,
		order_priority_2: 5,
		order_priority_3: 10,
		order_priority_4: 30
	}
};


global.ResvOrderConfig={
	immediate_order: {
		schedule_start_after_minute: 0,
		schedule_within_minute: 1440
	},
	reserved_order: {
		schedule_start_after_minute: 30,
		schedule_within_minute: 1440
	},
	share_order: {
		schedule_start_after_minute: 60,
		schedule_within_minute: 1440,
		time_to_wait_join_minute: 20,
		denied_join_in_before_start_route_minute:30,
		customer_matching_criteria: {
			route_schedule_gap_minute:30,
			pickup_distance_gap_metre: 500,
			destination_distance_gap_metre:1000
		}
	},
	freedom_order: {
		schedule_start_after_minute: 60,
		schedule_within_minute: 1440,
		denied_join_in_before_start_route_minute:30,
		customer_matching_criteria: {
			route_schedule_gap_minute:30,
			pickup_distance_gap_metre: 500,
			destination_distance_gap_metre:1000
		}	
	}
};