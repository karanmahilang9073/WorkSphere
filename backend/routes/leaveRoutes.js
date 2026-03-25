import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import {applyLeave, getLeaves, updateLeaveStatus, revokeLeave, deleteLeave} from '../controllers/leaveController.js'

const leaveRouter = express.Router()

leaveRouter.post('/apply', authMiddleware, applyLeave)
leaveRouter.get('/', getLeaves)
leaveRouter.put('/:id', authMiddleware, updateLeaveStatus)
leaveRouter.put('/revoke/:id', revokeLeave)
leaveRouter.delete('/:id', deleteLeave)

export default leaveRouter
