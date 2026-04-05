import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {type : String, required : true, trim : true},
    description : {type : String, default : ""},
    assignedTo : {type : mongoose.Schema.Types.ObjectId, ref : "User"},
    deadline : {type : Date},
    status : {type : String, enum : ['pending', 'inProgress','missed','completed'], default : 'pending'}
}, {timestamps : true})

taskSchema.index({assignedTo : 1})

const Task = new mongoose.model("Task", taskSchema)
export default Task