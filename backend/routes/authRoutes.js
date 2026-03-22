import express from 'express'
import { register, login, getProfile, logout, } from '../controllers/authController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/profile', authMiddleware, getProfile)
authRouter.post('/logout', authMiddleware, logout)

export default authRouter