import asyncHandler from "../middlewares/asyncHandler.js";
import Salary from "../models/Salary.js";
import User from "../models/User.js";
import { payPublishedMail } from "../services/emailService.js";


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

    if(!['HR','Admin'].includes(req.user.role)) {
        const error = new Error('unauthorized to create salary')
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
    await salary.populate("employee", "name email role department")

    try {
        if(salary.status === 'paid'){
            await payPublishedMail({user : salary.employee, payslip : salary})
        }
    } catch (error) {
        console.log('payslip email failed:', error)
    }
    
    res.status(201).json({success : true, message : 'salary created successfully', data : salary})
})

export const getAllSalaries = asyncHandler(async(req, res) => {
    const filters = {}

    if(['HR','Admin'].includes(req.user.role)) {
        if(req.query.status) filters.status = req.query.status 
        if(req.query.employee) filters.employee = req.query.employee 
    } else {
        filters.employee = req.user._id
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8

    const total = await Salary.countDocuments(filters)

    const salaries = await Salary.find(filters).populate("employee", "name email role department").sort({month : -1}).skip((page - 1) * limit).limit(limit)

    res.status(200).json({success : true, salaries, currentPage: page, totalPages: Math.ceil(total / limit), totalRecords: total})
})

export const getSalary = asyncHandler(async(req,res) => {
    const salaryId = req.params.id 

    const salary = await Salary.findById(salaryId).populate("employee", "name email role department")
    if(!salary){
        const error = new Error('salary not found')
        error.statusCode = 404
        throw error
    }

    if(!['HR','Admin'].includes(req.user.role) && salary.employee._id.toString() !== req.user._id.toString()) {
        const error = new Error('unauthorized')
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

    if(baseSalary !== undefined && baseSalary <  0){
        const error = new Error('baseSalary cannot be empty')
        error.statusCode = 400
        throw error  
    }

    if(allowance !== undefined && allowance <  0){
        const error = new Error('allowance cannot be empty')
        error.statusCode = 400
        throw error  
    }

    if(deduction !== undefined && deduction <  0){
        const error = new Error('deduction cannot be empty')
        error.statusCode = 400
        throw error  
    }

    if(!['HR','Admin'].includes(req.user.role)) {
        const error = new Error('unauthorized to update salary')
        error.statusCode = 403
        throw error
    }

    if(baseSalary !== undefined) salary.baseSalary = baseSalary
    if(allowance !== undefined) salary.allowance = allowance
    if(deduction !== undefined) salary.deduction = deduction

    await salary.save()

    await salary.populate("employee", "name email role department")

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
    if(!['HR','Admin'].includes(req.user.role)) {
        const error = new Error('unauthorized to update salary status')
        error.statusCode = 403
        throw error
    }

    const currentStatus = salary.status
    const validTransitions = {
        pending : ['processing', 'paid'],
        processing : ['paid', 'pending'],
        paid : ['pending', 'processing']
    }
    if(!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
        const error = new Error(`invalid status transition from ${currentStatus} to ${status}`)
        error.statusCode = 400
        throw error
    }
    salary.status = status
    await salary.save()
    await salary.populate("employee", "name email role department")

    try {
        if(status === 'paid'){
            await payPublishedMail({user : salary.employee, payslip : salary})
        }
    } catch (error) {
        console.log('payslip email failed:', error)
    }

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

    if(!['HR','Admin'].includes(req.user.role) && req.user._id.toString() !== employeeId) {
        const error = new Error('unauthorized')
        error.statusCode = 403
        throw error
    }
    const salaries = await Salary.find({employee : employeeId}).populate("employee", "name email role").sort({month : -1})

    res.status(200).json({success : true, message : 'salaries fetched successfully', count : salaries.length, salaries })
})

