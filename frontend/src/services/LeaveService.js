import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    const err = error?.response?.data || {message : 'something went wrong'}
    console.error('LeaveService error', err)
    return err
}

//apply leave
export const applyLeave = async(leaveData) => {
    try {
        const res = await axiosClient.post('/leaves', leaveData)
        return res.data.leave
    } catch (error) {
        throw errorHandler(error)
    }
}

//get all leaves
export const getLeaves = async() => {
    try {
        const res = await axiosClient.get('/leaves')
        return res.data.leaves
    } catch (error) {
        throw errorHandler(error)
    }
}

//update leave status
export const updateLeaveStatus = async(id, status, comment = "") => {
    try {
        const res = await axiosClient.patch(`/leaves/${id}/status`, {status, comment})
        return res.data.leave
    } catch (error) {
        throw errorHandler(error)
    }
}

//revoke leave
export const revokeLeave = async(id) => {
    try {
        const res = await axiosClient.patch(`/leaves/${id}/revoke`)
        return res.data.leave
    } catch (error) {
        throw errorHandler(error)
    }
}

export const deleteLeave = async(id) => {
    try {
        await axiosClient.delete(`/leaves/${id}`)
        return id
    } catch (error) {
        throw errorHandler(error)
    }
}