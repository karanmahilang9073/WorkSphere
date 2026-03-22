import express from 'express'
import {getUsers, getUserProfile, updateUser, deleteUser} from '../controllers/userController.js'

const userRouter = express.Router()

 userRouter.post('/auth/', getUsers)
 userRouter.post('/auth/profile', getUserProfile)
 userRouter.put('/auth/:id', updateUser)
 userRouter.delete('/auth/:id', deleteUser)

 export default userRouter
