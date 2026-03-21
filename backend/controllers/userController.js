import asyncHandler from "../middlewares/asyncHandler.js"
import User from "../models/User.js"

export const getUsers = asyncHandler(async(req, res) => {
    let users
    if (req.user.role === "Admin" || req.user.role === "Hr"){
        users = await User.find().select("-password")
    } else {
        const error = new Error ('not authorized')
        error.statusCode = 403
        throw error
    }
    res.status(200).json({ success: true, count: users.length, users})
})

export const getUserProfile = asyncHandler(async(req, res) =>{
    const userId = req.user._id 
    const user = await User.findById(userId).select("-password")
    if (!user) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    res.status(200).json({ success: true, user})
})


export const updateUser = asyncHandler(async(req, res) => {
    const { name, email, department, role } = req.body
    const userId = req.params.id
    const user = await User.findById(userId)
    if( !user) {
        const error = new Error ('user not found')
        error.statusCode = 403
        throw error
    }
    if (req.user.id !== user._id.toString() && req.user.role !== "Admin") {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    user.name = name || user.name
    user.email = email || user.email
    user.department = department || user.department
    if (req.user.role === "Admin" && role) {
        user.role = role
    }
    await user.save()
    res.status(200).json({ success: true, message:  "User updated successfully", user})
})
 
export const deleteUser = asyncHandler(async(req, res) => {
    if (req.user.role !== "Admin") {
        const error = new Error('only admin can delete users')
        error.statusCode = 403
        throw error
    }
    const userId = req.user.id
    const user = await User.findById(userId)
    if ( !user) {
        const error = new Error('user not found')
        error.statusCode = 403
        throw error
    }
    await user.deleteOne()
    res.status(200).json({ success : true, message: 'user deleted successfully'})
})