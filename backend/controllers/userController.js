import asyncHandler from "../middlewares/asyncHandler.js"
import User from "../models/User.js"

// get users
export const getUsers = asyncHandler(async(req, res) => {
    if(!['Hr','Admin','hr','admin'].includes(req.user.role)) {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }
    const users = await User.find().select("-password").sort({createdAt : -1})
    res.status(200).json({ success: true, count: users.length, users})
})

// get single user profile
export const getUserProfile = asyncHandler(async(req, res) =>{
    const userId = req.user.id 
    const user = await User.findById(userId).select("-password")
    if (!user) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    res.status(200).json({ success: true, message : 'user profile fetched successfully', user})
})

// update user
export const updateUser = asyncHandler(async(req, res) => {
    const { name, email, department, role } = req.body
    const userId = req.params.id

    const user = await User.findById(userId)
    if( !user) {
        const error = new Error ('user not found')
        error.statusCode = 404
        throw error
    }

    if (req.user.id !== user._id.toString() && req.user.role !== "Admin") {
        const error = new Error('not authorized')
        error.statusCode = 403
        throw error
    }

    if(email) {
        const emailNormalized = email.toLowerCase()
        const existing = await User.findOne({email : emailNormalized})
        if(existing && existing._id.toString() !== userId){
            const error = new Error('not authorized')
            error.statusCode = 403
            throw error
        }
        user.email = emailNormalized
    }
    user.name = name || user.name
    user.department = department || user.department
    if (req.user.role === "Admin" && role) {
        user.role = role
    }

    await user.save()
    res.status(200).json({ success: true, message:  "User updated successfully", 
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            department : user.department
        }
    })
})
 
export const deleteUser = asyncHandler(async(req, res) => {
    if (req.user.role !== "Admin") {
        const error = new Error('only admin can delete users')
        error.statusCode = 403
        throw error
    }
    const userId = req.params.id
    const user = await User.findById(userId)
    if ( !user) {
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }
    await user.deleteOne()
    res.status(200).json({ success : true, message: 'user deleted successfully'})
})