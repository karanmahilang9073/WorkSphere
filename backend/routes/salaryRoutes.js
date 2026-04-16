import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { createSalary, deleteSalary, getAllSalaries, getSalary, getSalaryByEmployee, updateSalary, updateStatus } from '../controllers/salaryController.js'

const salaryRouter = express.Router()

salaryRouter.post('/create-salary', authMiddleware, createSalary)
salaryRouter.get('/', authMiddleware,getAllSalaries)
salaryRouter.get("/:id", authMiddleware, getSalary)
salaryRouter.put('/:id', authMiddleware, updateSalary)
salaryRouter.put('/:id/status', authMiddleware, updateStatus)
salaryRouter.get('/employee/:id', authMiddleware, getSalaryByEmployee)
salaryRouter.delete('/:id', authMiddleware, deleteSalary)


export default salaryRouter