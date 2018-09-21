const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
//
const app = express();
const PORT = process.env.PORT || 4000;
// import routes
const landingRoute = require("./routes/landing.route");
const registrationRoute = require("./routes/registration.route");
const loginRoute = require("./routes/login.route");
const chatRoute = require("./routes/chat.route");
//
const validatorOptions = {
	customValidators: {
		matchRegExps: (inputParam , regExp) => {
			// console.log("inputParam" , inputParam)
			// console.log("regExp" , regExp)
			if(inputParam){
				return inputParam.match(regExp)
			} else { return false }
		}
	}
}
// database
const mongoUrl = `mongodb://localhost:27017/chat`
const mongoOptions = {
	 useNewUrlParser: true
}
mongoose.connect(mongoUrl, mongoOptions)
	.then(()=>{
      console.log("mongodb [chat] is connected")
  })
  .catch(err=>{
      console.error('db connection error:', err);
  });
//
app.use(express.static(path.join(__dirname, "/../")));
app.use(bodyParser.json());
app.use(expressValidator(validatorOptions));
//view settings
app.set("views", path.join(__dirname,"/views"))
app.set("view engine", "ejs");
// bind routs
app.use("/", landingRoute);
app.use("/registration", registrationRoute)
app.use("/login", loginRoute)
app.use("/chat", chatRoute)
//
app.listen(PORT, ()=>{
  console.log(`Server now running on port ${PORT}`)
})
