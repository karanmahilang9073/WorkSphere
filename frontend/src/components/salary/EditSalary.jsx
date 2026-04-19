import React, { useState } from 'react'
import { updateSalary } from '../../services/SalaryService'
import { toast } from 'react-toastify'

function EditSalary({salary, onClose, onUpdate}) {
    const [baseSalary, setBaseSalary] = useState(salary.baseSalary)
    const [allowance, setAllowance] = useState(salary.allowance)
    const [deduction, setDeduction] = useState(salary.deduction)
    const [loading, setLoading] = useState(false)

    const netSalary = (baseSalary || 0) + (allowance || 0) - (deduction || 0)

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateSalary(salary._id, {baseSalary, allowance, deduction})
            onUpdate(res.data)
            toast.success('salary updated successfully')
            onClose()
        } catch (error) {
            console.error('failed to update salary', error)
            toast.error('failed to update salary')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
        <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Salary</h2>
            <form onSubmit={handleSubmit}>
                <input type="number" placeholder='base salary' value={baseSalary} onChange={(e) => setBaseSalary(Number(e.target.value))} className='w-full border p-2 mb-3 rounded' required />
                <input type="number" placeholder='allowance' value={allowance} onChange={(e) => setAllowance(Number(e.target.value))} className='w-full border p-2 mb-3 rounded'/>
                <input type="number" placeholder='deduction' value={deduction} onChange={(e) => setDeduction(Number(e.target.value))} className='w-full border p-2 mb-3 rounded'/>
                <div className="bg-gray-100 p-2 rounded mb-4">
                    <p>Net Salary: ₹{netSalary}</p>
                </div>
                <div className="flex gap-2">
                    <button type='submit' disabled={loading} className='flex-1 bg-blue-500 text-white py-2 rounded'>Save</button>
                    <button type='submit' onClick={onClose} className='flex-1 bg-gray-500 text-white py-2 rounded'>Cancel</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default EditSalary
