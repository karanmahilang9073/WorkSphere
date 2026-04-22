import React, { useEffect, useState } from 'react'
import { createSalary } from '../../services/SalaryService'
import { getUsers } from '../../services/userService'
import {toast} from 'react-toastify'

function SalaryModal({onClose}) {
    const [employees, setEmployees] = useState([])
    const [formData, setFormData] = useState({
        employee : '',
        baseSalary : '',
        allowance : '',
        deduction : '',
        month : '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchEmployee = async() => {
            try {
                const res = await getUsers()
                setEmployees(res)
            } catch (error) {
                console.error('failed to fetch employees', error)
            }
        }
        fetchEmployee()
    }, [])

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData(prev => ({...prev, [name] : value}))
    }

    const handleCreate = async(e) => {
        e.preventDefault()
        if(!formData.employee || !formData.baseSalary || !formData.month) {
            toast.error('please fill required fields')
            return
        }
        setLoading(true)
        try {
            await createSalary(formData)
            toast.success('salary created successfully')
            onClose()
            setFormData({employee: '', baseSalary: '', allowance: '', deduction: '', month: ''})
        } catch (error) {
            console.error('failed to create salary',error)
            toast.error('failed to create salary')
        } finally {
            setLoading(false)
        }
    }


  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create salary</h2>

        {/* form */}
        <form onSubmit={handleCreate} className='space-y-4'>
            {/* employee dropdown */}
            <div >
                <label className="block text-sm font-medium mb-1">Employee *</label>
                <select name="employee" value={formData.employee} onChange={handleChange} className='w-full border px-3 py-2'>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option value={emp._id} key={emp._id}>{emp.name}</option>
                    ))}
                </select>
            </div>

                {/* base salary */}
                <div>
                    <label className='block text-sm font-medium mb-1'>Base salary</label>
                    <input type="number" name='baseSalary' value={formData.baseSalary} onChange={handleChange} className='w-full border rounded px-3 py-2' />
                </div>

                {/* allowance */}
                <div>
                    <label className='block text-sm font-medium mb-1'>Allowance</label>
                    <input type="number" name='allowance' value={formData.allowance} onChange={handleChange} className='w-full border rounded px-3 py-2' />
                </div>

                {/* deduction */}
                <div>
                    <label className='block text-sm font-medium mb-1'>Deduction</label>
                    <input type="number" name='deduction' value={formData.deduction} onChange={handleChange} className='w-full border rounded px-3 py-2' />
                </div>

                {/* month */}
                <div>
                    <label className='block text-sm font-medium mb-1'>Month</label>
                    <input type="date" name='month' value={formData.month} onChange={handleChange} className='w-full border rounded px-3 py-2' />
                </div>

                {/* button */}
                <button type='submit' disabled={loading} className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>{loading ? 'creating...' : 'create salary'}</button>
        </form>
      </div>
    </div>
  )
}

export default SalaryModal
