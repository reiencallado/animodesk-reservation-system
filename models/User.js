const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    name: { type: String, default: 'Anonymous' },
    studentId: { type: String, unique: true },
    profilePic: String,
    description: String
});

module.exports = mongoose.model("User", UserSchema);
