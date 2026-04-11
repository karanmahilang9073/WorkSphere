import mongoose from "mongoose";

const aiSchema = new mongoose.Schema({
    employee : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    message : {type : String, required : true, trim : true},
    response : {type : String, required : true, trim : true},
    category : {type : String, enum : ["salary","leave","attendance","task","general"], default : "general"},
    resolved : {type : Boolean, default : false},
}, {timestamps : true})

aiSchema.index({employee : 1, createdAt : -1})

const AiChat = mongoose.model("AiChat", aiSchema)
export default AiChat