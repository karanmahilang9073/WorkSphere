import asyncHandler from "../middlewares/asyncHandler.js";
import Salary from "../models/Salary.js";
import User from "../models/User.js";

export const createSalary =  asyncHandler(async(req, res) => {
    const {employee, baseSalary, allowance, deduction, month} = req.body 
    if(!employee || !baseSalary || !month){
        const error = new Error('all fields are required')
        error.statusCode = 400
        throw error
    }

    const user = await User.findById(employee)
    if(!user){
        const error = new Error('employee not found')
        error.statusCode = 404
        throw error
    }

    if(!['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('not authorized to create salary')
        error.statusCode = 403
        throw error
    }

    const existing = await Salary.findOne({employee, month : new Date(month)})
    if(existing) {
        const error = new Error('salary already exists for this month')
        error.statusCode = 400
        throw error
    }
    const monthDate = new Date(month)
    
    const salary = await Salary.create({employee, baseSalary, allowance, deduction, month : monthDate})
    await salary.populate("employee", "name email")
    
    res.status(201).json({success : true, message : 'salary created successfully', data : salary})
})

export const getAllSalaries = asyncHandler(async(req, res) => {
    const filters = {}

    if(['Admin','Hr'].includes(req.user.role)) {
        if(req.query.status) filters.status = req.query.status 
        if(req.query.employee) filters.employee = req.query.emoloyee 
    } else {
        filters.employee = req.user.id
    }

    const salaries = await Salary.find(filters).populate("employee", "name email").sort({month : -1})

    res.status(200).json({success : true, count : salaries.length,  data : salaries})
})

export const getSalary = asyncHandler(async(req,res) => {
    const salaryId = req.params.id 

    const salary = await Salary.findById(salaryId).populate("employee", "name email")
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }

    if(!['Hr','Admin'].includes(req.user.role) && salary.employee._id.toString() !== req.user.id) {
        const error = new Error('not Authorized')
        error.statusCode = 403
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

    if(!['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('not authorized to update salary')
        error.statusCode = 403
        throw error
    }

    if(baseSalary !== undefined) salary.baseSalary = baseSalary
    if(allowance !== undefined) salary.allowance = allowance
    if(deduction !== undefined) salary.deduction = deduction

    await salary.save()

    await salary.populate("employee", "name email")

    res.status(200).json({success : true, message : 'salary updated successfully', data : salary})
})

export const updateStatus = asyncHandler(async(req, res) => {
    const salaryId = req.params.id
    const {status} = req.body 

    const salary = await Salary.findById(salaryId)
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }
    if(!['Admin','Hr'].includes(req.user.role)) {
        const error = new Error('not authorized to update salary status')
        error.statusCode = 403
        throw error
    }

    const currentStatus = salary.status
    const validTransitions = {
        pending : ['processing'],
        processing : ['paid'],
    }
    if(!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
        const error = new Error(`invalid status transition from ${currentStatus} to ${status}`)
        error.statusCode = 400
        throw error
    }
    salary.status = status
    await salary.save()
    await salary.populate("employee", "name email role")

    res.status(200).json({success : true, message : `salary marked as ${status}`, salary})
})

export const getSalaryByEmployee = asyncHandler(async(req, res) => {
    const employeeId = req.params.id

    const user = await User.findById(employeeId)
    if(!user){
        const error = new Error('employee not found')
        error.statusCode = 404
        throw error
    }

    if(!['Admin','Hr'].includes(req.user.role) && req.user.id !== employeeId) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    const salaries = await Salary.find({employee : employeeId}).populate("employee", "name email role").sort({month : -1})

    res.status(200).json({success : true, message : 'salaries fetched successfully', count : salaries.length, salaries })
})

export const deleteSalary = asyncHandler(async(req, res) => {
    const salaryId = req.params.id 
    const salary = await Salary.findById(salaryId)
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }

    if(salary.status !== "pending") {
        const error = new Error('only pending salaries can be deleted')
        error.statusCode = 403
        throw error
    }

    if(!['Hr','Admin'].includes(req.user.role)) {
        const error = new Error('not authorized to delete salary')
        error.statusCode = 403
        throw error
    }

    await salary.deleteOne()

    res.status(200).json({success : true, message : 'salary deleted successfully'})
})