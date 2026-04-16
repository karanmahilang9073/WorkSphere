import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('UserService error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

//get all users
export const getUsers = async() => {
    try {
        const res = await axiosClient.get('/users')
        return res.data.users
    } catch (error) {
        errorHandler(error)
    }
}

//get profile
export const getUserProfile = async() => {
    try {
        const res = await axiosClient.get('/users/profile')
        return res.data.user
    } catch (error) {
        errorHandler(error)
    }
}

//update user 
export const updateUser = async(id, data) => {
    try {
        const res = await axiosClient.put(`/users/${id}`, data)
        return res.data.user
    } catch (error) {
        errorHandler(error)
    }
}

//delete user
export const deleteUser = async(id) => {
    try {
        const res = await axiosClient.delete(`/users/${id}`)
        return res.data
    } catch (error) {
     errorHandler(error)   
    }
}