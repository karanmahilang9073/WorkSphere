import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AttendanceService error', error?.response?.data || error.message);
    throw error?.response?.data || { message: 'something went wrong' };
}

export const checkIn = async (location, checkInMethod = "manual", timezoneOffset = new Date().getTimezoneOffset()) => {
    try {
        const res = await axiosClient.post('/attendance/check-in', { location, checkInMethod, timezoneOffset });
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export const checkOut = async () => {
    try {
        const res = await axiosClient.post('/attendance/check-out');
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export const getMyAttendance = async (month, year) => {
    try {
        if (!month || !year) {
            throw new Error('month and year are required');
        }
        const res = await axiosClient.get(`/attendance/my?month=${month}&year=${year}`);
        return res.data.records;
    } catch (error) {
        return errorHandler(error);
    }
}

export const getAllAttendance = async (page = 1, limit = 10) => {
    try {
        const res = await axiosClient.get(`/attendance?page=${page}&limit=${limit}`);
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export const getQRToken = async () => {
    try {
        const res = await axiosClient.post('/attendance/qr-token');
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export const checkInWithQR = async (qrToken, location, timezoneOffset = new Date().getTimezoneOffset()) => {
    try {
        const res = await axiosClient.post('/attendance/qr-check-in', { qrToken, location, timezoneOffset });
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export const markAbsent = async (employeeId, date) => {
    try {
        const res = await axiosClient.post('/attendance/absent', { employeeId, date });
        return res.data;
    } catch (error) {
        return errorHandler(error);
    }
}