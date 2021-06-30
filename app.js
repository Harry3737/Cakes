var express = require("express");
var app = express();
var ejs = require("ejs");
var methodoverride = require("method-override");
var bodyparser = require("body-parser");
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var user = require('./models/user');
var item = require('./models/item');
var Cart = require('./models/cart');
var Order = require('./models/order');
var passport = require("passport");
var LocalStrategy  = require("passport-local");
var pdf = require("html-pdf");
var PDFDocument = require('pdfkit');
var doc = new PDFDocument;
var session = require("express-session");
var passportLocalMongoose  =require("passport-local-mongoose");
var MongoStore = require("connect-mongo");
var nodemailer = require("nodemailer");
require('dotenv/config');


// Database Connectiom
var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/bakerydb", { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify:false });
mongoose.connect("mongodb+srv://haider:hsk123@bakerydb.i4czc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" , { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify:false });
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(methodoverride("_method"));

app.set('view engine', 'ejs');

var multer = require('multer'); 
const order = require("./models/order");
var storage = multer.diskStorage({
    destination: "public/assets/images/products/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});



var upload = multer({ storage: storage });
//=======Passport Intilaize =====
app.use(session({
    secret: "Harry is the Best Boy",
    resave : false,
    saveUninitialized: false,
    store:  new MongoStore ({ mongoUrl: 'mongodb+srv://haider:hsk123@bakerydb.i4czc.mongodb.net/Sesssion?retryWrites=true&w=majority'}),
    cookie:{maxAge: 15*60*1000}
}));


passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res , next)
{
    res.locals.session = req.session;
    res.locals.CurrentUser = req.user;
    next();
})

// upload tempalte on server 

// admin routes
app.get("/admin", function(req,res)
{
    Order.find({}, function(err , orderfind)
   {
       if(err)
       {
           
           console.log(err);
       }
       else
       {
          
        res.render('admin/index' , { orders : orderfind}) ;
       
       }
   })
});
app.get("/admin/order/:id", function(req,res)
{
    Order.findById(req.params.id, function(err , findorder)
    {
        if(err)
        {
            
            // console.log(findorder);
            console.log(err);
        }
        else
        {
        
            res.render('admin/order' , { orders : findorder}) ;
             
        }
    }) 
});
app.get("/admin/products", function(req,res)
{
    item.find({} , function(err, finditems) 
    {
       if(err)
       {
           console.log("error");
       } 
       else
       {
        res.render("admin/product-list" , {product: finditems});
       }
    });
   
});

app.post("/admin/products", upload.single('image'), function (req,res , next) 
{
    var items = {
        title         : req.body.title,
        price         : req.body.price,
        productcode   : req.body.productcode,
        totalproducts : req.body.totalproducts,
        description   : req.body.description,
        img           : req.file.filename,
        category      : req.body.category
    };
  item.create( items , function (err , createitem) 
  {
   if(err)
  {
      res.render('admin/addproduct')
       
   }   
   else
   {
    //    console.log( createitem);
    res.redirect('/admin/products');
   }
   });
});

app.get("/admin/products/new", function(req,res)
{
    res.render("admin/addproduct");
});
app.get("/admin/category", function(req,res)
{
    res.render("admin/category");
});
//edit route
app.get("/admin/products/:id/edit" , function(req,res)
{   
    
    item.findById(req.params.id , function(err, editproduct)
    {
        if(err)
        {
            res.redirect('/index');
        }
        else
        {
            res.render("admin/edit" , {editproducts:editproduct});
        }
    });
  
});
app.put("/admin/products/:id" , upload.single('image'), function(req ,res)
{   
    var items = {
        title         : req.body.title,
        price         : req.body.price,
        productcode   : req.body.productcode,
        totalproducts : req.body.totalproducts,
        description   : req.body.description,
        img           : req.file.filename
    };
    item.findByIdAndUpdate(req.params.id , items , function(err,editproduct)
    {
        if(err)
        {
            res.redirect('/admin/products/:id/edit');
        }
        else
        {
            // res.redirect('/admin/products');
            if(editproduct.img === req.file.filename)
            {
                console.log("same");
            }
            else
            pathToFile = "public/assets/images/products/" + editproduct.img;
            fs.unlink(pathToFile, function(err, updateProduct) {
            if (err) 
            {
                console.log(err);
                throw (err);
            } 
            else 
            {
                res.redirect('/admin/products');
                console.log("Successfully Updated the file.")
            }
            });
        }
    });
    
});

