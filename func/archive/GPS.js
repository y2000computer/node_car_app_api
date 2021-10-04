//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2015            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function GPS(){
    
	//no constructor
	
	this.distance = function(lat1, lon1, lat2, lon2, unit) {

	//if(global.debug) console.log ('__filename: '+__filename+' & func: '+'distance');
	
				var radlat1 = Math.PI * lat1/180
				var radlat2 = Math.PI * lat2/180
				var theta = lon1-lon2
				var radtheta = Math.PI * theta/180
				var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
				dist = Math.acos(dist)
				dist = dist * 180/Math.PI
				dist = dist * 60 * 1.1515
				if (unit=="K") { dist = dist * 1.609344 }
				if (unit=="N") { dist = dist * 0.8684 }
				return dist;
	};
	
	
	
	this.get_close_between_two_point = function(driver, end, ratio) {

	/*
	Ratio: 0.01  per 1 KM
	Ratio: 0.001  per 0.1 KM = 100m
	Random range:  (0.1200000)  to  0.1200000

	*/	
		 
		//handle lat
		var lat = null;
		
		if(driver.lat != end.lat) {
			if ( driver.lat > end.lat ) {
					lat = driver.lat - ratio;
					lat = Math.round(lat*100000000)/100000000;
					if ( lat <= end.lat ) lat = end.lat
			} else {
					lat = driver.lat + ratio;
					lat = Math.round(lat*100000000)/100000000;
					if ( lat >= end.lat ) {
						lat = end.lat;
						}
				
			}
		driver.lat = lat;	
		} //if(driver.lat <> end.lat) 
		


		var lng = null;
		
		if(driver.lng != end.lng) {
			if ( driver.lng > end.lng ) {
					lng = driver.lng - ratio;
					lng = Math.round(lng*100000000)/100000000;
					if ( lng <= end.lng ) lng = end.lng
			} else {
					lng = driver.lng + ratio;
					lng = Math.round(lng*100000000)/100000000;
					if ( lng >= end.lng ) {
						lng = end.lng;
						}
				
			}
		driver.lng = lng;	
		} //if(driver.lng <> end.lng) 
	
	
		return driver;
	};
	
	

	this.driver_angle = function(jSSS) {
	
		/*
		https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html

		cos A = (b*b + c*c − a*a) / 2bc
		*/
	
		var CosA = null;
		var side_b = null;
		var side_a = null;
		var side_c = null;
		
		side_b =  this.distance(jSSS.driver_lat, jSSS.driver_long, jSSS.drop_lat, jSSS.drop_long, 'K');
		side_b = Math.round(side_b * 10) / 10;
		//console.log(' side_b Distace (KM) = ' +side_b+'K');

		side_a = this.distance(jSSS.drop_lat, jSSS.drop_long, jSSS.targe_destination_lat,  jSSS.targe_destination_long, 'K');
		side_a = Math.round(side_a * 10) / 10;
		//console.log(' side_a Distace (KM) = ' +side_a+'K');


		side_c = this.distance(jSSS.driver_lat, jSSS.driver_long, jSSS.targe_destination_lat, jSSS.targe_destination_long, 'K');
		side_c = Math.round(side_c * 10) / 10;
		//console.log(' side_c Distace (KM) = ' +side_a+'K');


		var A = ((side_b*side_b) + (side_c*side_c) - (side_a*side_a)) / (2*side_b*side_c);

		var CosA = Math.acos(A) * (180/Math.PI);
		CosA = Math.round(CosA * 1) / 1;

		//console.log('222222-CosA='+CosA);
		
		return CosA;
	};	

	
	///////////////////////////////////////////////////////////////////////////////////////////////
	

	
	
};


module.exports= GPS;