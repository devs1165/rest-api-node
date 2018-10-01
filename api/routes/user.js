const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup',(req,res,next) => {
    User.find({email:req.body.email}).exec()
    .then(user=>{
        if(user.length >= 1){
            return res.status(409).json({
                message:'Mail already exist'
            })
        }
        else{
            bcrypt.hash(req.body.password, 10, (err,hash) => {
                if(err){
                    return res.status(500).json({
                        error:err               
                    })
                }
                else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                    user.save()
                    .then(result=>{
                        res.status(201).json({
                            message:'User created',
                            result: result
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            error:err
                        })
                    });
                }
            });

        }
    })
})

// login api
router.post('/login',(req,res,next) => {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message:'auth failed'
            })
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(err){
                return res.status(401).json({
                    message:'auth failed'
                })
            }
            if(result){
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0]._id
                    }, 
                        'secret', 
                    { 
                        expiresIn: '1h'
                    }
                );
                return res.status(200).json({
                    message:'auth successful',
                    token:token
                })
            }
            res.status(401).json({
                message:'auth failed'
            })
        })
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
})


router.delete('/:userId', (req,res, next)=>{
    User.remove({_id:req.params.userId})
    .exec()
    .then(result => {
        res.status(201).json({
            message:'user deleted'
        })
    })
    .catch(err => {
        res.status(500).json({
            error:err 
        })
    })
})
module.exports = router;
