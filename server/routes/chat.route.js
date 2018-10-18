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
  console.log("Params were send:" , req.query);
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
      const cutTo = totalRecords - offset;
      data.length = cutTo;
      console.log("Total in DB: ", totalRecords, " Total minus offset: ", data.length);
      const willBeSent = data.slice(-limit).reverse();

      if(limit + offset > totalRecords){
        // // добавить сообщение в ответ
        console.log("Will be sent last", willBeSent.length);
        console.log("All records retrieved");
        const data = {
          fetched: true,
          lastRecords: willBeSent
        }
        resp.send(data);
      } else {
        console.log("Will be sent", willBeSent.length);
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
  console.log("Params were send:" , req.query);
  if(!req.query.offset){
    const limit = JSON.parse(req.query.limit);
    const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
    currentUserChatHistModel.find( {} , (err,data)=>{
      if(err){console.error(err);}
      const filteredData = data.filter(record=>{
        return record.text.toLowerCase().indexOf(req.params.query.toLowerCase()) >= 0;
      })
      console.log("Total query results: " , filteredData.length);
      const latestData = filteredData.slice(-limit);
      resp.send(latestData);
    });
  }
  else {
    const offset = JSON.parse(req.query.offset);
    const limit = JSON.parse(req.query.limit);
    const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
    currentUserChatHistModel.find( {} , (err,data)=>{
      if(err){console.error(err);}
      const filteredData = data.filter(record=>{
        return record.text.toLowerCase().indexOf(req.params.query.toLowerCase()) >= 0;
      })
      const totalRecords = filteredData.length;
      const cutTo = filteredData.length - offset;
      filteredData.length = cutTo;
      console.log("Total query results: ", totalRecords, " Total minus offset: ", filteredData.length);
      const willBeSent = filteredData.slice(-limit).reverse();

      if(limit + offset > totalRecords){
        console.log("Will be sent last", willBeSent.length);
        console.log("All records retrieved");
        const data = {
          fetched: true,
          lastRecords: willBeSent
        }
        resp.send(data);
      } else {
        console.log("Will be sent", willBeSent.length);
        resp.send(willBeSent);
      }
    });
  }


  // const currentUserChatHistModel = mongoose.model(`msg_hist_${req.params.id}`, messageSchema);
  // currentUserChatHistModel.find( {} , (err,data)=>{
  //   if(err){console.error(err);}
  //   const filteredData = data.filter(record=>{
  //     return record.text.toLowerCase().indexOf(req.params.query.toLowerCase()) >= 0;
  //   })
  //   console.log(filteredData.length);
  //   resp.send(filteredData)
  // })
}

module.exports = router;
