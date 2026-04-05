import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employee : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    baseSalary : {type : Number, required : true},
    allowance : {type : Number, default  : 0},
    deduction : {type : Number, default : 0},
    netSalary : {type : Number},
    month : {type : Date, required : true},
    status : {type : String, enum : ['pending','paid','processing'], default : 'pending'}
}, {timestamps : true})

salarySchema.pre('save', function(next) {
    this.netSalary = (this.baseSalary || 0) + (this.allowance || 0) - (this.deduction || 0);
    next()
})

salarySchema.index({employee : 1, month : 1}, {unique : true})

const Salary = mongoose.model("Salary", salarySchema)
export default Salary