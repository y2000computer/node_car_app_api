const OMS_Standard_Fee_Master_Model_Cache= require('./OMS_Standard_Fee_Master_Model_Cache.js');	
//const OMS_Standard_Fee_Override_Factor_Model_Cache= require('./OMS_Standard_Fee_Override_Factor_Model_Cache.js');	
const OMS_Standard_Fee_Peak_Hour_Master_Model_Cache= require('./OMS_Standard_Fee_Peak_Hour_Master_Model_Cache.js');	
const OMS_Global_Public_Holiday_Model_Cache= require('./OMS_Global_Public_Holiday_Model_Cache.js');	
const OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache= require('./OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache.js');	



function OMS_Standard_Model_Cache(sql){
    
	//constructor
	this.OMS_Standard_Fee_Master_Model_Cache = new OMS_Standard_Fee_Master_Model_Cache();
	//this.OMS_Standard_Fee_Override_Factor_Model_Cache = new OMS_Standard_Fee_Override_Factor_Model_Cache();
	this.OMS_Standard_Fee_Peak_Hour_Master_Model_Cache = new OMS_Standard_Fee_Peak_Hour_Master_Model_Cache();
	this.OMS_Global_Public_Holiday_Model_Cache = new OMS_Global_Public_Holiday_Model_Cache();
	this.OMS_Global_Public_Holiday_Model_Cache = new OMS_Global_Public_Holiday_Model_Cache();
	this.OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache = new OMS_Resv_Order_Service_Type_Discount_Master_Model_Cache();
	
	
};


module.exports= OMS_Standard_Model_Cache;