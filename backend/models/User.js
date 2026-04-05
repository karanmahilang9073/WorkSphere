import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true,},
    email: {type: String, required: true, unique: true, lowercase: true, match : [/^\S+@\S+\.\S+$/, 'please enter a valid email']},
    password: {type: String, required: true, select : false},
    role: {type: String, enum: ["Hr", "Admin", "Employee"], default: "Employee",},
    department: {type: String, default: "General",},
    position: {type: String, trim : true},
},{timestamps: true,});

userSchema.index({email : 1})

const User = mongoose.model("User", userSchema);
export default User;
