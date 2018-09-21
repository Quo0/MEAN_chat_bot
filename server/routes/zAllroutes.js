const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

//Models and Schemas
const UserModel = require('../models/user');
const messageSchema = require('../models/message');

//multer setup
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    // cb( error , path)
    cb(null, "./server/uploads/")
  },
  filename: function(req,file,cb){
    const name = new Date().toISOString() + "_" + file.originalname ;
    cb(null, name.replace(/:/g,'-'))
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
router.get("/", (req,resp,next)=>{
  resp.render("index.ejs");
});
router.post("/registration" , upload.any() , registrationPOST);
router.post("/login", loginPOST);
router.post("/chat/:id", chatPOST);
router.get("/chat/:id", chatGET);
router.get("/chat/:id/:query", chatSearchGET)

// func bodies

function registrationPOST(req,resp,next){
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
        resp.send({
          respText: "WE GOT SOME ERRORS",
          errors: validationErrors
        })
      } else {
        saveNewUser()
      }
    })
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

function chatPOST(req,resp,next){
  const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}` , messageSchema);
  const newMessage = new currentUserChatHistModel({
    _id: new mongoose.Types.ObjectId(),
    userId: req.params.id,
    whoSent: req.body.whoSent,
    text: JSON.stringify(req.body.message),
    date: req.body.date,
    avatar: req.body.avatar
  });
  newMessage.save()
    .then(result=>{
      resp.send(newMessage)
    })
    .catch(err=>{
      console.error(err);
    })
}

function chatGET(req,resp,next){
  console.log(req.query);
  if(!req.query.offset){
    const limit = JSON.parse(req.query.limit);
    const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
    currentUserChatHistModel.find( {} , (err, data)=>{
     if(err){console.error(err)}
     const latestData = data.slice(-limit);
     resp.send(latestData)
   });
  }
  if(req.query.offset){
    const offset = JSON.parse(req.query.offset);
    const limit = JSON.parse(req.query.limit);
    const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
    currentUserChatHistModel.find( {} ,(err, data)=>{
      const totalRecords = data.length;
      if(err){console.error(err)}
      console.log("Total in DB", data.length);
      const cutTo = data.length - offset;
      data.length = cutTo;
      console.log("after cut the offset", data.length);
      const willBeSent = data.slice(-limit);
      console.log("will be sent", willBeSent.length);
      if(limit + offset > totalRecords){
        // // добавить сообщение в ответ
        console.log("DONT NEED TO SEND AGAIN");
        const data = {
          fetched: true,
          lastRecords: willBeSent
        }
        resp.send(data);
      } else {
        resp.send(willBeSent);
      }
    })
  }
  // const offset = JSON.parse(req.query.offset);
  // const limit = JSON.parse(req.query.limit);
  // console.log(offset, limit);
  // const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
  // currentUserChatHistModel.find( {} )
  //   .select("-__v -userId")
  //   .skip(offset)
  //   .limit(limit)
  //   .exec(function(err, data) {
  //   // console.log(data);
  //     if(err){console.error(err)}
  //     resp.send(data)
  // });
}

function chatSearchGET(req,resp,next){
  console.log(req.params);
  const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
  currentUserChatHistModel.find( {} , (err,data)=>{
    if(err){console.error(err);}
    const filteredData = data.filter(record=>{
      return record.text.toLowerCase().indexOf(req.params.query.toLowerCase()) >= 0;
    })
    console.log(filteredData.length);
    resp.send(filteredData)
  })
}

module.exports = router;
