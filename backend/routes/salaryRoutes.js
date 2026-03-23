import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { createSalary, getAllSalaries, getSalary, updateSalary } from '../controllers/salaryController.js'

const salaryRouter = express.Router()

salaryRouter.post('/create-salary', authMiddleware, createSalary)
salaryRouter.get('/',getAllSalaries)
salaryRouter.get("/:id", getSalary)
salaryRouter.put('/update-salary/:id', authMiddleware, updateSalary)


export default salaryRouter