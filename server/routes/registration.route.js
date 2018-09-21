const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

//Models
const UserModel = require('../models/user.model');

//multer setup
let filenameFromStorage; // for deliting img if any validation errors
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    // cb( error , path)
    cb(null, "./server/uploads/")
  },
  filename: function(req,file,cb){
    const name = new Date().toISOString() + "_" + file.originalname ;
    const properName = name.replace(/:/g,'-');
    filenameFromStorage = properName;
    cb(null, properName)
  }
});
const fileFilter = function(req,file,cb){
  // cb(null , true) - will store file
  // cb(null , false) - will ignore file
  // cb(new Error("message"), false) - will throw err
  if( file.mimetype === "image/x-icon" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ){
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// routes
router.post("/" , upload.any() , registrationPOST);

function registrationPOST(req,resp,next){
  console.log("fromPOST");
  console.log(req.body);
  UserModel.find({name: req.body.name} , (err,data)=>{
    if(err){console.error(err);}
    if(data.length){
      resp.send({
        respText: "WE GOT SOME ERRORS",
        errors: [{
          param: "userAllreadyExist",
          msg: "User with such name is allready exists"
        }]
      })
    } else {
      startValidation();
    }
  });

  function startValidation(){
    const checkRules = {
      name: {
        regExp: /^[\w\s]{4,12}$/,
        failMessage: "User name must be at least 4 characters long!"
      },
      email: {
        regExp: /^\w{1,}(\.\w{1,}){0,}@\w{1,}(\.\w{1,}){1,}/,
        failMessage: "Invalid E-mail adress"
      },
      password: {
        regExp: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
        failMessage: "Password must have at least one number and at least one special character"
      },
      confirmEmail: {
        failMessage: "Confirmation failed! E-mails dont match!"
      },
      confirmPassword: {
        failMessage: "Confirmation failed! Passwords dont match!"
      },
      avatar: {
        failMessage: "Please set the profile image!"
      }
    }
    let validationErrors = null;
    // validation
    req.checkBody("name", checkRules.name.failMessage)
      .matchRegExps(checkRules.name.regExp)
    req.checkBody("email", checkRules.email.failMessage)
      .matchRegExps(checkRules.email.regExp)
    req.checkBody("password", checkRules.password.failMessage)
      .matchRegExps(checkRules.password.regExp)
    req.checkBody("confirmEmail", checkRules.confirmEmail.failMessage)
      .equals(req.body.email);
    req.checkBody("confirmPassword", checkRules.confirmPassword.failMessage)
      .equals(req.body.password);
    req.checkBody("avatar", checkRules.avatar.failMessage)
      .isLength({min:1, max: undefined})
    // results
    req.getValidationResult().then(() => {
      validationErrors = req.validationErrors();
        //additional validation error message for mimetype
        if(req.files.length === 0){
          validationErrors.push({
            param: 'avatarType',
            msg: 'Inappropriate file type',
          })
        }
        if(validationErrors){
          fs.unlink(`./server/uploads/${filenameFromStorage}` , (err)=>{
            if(err){ console.log(err) }
          })
          resp.send({
            respText: "WE GOT SOME ERRORS",
            errors: validationErrors
          })
        } else {
          saveNewUser()
        }
      })
  }
  //
  function saveNewUser(){
    const newUser = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar: req.files[0].path
    });
    newUser.save()
      .then(result=>{
        resp.send(newUser)
      })
      .catch(err =>{
        console.error(err);
      })
  }
}

module.exports = router;
