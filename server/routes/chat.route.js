const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Models and Schemas
const UserModel = require('../models/user.model');
const messageSchema = require('../models/message.schema');

// routes
router.post("/:id", chatPOST);
router.get("/:id", chatGET);
router.get("/:id/:query", chatSearchGET)

// func bodies

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
