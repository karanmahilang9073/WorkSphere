import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
employee : {type : mongoose.Types.objectId, ref : "User", required : true, index : true},
leaveType : {type : String, enum : ["Casual", "Earned", "Sick", "Weekoff"], required : true},
startDate : {type : Date, required : true },
endDate : {type : Date, required : true},
totalDays : {type : Number},
reason : {type : String, required : true, trim : true, maxlength : 500},
status : {type : String, enum: ["pending", "approve", "reject", "cancel"], default: "pending"},
approvedBy : {type : mongoose.Type.objectId, ref : "User",
approvedComment : {type : String, trim: true},
attachment: {type : String},
leaveBalanceSnapshot : {type : Number}
}
}, {timestamps: true})
const Leave = mongoose.model("Leave", leaveSchema);
export default Leave