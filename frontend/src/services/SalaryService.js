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
export const getSalaries = async(params = {}) => {
    try {
        const query = new URLSearchParams(params).toString()
        const res = await axiosClient.get(`/salary?${query}`)
        return res.data.data
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

//delete salary
export const deleteSalary = async(id) => {
    try {
        const res = await axiosClient.delete(`/salary/${id}`)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}