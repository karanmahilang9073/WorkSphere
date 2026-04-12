import React, { useEffect, useState } from 'react'

function EditemployeeModal({show, onClose, employee, onSave}) {

    const [formData, setFormData] = useState({
        name : '',
        email : '',
        department  : '',
        role : '',
        salary : ''
    })
    const [error, setError] = useState({})
    
    useEffect(() => {
        if(employee) {
            setFormData(employee)
        }
    }, [employee])

    if(!show) return null

    const validate = () => {
        let newError = {}
        if(!formData.name.trim()) newError.name = 'name is required'
        if(!formData.email.trim()) newError.email = 'email is required'
        if(!formData.department.trim()) newError.department = 'department is required'
        if(!formData.salary.trim() || isNaN(formData.salary)) newError.salary = 'valid salary is required'
        setError(newError)
        return Object.keys(newError).length === 0
    }
    
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value})
    }

    const  handleSubmit = () => {
        if(!validate()) return
        onSave(formData)
        onClose()
    }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className='text-xl font-semibold mb-4'>Edit Employee</h2>

            <div className='mb-3'>
                <input type="text" name='name' value={formData.name} onChange={handleChange} placeholder='Name' className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' />
                {error.name && <p className='text-red-500 text-sm mt-1'>{error.name}</p>}
            </div>

            <div className='mb-3'>
                <input type="email" name='email' value={formData.email} onChange={handleChange} placeholder='Email' className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' />
                {error.email && <p className='text-red-500 text-sm mt-1'>{error.email}</p>}
            </div>

            <div className='mb-3'>
                <input type="text" name='department' value={formData.department} onChange={handleChange} placeholder='Department' className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' />
                {error.department && <p className='text-red-500 text-sm mt-1'>{error.department}</p>}
            </div>

            <div className='mb-3'>
                <input type="text" name='role' value={formData.role} onChange={handleChange} disabled placeholder='Role' className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' />
                {error.role && <p className='text-red-500 text-sm mt-1'>{error.role}</p>}
            </div>

            <div className='mb-4'>
                <input type="number" name='salary' value={formData.salary} onChange={handleChange} placeholder='Salary' className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' />
                {error.salary && <p className='text-red-500 text-sm mt-1'>{error.salary}</p>}
            </div>

            <div className="flex gap-3 justify-end">
                <button onClick={handleSubmit} className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'>Save</button>
                <button onClick={onClose} className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition'>Cancel</button>
            </div>
            
        </div>
      
    </div>
  )
}

export default EditemployeeModal
