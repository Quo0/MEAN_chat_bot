const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Models
const UserModel = require('../models/user.model');

// routes
router.post("/", loginPOST);

function loginPOST(req,resp,next){
  UserModel.findOne({ name: req.body.name } , (err, data)=>{
    if(err){
      console.log(err)
      resp.send({
        serverError: err
      })
    }
    if(data === null){
      resp.send({
        accessError: "No such username!",
        success: false
      })
    } else {
      if(data.password !== req.body.password){
        resp.send({
          accessError: "Invalid password",
          success: false
        })
      } else {
        resp.send({
          currentUserData: data,
          success: false
        })
      }
    }
  })
}

module.exports = router;
