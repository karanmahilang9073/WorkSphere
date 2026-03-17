import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient : {type : mongoose.Types.ObjectId, ref : "User", required : true},
    type : {type : String, enum : ['leave', 'task', 'salary']},
    title : {type : String, required : true},
    message : {type : String, required : true},
    isRead : {type : Boolean, default : false},
}, {timestamps : true})

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification