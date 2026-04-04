import mongoose from "mongoose";

const aiSchema = new mongoose.Schema({
    employee : {type : mongoose.Types.ObjectId, ref : "User", required : true},
    message : {type : String, required : true},
    response : {type : String, required : true},
    category : {type : String, enum : ["salary","leave","attendance","task","general"], default : "general"},
    resolved : {type : Boolean, default : false},
    createdAt : {type : Date, default : Date.now()}
}, {timestamps : true})

const AiChat = mongoose.model("AiChat", aiSchema)

export default AiChat