app.delete("/admin/products/:id", function(req ,res)
{
    
   item.findByIdAndRemove(req.params.id , function(err , deleteitem)
   {
        if(err)
        {
            res.redirect('/admin/products');
        }
        else
        {
            res.redirect('/admin/products');
            pathToFile = "public/assets/images/products/" + deleteitem.img
            fs.unlink(pathToFile, function(err ) {
            if (err) 
            {
                throw err
            } 
            else 
            {
                console.log("Successfully deleted the file.")
            }
            });
        }

   });
}); 
app.get('/admin/aboutus', function(req,res)
{
    res.render('admin/about-panel');
});
app.get('/admin/login', function(req,res)
{
    res.render('admin/login');
});
app.get('/admin/usercreate', function(req,res)
{
    res.render('admin/create-user');
});
app.get('/admin/userlist', function(req,res)
{
    res.render('admin/user-list');
});
//user routes
app.get("/", function(req,res)
{
    // console.log(req.session);
    res.render("user/vegetables");
    
});
//==Login Signup Routes========
//Sign Up
app.get('/register' , function(req,res){
    res.render('user/register');
});
app.post('/register' , function(req,res){
    user.register(new user({username: req.body.username ,email : req.body.email , address : req.body.address ,phoneno : req.body.phoneno } ), req.body.password , function(err, User){
        // console.log(User);
        if(err){
            console.log(err);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect('/');
        });
    });
});
//==Login Routes ===
app.get('/login' , function(req ,res){
    res.render("user/login");
});
//login logic route
//middleware 
app.post('/login' , passport.authenticate("local", 
{
    successRedirect :'/',
    failureRedirect :'/login'
}) ,function(req ,res){
    
});
//logout routes
app.get("/logout" , function(req ,res){
    req.logOut();
    res.redirect('/');
});
//functions
function isLoggedIn(req ,res , next){
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}
//===cart route====
app.get("/cart", isLoggedIn , function(req,res)
{
   if(! req.session.cart)
   {
       return res.render("user/cart" ,{products: null});
   }
   var cart = new Cart(req.session.cart);
   res.render('user/cart' , {products: cart.generateArray() ,totalprice: cart.totalprice })
});
app.post("/cart/:id"  ,  isLoggedIn, function (req , res) 
{

    var productId  = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    item.findById(productId , function(err, product){
        if(err)
        {
            return res.redirect('/products');
        }
        cart.add(product , product.id);
        req.session.cart = cart;
        // console.log(req.session.cart);
        res.redirect('/products');
    })
})
// products page frontend
app.get("/products", function(req,res)
{
    item.find({} , function(err, finditems) 
    {
       if(err)
       {
           console.log("error");
       } 
       else
       {
        res.render("user/products-page" , {showProducts: finditems});
       }
    });
    
});
app.get("/products/:Category", function(req,res)
{
    // console.log(req.params.Category);
    item.find({category: req.params.Category} , function(err, findallitems) 
    {
       if(err)
       {
           console.log("error");
       } 
       else
       {
        res.render("user/products-page" , {showProducts: findallitems});
       }
    });
    
});
//productdescription page
app.get("/products/:id", function(req,res)
{
    item.findById(req.params.id, function(err,foundproduct)
    {
        if(err)
        {
            res.redirect("/products");
        }
        else
        {
            res.render("user/productdescription", {foundproduct:foundproduct});
        }
    });
      
});

