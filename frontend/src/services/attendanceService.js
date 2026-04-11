import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AttendanceService error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

export const checkIn = async() => {
    try {
        const res = await axiosClient.post('/attendance/checkin')
        return res.data
    } catch (error) {
        errorHandler(error)
    }
}

export const checkOut = async() => {
    try {
        const res = await axiosClient.post('/attendance/checkout')
        return res.data
    } catch (error) {
        errorHandler(error)
    }
}

export const getMyAttendance = async(month, year) => {
    try {
        if(!month || !year){
            throw {message : 'month and year are required'}
        }
        const res = await axiosClient.get(`/attendance/my?month=${month}&year=${year}`)
        return res.data.records
    } catch (error) {
        errorHandler(error)
    }
}

export const getAllAttendance = async() => {
    try {
        const res = await axiosClient.get('/attendance')
        return res.data.records
    } catch (error) {
        errorHandler(error)
    }
}