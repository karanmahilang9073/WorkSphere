import express from 'express'
import {getUsers, updateUser, deleteUser, getUserProfile} from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

userRouter.get('/', authMiddleware, getUsers)
userRouter.put('/:id',authMiddleware, updateUser)
userRouter.get('/profile', authMiddleware, getUserProfile)
userRouter.delete('/:id',authMiddleware, deleteUser)

export default userRouter
