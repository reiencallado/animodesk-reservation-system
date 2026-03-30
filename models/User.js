const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    name: { type: String, default: 'Anonymous' },
    studentId: { type: String, unique: true },
    profilePic: String,
    description: String
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
       
    } catch (error) {
        throw error
    }
});

module.exports = mongoose.model("User", UserSchema);
