

module.exports = function Cart(oldcart)
{
    this.items =oldcart.items || {};
    this.totalprice=oldcart.totalprice || 0 ;
    this.totalquantity=oldcart.totalquantity || 0 ;
    // this.title=oldcart.title|| null;
    // this.productcode=oldcart.productcode|| 0;
    // this.price=oldcart.title|| null;
    // this.quantity=oldcart.quantity|| null;
    // this.img=oldcart.img|| null;
    this.add = function(item , id){
        var storedItem = this.items[id];
        if(!storedItem)
        {
            storedItem = this.items[id] = {item:item,  qty: 0 , price: 0 , img:null };
        }
            storedItem.qty++;
            storedItem.price = storedItem.item.price * storedItem.qty;
            this.totalquantity++;
            this.totalprice += storedItem.item.price;
            storedItem.img=item.img;
        
        
        
    };
    this.generateArray = function(){
        var arr = [];
        for(var id in this.items)
        {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
