import asyncHandler from "../middlewares/asyncHandler.js";
import Salary from "../models/Salary.js";

export const createSalary =  asyncHandler(async(req, res) => {
    const {employee, baseSalary, allowance, deduction, month} = req.body 
    if(!employee || !baseSalary || !month){
        const error = new Error('all fields are required')
        error.statusCode = 400
        throw error
    }
    const netSalary = baseSalary + (allowance || 0) - (deduction || 0)
    
    const salary = await Salary.create({employee, baseSalary, allowance, deduction, month, netSalary})
    await salary.populate("employee", "name email")
    
    res.status(201).json({success : true, message : 'salary created successfully', data : salary})
})

export const getAllSalaries = asyncHandler(async(req, res) => {

    const filters = {}
    if(req.query.status) filters.status = req.query.status
    if(req.query.employee) filters.employee = req.query.employee

    const salaries = await Salary.find(filters).populate("employee", "name email")

    res.status(200).json({success : true, count : salaries.length,  data : salaries})
})

export const getSalary = asyncHandler(async(req,res) => {
    const salaryId = req.params.id 
    if(!salaryId){
        const error = new Error('salary not exist')
        error.statusCode = 400
        throw error
    }

    const salary = await Salary.findById(salaryId)
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }

    res.status(200).json({success : true, message : "salary fetched successfuly", data : salary})
})

export const updateSalary = asyncHandler(async(req, res) => {
    const salaryId = req.params.id 
    const {baseSalary, allowance, deduction} = req.body

    const salary = await Salary.findById(salaryId)
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }
    if(salary.status === "paid"){
        const error = new Error('cannot update paid salary')
        error.statusCode = 403
        throw error
    }

    //recalculate net salary
    let shouldRecalculate = false;
    if (baseSalary !== undefined) {
        salary.baseSalary = baseSalary;
        shouldRecalculate = true;
    }
    if (allowance !== undefined) {
        salary.allowance = allowance;
        shouldRecalculate = true;
    }
    if (deduction !== undefined) {
        salary.deduction = deduction;
        shouldRecalculate = true;
    }
    if(shouldRecalculate){
        salary.netSalary = salary.baseSalary + salary.allowance - salary.deduction
    }
    await salary.save()

    await salary.populate("employee", "name email")

    res.status(200).json({success : true, data : salary})
})