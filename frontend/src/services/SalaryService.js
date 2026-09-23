import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('SalaryService error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

//create saalry
export const createSalary = async(data) => {
    try {
        const res = await axiosClient.post('/salary/create-salary', data)
        return res.data
    } catch (error) {
       throw errorHandler(error)
    }
}

// get all salaries with filter
export const getSalaries = async(page = 1, limit = 8, status = '', employee = '') => {
    try {
        let url = `/salary?page=${page}&limit=${limit}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (employee) url += `&employee=${encodeURIComponent(employee)}`;
        const res = await axiosClient.get(url)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//get single salary
export const getSalary = async(id) => {
    try {
        const res = await axiosClient.get(`/salary/${id}`)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//update salary
export const updateSalary = async(id, data) => {
    try {
        const res = await axiosClient.put(`/salary/${id}`, data)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//update salary status
export const updateStatus = async(id, status) => {
    try {
        const res = await axiosClient.put(`/salary/${id}/status`, {status})
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//get salary by  employeeId
export const getSalaryByEmployee = async(employeeId) => {
    try {
        const res = await axiosClient.get(`/salary/employee/${employeeId}`)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}
