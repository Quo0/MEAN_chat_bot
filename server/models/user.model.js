const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: [true, "The avatar image is required!"]
  }
} , {collection: "Users"})

module.exports = mongoose.model("User", userSchema);
