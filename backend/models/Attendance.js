import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employee : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    date : {type : Date, default: new Date()},
    checkIn : Date,
    checkOut : Date,
    workHours : {type: Number, default: 0},
    status : {type: String, enum: ["present", "absent", "leave"], default : "present"},
    shift: {type: String, enum: ["general", "night"], default: "general"},
    shiftStart: {type: String, default: "10:00", trim : true},
    shiftEnd: {type: String, default: "19:00", trim : true},
    late: {type: Boolean, default: false},
    approvedBy : {type: mongoose.Schema.Types.ObjectId, ref : "User"}
}, {timestamps: true})

attendanceSchema.pre("save", function(next){
    if(this.checkIn && this.checkOut){
        const diff = this.checkOut - this.checkIn
        this.workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100
    }
    next()
})

attendanceSchema.index({employee : 1, date : 1})

attendanceSchema.index({employee: 1, date: 1}, {unique: true})
const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance