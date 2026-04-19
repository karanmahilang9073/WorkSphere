import axiosClient from "../api/axiosClient";


//error handler
const errorHandler = (error) => {
    console.error('TaskService error', error?.response?.data || error.message)
    throw error?.response?.data || {message : 'something went wrong'}
}

//get all task 
export const getTasks = async() => {
    try {
        const res = await axiosClient.get('/tasks')
        return res.data.data 
    } catch (error) {
        throw errorHandler(error)
    }
}

//get single task
export const getTaskById = async(id) => {
    try {
        const res = await axiosClient.get(`/tasks/${id}`)
        return res.data.data 
    } catch (error) {
        throw errorHandler(error)
    }
}

//create task
export const createTask = async(taskData) => {
    try {
        const res = await axiosClient.post('/tasks/create-task', taskData)
        return res.data.task
    } catch (error) {
        throw errorHandler(error)
    }
}

//update task
export const updateTask = async(id, updatedData) => {
    try {
        const res = await axiosClient.put(`/tasks/${id}`,updatedData)
        return res.data.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//update status
export const updateStatus = async(id, status) => {
    try {
        const res = await axiosClient.put(`/tasks/update-status/${id}/status`, {status})
        return res.data.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//delete task 
export const deleteTask = async(id) => {
    try {
        await axiosClient.delete(`/tasks/delete-task/${id}`)
        return id
    } catch (error) {
        throw errorHandler(error)
    }
}

