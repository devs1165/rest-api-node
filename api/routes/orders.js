const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const  checkAuth = require('../middleware/check-auth');

// get all orders
router.get('/', checkAuth, (req,res,next)=>{
    Order.find().select('quantity product _id')
    // for getting all detail from another collection use populate
    // use field name to get the selcted field
    .populate('product','name')
    .exec()
    .then(docs=>{
        res.status(200).json({
            message:'orders were fetched',
            count:docs.length,
            orders:docs.map(doc => {
                return{
                    _id:doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/' + doc._id
                    }
                }

            }),
        })
    })
    .catch(err =>{
        res.status(500).json({
            message:'error occured',
            error:err
        })
    })
})

// create order
router.post('/', checkAuth, (req,res,next) => {
    // fetch product
    Product.findById(req.body.productId)
    .then(product => {
        // check if product is availiable
        if (!product) {
            return res.status(404).json({
                message:'This is not a valid Product'
            })  
        } 
        // create order
        const order =new Order({
            _id:mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:req.body.productId
        })
        return order.save()
    })
    .then(result => {
        res.status(201).json({
            message:'orders was created',
            order:result,
            request:{
                type:'GET',
                url:'http://localhost:3000/orders/' + result._id
                
            }
        })
    })  
    .catch(err => {
        res.status(500).json({
            message:"product not found",
            error:err
        })
    })
})

router.get('/:orderId', checkAuth, (req,res,next)=>{
    Order.findById(req.params.orderId)
    // donot pass any field to get all details 
    .populate('product')
    .exec()
    .then( order => {
        if(!order){
            res.status(404).json({
                message:'Order not found'
            })
        }
        res.status(200).json({
            order:order,
            request:{
                type:'GET',
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            message:'order not found',
            error:err
        })
    })
})

router.delete('/:orderId', checkAuth, (req,res,next)=>{
    Order.remove({_id:req.params.roderId}).exec()
    .then(result => {
        res.status(200).json({
            message:'Order deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/orders',
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            message:'delete failed',
            error:err
        })
    })
})



module.exports = router;