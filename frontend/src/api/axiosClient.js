import axios from "axios"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")

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
        if(!error.response) {
            console.error('server not reachable')
        }
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem("token");
            localStorage.removeItem('user')
            window.location.href = "/login";
        }

        return Promise.reject(error)
    }
)

export default axiosClient