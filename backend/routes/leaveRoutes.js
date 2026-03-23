import express from 'express'
import {applyLeave, getLeaves, updateLeaveStatus, revokeLeave, deleteLeave} from '../controllers/leaveController.js'

const leaveRouter = express.Router()

leaveRouter.post('/apply', applyLeave)
leaveRouter.get('/', getLeaves)
leaveRouter.put('/:id', updateLeaveStatus)
leaveRouter.put('/revoke/:id', revokeLeave)
leaveRouter.delete('/:id', deleteLeave)

export default leaveRouter
