const express = require('express');
const router = express.Router();

router.get("/", (req,resp,next)=>{
  resp.render("index.ejs");
});

module.exports = router;
