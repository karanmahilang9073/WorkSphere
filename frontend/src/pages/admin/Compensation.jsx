import React, {useState, useEffect} from 'react'
import { getSalaries, updateSalary, deleteSalary } from '../../services/SalaryService'
import SalaryCard from '../../components/salary/SalaryCard'
import {toast} from 'react-toastify'


function Compensation() {
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getSalaries()
                setSalaries(res)
            } catch (error) {
                console.error('error while loading salaries', error)
                toast.error('failed to fetch tasks')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleUpdate = async(salaryId) => {
        setLoading(true)
        setError(null)
        try {
            const res = await updateSalary(salaryId)
            setSalaries(res)
            toast.success('salary updated successfully')
        } catch (error) {
            console.error('error while updating task', error)
            toast.error('failed to update salary')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async(salaryId) => {
        setLoading(true)
        setError(null)
        try {
            const res = await deleteSalary(salaryId)
            setSalaries(res)
            toast.success('salary deleted succesfully')
        } catch (error) {
            console.error('error while deleting salary', error)
            toast.error('failed to delete salary')
        } finally {
            setLoading(false)
        }
    }


  return (
    <div className='p-4 bg-white shadow rounded-lg'>
        {/* header */}
        <h2 className="text-xl font-semibold mb-4">Salary records</h2>

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {/* error */}
        {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
        )}

        {/* empty state */}
        {!loading && !error && salaries.length === 0 && (
            <div className="text-gray-500 text-center py-4">No salary records found</div>
        )}

        {/* salary grid */}
        {!loading && !error && salaries.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                {salaries.map((salary) => (
                    <div key={salary._id} className='flex flex-col gap-2'>
                        <SalaryCard salary={salary} />
                        <div className='flex gap-2'>
                            <button onClick={() => handleUpdate(salary._id)} className='flex-1 bg-blue-500 text-white py-1 rounded'>Edit</button>
                            <button onClick={() => handleDelete(salary._id)} className='flex-1 bg-red-500 text-white py-1 rounded'>Delete</button>
                        </div>
                    </div>
                ))}
                    
            </div>
        )}
      
    </div>
  )
}

export default Compensation
