import asyncHandler from "../middlewares/asyncHandler.js"
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import generateToken from "../utils/JWT.js"

export const register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role, department} = req.body 
    if(!name || !email || !password){
        const error = new Error('all fields are required')
        error.statusCode = 400
        throw error
    }

    const existeduser = await User.findOne({email})
    if(existeduser){
        const error = new Error('user already existed')
        error.statusCode = 409
        throw error
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({name, email, password : hashedPassword, role, department})

    const token = generateToken(user._id, user.role)

    res.status(201).json({success : true, token,  message : 'user created successfully', 
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role || 'employee'
        }
    })
})

export const login = asyncHandler(async(req,res) => {
    const {email, password} = req.body
    if(!email || !password){
        const error = new Error('all fields are required')
        error.statusCode = 401
        throw error
    }
    const user = await User.findOne({email})
    if(!user){
        const error = new Error('user not found')
        error.statusCode = 404
        throw error
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        const error = new Error('password do not match, please try again...')
        error.statusCode = 401
        throw error
    }

    const token = generateToken(user._id, user.role)
    
    user.lastLogin = new Date()

    await user.save()

    res.status(200).json({success : true, message : 'logged in successfully', token : token,
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
        }
    })
})

export const getProfile = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId)
    if(!user){
        const error = new Error("user not found")
        error.statusCode = 404
        throw error
    }
    res.status(200).json({success : true, message : 'user get successfully',
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            department : user.department,
            position : user.position
        }
    })
})

export const logout = asyncHandler(async(req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId)
    if(user){
        user.lastLogout = new Date()
        await user.save()
    }
    res.status(200).json({success : true, message : 'user logged out successfully'})
})