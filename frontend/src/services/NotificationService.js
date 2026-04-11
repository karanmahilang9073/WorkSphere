import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('Notificationservice error', error?.response?.data || error.message);
    throw error?.response?.data || {message : 'something went wrong'}
}

//create-notification
export const createNotification = async(data) => {
    try {
        const res = await axiosClient.post('/notifications/', data)
        return res.data
    } catch (error) {
        errorHandler(error)
    }
}

//get my notification
export const getMyNotifications = async() => {
    try {
        const res = await axiosClient.get('/notifications/my')
        return res.data
    } catch (error) {
        errorHandler(error)
    }
}

//mark one as read
export const markAsRead = async(id) => {
    try {
        const res = await axiosClient.patch(`/notifications/${id}/read`)
        return res.data
    } catch (error) {
        errorHandler(error)
    }
}

//delete notification
export const deleteNotification = async(id) => {
    try {
        await axiosClient.delete(`/notifications/${id}`)
    } catch (error) {
        errorHandler(error)
    }
}