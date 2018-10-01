const express = require('express');
const app = express();

// middleware
const morgan = require('morgan');

// body-parser middleware
const bodyParser = require('body-parser');
// mongoose 
const mongoose = require('mongoose');

// routers
const orderRoutes = require('./api/routes/orders');
const productRoutes = require('./api/routes/product');
const userRoutes = require('./api/routes/user');


// mongoose connection
mongoose.connect('mongodb://127.0.0.1:27017/node-shop',{ useNewUrlParser: true } )

// http logger
app.use(morgan('dev'));

// middleware for making folder public
app.use('/uploads', express.static('uploads'))
 
// use bodyParser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors access handling
app.use((req, res, next) => {
    // * can be replaced by any http://somthing.com
    res.header('Access-Control-Allow-Origin','*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );  
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')    
        return res.status(200).json({});
    }
    next();
});

// routes which handle requsets
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);


// handling error
app.use((req, res, next) => {
    const error =new Error('Not Found');
    error.status = 404;
    next(error);
})

// error message
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    })
})

module.exports  = app;
