import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employee : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    date : {type : Date, default: () => new Date()},
    checkIn : Date,
    checkOut : Date,
    workHours : {type: Number, default: 0},
    status : {type: String, enum: ["present", "absent", "leave", "half-day", "incomplete"], default : "present"},
    shift: {type: String, enum: ["general", "night", "morning", "evening"], default: "general"},
    shiftType: {type: String, enum: ["Morning", "Evening", "Night", "General"], default: "General"},
    shiftStart: {type: String, default: "10:00", trim : true},
    shiftEnd: {type: String, default: "19:00", trim : true},
    late: {type: Boolean, default: false},
    overtimeHours: {type: Number, default: 0},
    checkInMethod: {type: String, enum: ["qr", "geofence"], default: "geofence"},
    location: {
        latitude: {type: Number},
        longitude: {type: Number},
        address: {type: String}
    },
    approvedBy : {type: mongoose.Schema.Types.ObjectId, ref : "User"}
}, {timestamps: true})

attendanceSchema.pre("save", function(){
    // validate checkin checkOut
    if(this.checkOut && !this.checkIn) {
        throw new Error('checkIn is required before checkOut')
    }
    if(this.checkIn && this.checkOut){
        const diff = this.checkOut - this.checkIn
        this.workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100
        if (this.workHours < 1 && this.status !== "leave" && this.status !== "absent") {
            this.status = "incomplete"
        } else if (this.workHours < 4 && this.status !== "leave" && this.status !== "absent") {
            this.status = "half-day"
        }
    }
})

attendanceSchema.index({employee: 1, date: 1}, {unique: true})

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance