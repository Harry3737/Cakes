var mongoose = require("mongoose");
var itemSchema = new mongoose.Schema({
    title: String,
    price:Number,
    productcode:String,
    totalproducts:Number,
    description:String,
    img: String,
    category: String
});
module.exports=mongoose.model('item',itemSchema);