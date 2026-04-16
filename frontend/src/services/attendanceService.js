import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AttendanceService error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

export const checkIn = async() => {
    try {
        const res = await axiosClient.post('/attendance/check-in')
        return res.data
    } catch (error) {
        return errorHandler(error)
    }
}

export const checkOut = async() => {
    try {
        const res = await axiosClient.post('/attendance/check-out')
        return res.data
    } catch (error) {
        return errorHandler(error)
    }
}

export const getMyAttendance = async(month, year) => {
    try {
        if(!month || !year){
            throw new Error('month and year are required')
        }
        const res = await axiosClient.get(`/attendance/my?month=${month}&year=${year}`)
        return res.data.records
    } catch (error) {
        return errorHandler(error)
    }
}

export const getAllAttendance = async() => {
    try {
        const res = await axiosClient.get('/attendance')
        return res.data.attendance
    } catch (error) {
        return errorHandler(error)
    }
}