import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employee : {type : mongoose.Types.ObjectId, ref : "User", required : true},
    baseSalary : {type : Number, required : true},
    allowance : {type : Number},
    deduction : {type : Number},
    netSalary : {type : Number},
    month : {type : Date, required : true},
    status : {type : String, enum : ['pending','paid','processing'], default : 'pending'}
}, {timestamps : true})

const Salary = mongoose.model("Salary", salarySchema)
export default Salary