const express = require('express');
const fs = require('fs');

const router = express.Router();
const OMS_Api_Traffic_Model= require('../model/OMS_Api_Traffic_Model.js');	

	
router.route('/')
    .get(function (req, res) {
		if(global.debug) console.log ('__filename: ' + __filename + ' & ' + 'req.originalUrl: ' + req.originalUrl);
		if(global.log_traffic) var dmCore = new OMS_Api_Traffic_Model().writeLog(req, 'not_require_mobile_token', function() {});		

		var photo_full_path = global.image_root_folder + req.query.picture; 
		fs.readFile(photo_full_path, function(err, data) {
		  //if (err) throw err; // Fail if the file can't be read.
		  if (err) {
			res.end('Error of photo_full_path');
			return;
		  }
			res.writeHead(200, {'Content-Type': 'image/jpeg'});
			res.end(data); // Send the file data to the browser.
		});
		
		
    });
	
	
	
	
module.exports = router;



