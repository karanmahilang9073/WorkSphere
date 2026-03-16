import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employee : {type : mongoose.Types.ObjectId, ref : "User", required : true},
    date : {type : Date, default: Date.now},
    checkIn : {type : String},
    checkOut : {type: String},
    workHours : {type: Number},
    status : {type: String, enum: ["present", "absent", "leave"], default : "present"},
    approvedBy : {type: mongoose.Types.ObjectId, ref : "User"}
}, {timestamps: true})
const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance