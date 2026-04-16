import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AuthService error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

//register
export const register = async(data) => {
    try {
        const res = await axiosClient.post('/auth/register', data)
        return res.data
    } catch (error) {
        throw errorHandler(error)
    }
}

//login
export const login = async(data) => {
   try {
     const res = await axiosClient.post('/auth/login', data)
     return res.data
   } catch (error) {
    throw errorHandler(error)
   }
}

//get profile
export const getProfile = async() => {
    try {
        const res = await axiosClient.get('/auth/profile')
        return res.data.user 
    } catch (error) {
        throw errorHandler(error)
    }
}

//logout
export const logout = async() => {
    try {
        const res = await axiosClient.post('/auth/logout')
        return res.data 
    } catch (error) {
        throw errorHandler(error)
    }
}

