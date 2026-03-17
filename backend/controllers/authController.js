import asyncHandler from "../middlewares/asyncHandler.js";
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import generateToken from "../utils/JWT.js";


















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
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, position } = req.body;
  if (!name || !email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }
});
