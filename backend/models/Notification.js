import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    type : {type : String, enum : ['leave', 'task', 'salary'], required : true},
    title : {type : String, required : true, trim : true},
    message : {type : String, required : true, trim : true},
    isRead : {type : Boolean, default : false},
}, {timestamps : true})

notificationSchema.index({recipient : 1, isRead : 1})

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification