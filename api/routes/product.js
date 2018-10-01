const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer =  require('multer');
const checkAuth = require('../middleware/check-auth');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename :function (req, file, cb) {
        cb(null,new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }

}
const upload = multer({storage : storage,limits:{
    fileSize:1024 * 1024 * 5
}})

const Product = require('../models/product');




// all product
router.get('/' ,(req,res,next)=>{
    Product.find().select('name price _id productImage').exec().then(docs => {
        const response = {
            count:docs.length,
            product:docs.map(doc => {
                return{
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    productImage : doc.productImage, 
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    .catch(err => {
        res.status(500).json({
            error:err
        })
    })
})

// create product or add new product to db 
router.post('/', checkAuth, upload.single('productImage') ,(req,res,next) => {
    // format product
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })

    // save product
    product.save().then(result =>{
        res.status(201).json({
            message:'Product created succesfully',
            createdProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                productImage:result.productImage,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/'+result._id
                }
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        });
    });
})

// get product byId
router.get('/:productId', checkAuth, (req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id).select('name price _id productImage').exec()
    .then( doc => {
        if(doc){
            res.status(200).json({
                product:doc,
                request:{
                    type:'GET',
                    description:'Get all products',
                    url:'http://localhost:3000/products'
                }
            });
        }
        else{
            res.status(404).json({
                message:'no valid entry found'
            })
        }
        console.log(doc)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        });
    });
})
// update
router.patch('/:productId', checkAuth, (req,res,next)=>{
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Product.update({_id:id},{$set:updateOps}).exec()
    .then(result => {
        res.status(200).json({
            message:'product updated',
            request:{
                type:'GET',
                url:'http://localhost:3000/products/'+ id
            }
        });
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    });
})

// delete product byId
router.delete('/:productId', checkAuth,(req,res,next)=>{
    const id= req.params.productId;

    Product.remove({
        _id : id
    }).exec().then(result => {
        res.status(200).json({
            message:'Product deleted',
        })
    })
    .catch(err => {
        res.status(500).json({
            error : err
        })
    })     
})



module.exports = router;