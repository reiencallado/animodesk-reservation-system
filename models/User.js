const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    name: String,
    profilePic: String,
    description: String
});

module.exports = mongoose.model("User", UserSchema);