var mongoose = require("mongoose");
var orderSchema = new mongoose.Schema({
    user:
        {
            username: String,
            email: String,
            address : String,
            phoneno: Number
        },
    cart:
    {
        Products:[],
        totalquantity:Number,
        totalprice:Number
    }
});

module.exports = mongoose.model('Order' , orderSchema)