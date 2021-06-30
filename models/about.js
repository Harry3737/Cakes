var mongoose = require("mongoose");
var aboutSchema = new mongoose.Schema({
    maintitle: String,
    mainimg:String,
    maindes:String,
    ceo1img:String,
    ceo1des:String,
    ceo1name: String,
    ceo2img: String,
    ceo2name: String,
    ceo2des:String


    
});
module.exports=mongoose.model('about',aboutSchema);