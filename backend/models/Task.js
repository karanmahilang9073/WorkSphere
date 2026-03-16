import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {type : String},
    description : {type : String},
    assignedTo : {type : mongoose.Types.ObjectId, ref : "User"},
    deadline : {type : String},
    status : [{type : String, enum : ['pending', 'inProgress','missed','completed'], default : 'pending'}]
}, {timestamps : true})

const Task = new mongoose.model("Task", taskSchema)

export default Task