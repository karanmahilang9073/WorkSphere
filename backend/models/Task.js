import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title : {type : String, required : true, trim : true, minlength : 3, maxlength : 50},
    description : {type : String, default : ""},
    assignedTo : {type : mongoose.Schema.Types.ObjectId, ref : "User"},
    deadline : {type : Date, required : true},
    priority : {type : String, enum : ['low', 'medium', 'high'], default : 'medium'},
    status : {type : String, enum : ['pending', 'inprogress','missed','completed'], default : 'pending'}
}, {timestamps : true})

taskSchema.index({assignedTo : 1})
taskSchema.index({createdAT : -1})

const Task = new mongoose.model("Task", taskSchema)
export default Task