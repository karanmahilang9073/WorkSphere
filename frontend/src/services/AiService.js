import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AIservice error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

//predict salary
export const predictSalary = async(employeeId) => {
    try {
        const res = await axiosClient.post('/ai/predict-salary', {employeeId})
        return res.data.data
    } catch (error) {
        errorHandler(error)
    }
}

//recommend task
export const recommentTask = async(departmentId) => {
    try {
        const res = await axiosClient.post('/ai/recomment-task', {departmentId})
        return res.data.data
    } catch (error) {
        errorHandler(error)
    }
}

//analyze leave
export const analyzeLeave = async(leaveData) => {
    try {
        const res = await axiosClient.post('/ai/analyze-leave', {leaveData})
        return res.data.data
    } catch (error) {
        errorHandler(error)
    }
}

//performance insight
export const getPerformance = async(employeeId) => {
    try {
        const res = await axiosClient.post('/ai/performance', {employeeId})
        return res.data.data
    } catch (error) {
        errorHandler(error)
    }
}

//analyze attendance
export const analyzeAttendance = async() => {
    try {
        const res = await axiosClient.get('/ai/attendance-analyze')
        return res.data.data 
    } catch (error) {
        errorHandler(error)
    }
}

// chat service
export const chat = async(message, context = 'general') => {
    try {
        const res = await axiosClient.post('/ai/chat', {message, context})
        return res.data.data
    } catch (error) {
        errorHandler(error)
    }
}