app.get("/checkout", isLoggedIn , function(req,res)
{
    if(! req.session.cart)
   {
       return res.render("user/cart");
   }
   var cart = new Cart(req.session.cart);
   user.findById(req.user._id , function(err , finduser)
   {
       if(err)
       {
           console.log(err);
       }
       else
       {
          
        res.render('user/checkout' , {products: cart.generateArray() ,totalprice: cart.totalprice , user:finduser}) 
       }
   })
 
});
app.get("/ordersuccess", function(req,res)
{
    var arr = [];
        for(var ids in req.session.cart.items)
        {
            arr.push(req.session.cart.items[ids]);
        }
    var order = new Order({
        user : {
        username: req.user.username,
        email: req.user.email,
        address : req.user.address,
        phoneno: req.user.phoneno
        },
        cart :
        {
            Products: arr,
            totalquantity: req.session.cart.totalquantity,
            totalprice: req.session.cart.totalprice
        }
    });
    order.save(function(err , saveorder)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            var cart= new Cart(req.session.cart);
            // console.log(req.session.cart);
            res.render("user/order-success",{products: cart.generateArray() ,totalprice: cart.totalprice , user:req.user});
            
            // saveorder.cart.Products.forEach(function(order){
            //         console.log(order);
            // });
            //email setup
            var source =  "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<style>" +
            "#customers {" +
              "font-family: Arial, Helvetica, sans-serif;" +
              "border-collapse: collapse;" +
              "width: 100%;" +
            "}" +
            "#customers td, #customers th {" +
              "border: 1px solid #ddd;" +
              "padding: 8px;" +
            "}" +
            "#customers tr:nth-child(even){background-color: #f2f2f2;}" +                    
            "#customers tr:hover {background-color: #ddd;}" +                    
            "#customers th {" +
              "padding-top: 12px;" +
              "padding-bottom: 12px;" +
              "text-align: left;" +
              "background-color: #04AA6D;" +
              "color: white;" +
            "}" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<p>Hi, " + req.user.username + "</p>" + 
            "<p>Just to let you know — we've received your order # 60dc8ff92367262b40687cfb , and it is now being processed:</p>" +
            "<p>Pay with cash upon delivery. The Products will be delivered withing 2-4 business days after confirmation call!</p>" +
            "<table id='customers'>" +
              "<tr>" +
                "<th>Product Name</th>" +
                "<th>Price</th>" +
                "<th>Quantity</th>" +
              "</tr>";

             saveorder.cart.Products.forEach(function(Item){
                source += "<tr>" +
                            "<td>" + Item['title'] + "</td>" +
                            "<td>" + Item['price'] + "</td>" +
                            "<td>" + Item['quantity'] + "</td>" +
                          "</tr>" 
              })

                    source += "</table>" +
                    "<h2>Total Price: " + saveorder.totalprice + "</h2>"            
                    "</body>" +
                    "</html>";
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                service: 'gmail',
                auth: {
                  user: 'haidermannan.cs@gmail.com',
                  pass: 'hsk@4948'
                },
              });
              var mailOptions = {
                from: 'haidermannan.cs@gmail.com',
                to: 'sayyedahmed457@gmail.com',
                subject: 'Sending Email using Node.js',
                text: 'That was easy!',
                html: source
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        }


    }); 
});
app.get("/contact", function(req,res)
{
    res.render("user/contact");
});
app.get("/forget", function(req,res)
{
    res.render("user/forget");
});
app.get("/Order", function(req,res)
{
    res.render("user/order");
});
app.get("/About", function(req,res)
{
    res.render("user/about");
});
app.get("/faq",function(req,res)
{
res.render("user/faq");
});


app.listen(process.env.PORT || 3000, function()
{
console.log(" Bakery Server is in Runing State ");
});