import express from 'express'
import {applyLeave, getLeaves, updateLeaveStatus, revokeLeave, deleteLeave} from '../controllers/leaveController.js'

const leaveRouter = express.Router()

leaveRouter.post('/auth/apply', applyLeave)
leaveRouter.get('/auth/', getLeaves)
leaveRouter.put('/auth/:id', updateLeaveStatus)
leaveRouter.put('/auth/revoke/:id', revokeLeave)
leaveRouter.delete('/auth/:id', deleteLeave)

export default leaveRouter
