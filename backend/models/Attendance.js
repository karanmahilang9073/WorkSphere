import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employee : {type : mongoose.Types.ObjectId, ref : "User", required : true},
    date : {type : Date, default: Date.now},
    checkIn : Date,
    checkOut : Date,
    workHours : {type: Number, default: 0},
    status : {type: String, enum: ["present", "absent", "leave"], default : "present"},
    shift: {type: String, enum: ["general", "night"], default: "general"},
    shiftStart: {type: String, default: "10:00"},
    shiftEnd: {type: String, default: "19:00"},
    late: {type: Boolean, default: false},
    approvedBy : {type: mongoose.Types.ObjectId, ref : "User"}
}, {timestamps: true})

attendanceSchema.index({employee: 1, date: 1}, {unique: true})
const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance