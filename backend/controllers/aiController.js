import asyncHandler from "../middlewares/asyncHandler.js";
import { aiResponse } from "../services/aiService.js";
import Task from '../models/Task.js'
import Salary from '../models/Salary.js'
import Attendance from '../models/Attendance.js'
import Leave from '../models/Leave.js'
import AiChat from "../models/AiChat.js";

export const predictSalary = asyncHandler(async(req, res) => {
    const {employeeId} = req.body
    if(!employeeId){
        const error = new Error('employee ID is required')
        error.statusCode = 400
        throw error
    }

    //fetch last 6 salary records
    const  salaries = await Salary.find({employee : employeeId}).sort({month : -1}).limit(6)
    if(!salaries || salaries.length === 0){
        const error = new Error('no salary record found')
        error.statusCode = 404
        throw error
    }

    //prepare salary data for prompt
    const salaryData = salaries.map((s) => `Month: ${s.month}, Salary: ${s.ammount}`).join("\n")

    const prompt = `you are an HR analytic assistant. based on following past salary data, predict the nexts month's salary. Salary History: ${salaryData}. give a clear predicted salary with a short explanation`

    const prediction = await aiResponse(prompt)

    res.status(200).json({success : true, message : 'salary prediction generated successfully', data : prediction})
})

export const recommendTasks = asyncHandler(async(req,res) => {
    const {departmentId} = req.body
    let query = {status : "pending"}
    if(departmentId){
        query.department = departmentId
    }

    const tasks = await Task.find(query).populate("assignedTo")
    if(!tasks || tasks.length === 0){
        const error = new Error('pending tasks not found')
        error.statusCode = 404
        throw error
    }

    const taskData = tasks.map((t) => {
        return `Task: ${t.title} AssignedTo : ${t.assignedTo?.name || 'Unassigned'} Department : ${t.department || "N/A"}`
    }).join("\n\n")

    const prompt = `You are an HR task management assistant. 
    based on the following pending tasks, suggest better employee assignments. consider workload balance and efficiency. Tasks: ${taskData}. give clear reassignment suggestion.`

    const recomendation = await aiResponse(prompt)

    res.status(200).json({sucess : true, message : 'task assignment recommendations generated successfully', data : recomendation})
})

export const analyzeLeavereq = asyncHandler(async(req, res) => {
    const {employeeId, startDate, endDate, reason} = req.body
    if(!employeeId || !startDate || !endDate || !reason){
        const error = new Error("all fields are required")
        error.statusCode = 400
        throw error
    }

    const leaves = await Leave.find({employee : employeeId})

    //prepare leave history data
    const  leaveHistory = leaves.length ? leaves.map((l) => {
        return `from: ${l.startDate} To: ${l.endDate} | Reason: ${l.reason} | status: ${l.status}`;
    }).join('\n') : 'no previous leave records'

    const prompt = `you are an ai assistant responsible for evaluating leave requests. 
    employee leave history: ${leaveHistory}
    new leave request: 
    Start Date: ${startDate}
    End Date: ${endDate}
    Reason: ${reason}
    analyze whether this leave should be approved or not
    Give a clear decision (Approve/Reject) with short justification`

    const analysis = await aiResponse(prompt)

    res.status(200).json({success : true, message : 'leave request analized successfully', data : analysis})
})

export const getPerformanceInsights = asyncHandler(async(req, res) => {
    const {employeeId} = req.body
    if(!employeeId){
        const error = new Error('employee id is required')
        error.statusCode =  400
        throw error
    }

    const tasks = await Task.find({assignedTo : employeeId})
    const attendance = await Attendance.find({employee : employeeId})

    //prepare task data 
    const taskData = tasks.length ? tasks.map((t) => {
        return `Task: ${t.title} | Status: ${t.status}`
    }).join("\n") : "no tasks records"

    //prepare attendance data
    const attendanceData = attendance.length ? attendance .map((a) => {
        return `Date: ${a.date} | Status: ${a.status}`; }).join("\n") : "No attendance records";

    const prompt = `you are an HR performance analyst.
    based on the following employee data, generate a performance report.
    Tasks: ${taskData}
    Attendance: ${attendanceData}
    provide a summary including: overall performance, works consistency, strengths, area for improvement`

    const report = await aiResponse(prompt)

    res.status(200).json({success : true, message : 'performance report generated successfully', data : report})
})

export const analyzeAttendance = asyncHandler(async(req, res) => {
    const records = await Attendance.find().populate("employee")
    if(!records || records.length === 0){
        const error = new Error('no attendance records found')
        error.statusCode = 404
        throw error
    }

    const attendanceData = records.map((a) => {
        return `Employee: ${a.employee?.name || "unknown"}
        Date: ${a.date} 
        Status: ${a.status}`
    }).join("\n\n")

    const prompt = `you are an HR analytic assistant
    analyze the following attendance data and identify pattern
    Attendance data: ${attendanceData}
    Detect: employee with frequent absence, unusual attendance behaviour, late or irregular patterns, any anomalies.
    provide a clear summary with insights`

    const analysis = await aiResponse(prompt)

    res.status(200).json({success : true, message : 'attendance pattern analysis generated successfully', data : analysis})
})

export const aiChat = asyncHandler(async(req, res) => {
    const userId = req.user._id
    const {message} = req.body
    if(!message || message.trim() === ""){
        const error = new Error('Message is required')
        error.statusCode = 400
        throw error
    }
    const aiReply = await aiResponse(message)
    const chatRecord = await AiChat.create({employee : userId,message, response : aiReply})

    return res.status(200).json({success : true, 
        data : {
            reply : aiReply,
            chatId : chatRecord._id
        }
    })
})