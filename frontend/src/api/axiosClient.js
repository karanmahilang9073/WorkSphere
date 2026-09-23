import axios from "axios"
import {toast} from 'react-toastify'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

const isValidToken = (token) => {
    if(!token) return false
    return token.includes('.') && token.split('.').length === 3
}

axiosClient.interceptors.request.use((config) => {
        const token = localStorage.getItem("token")

        if(token && !isValidToken(token)) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const config = error.config;
        if(!config){
            return Promise.reject(error)
        }
        config.retryCount = config.retryCount || 0

        // retry only on timeout max 2 times
        if(config.retryCount < 2 && (!error.response || error.code === 'ECONNABORTED')){
            config.retryCount++;
            return new Promise(resolve => setTimeout(() => resolve(axiosClient(config)),2000)) // wait 2 seconds
        }

        // error handling
        if(!error.response) {
            toast.error('Network error - server not reachable')
        }

        if(error.response?.status === 403){
            toast.error(error.response?.data?.message || 'Access Denied: You do not have permission.')
        }
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem("token");
            localStorage.removeItem('user')
            window.location.href = "/login";
        }

        if(error.response?.status >= 500){
            toast.error('server error - please try again later')
        }

        return Promise.reject(error)
    }
)

export default axiosClient