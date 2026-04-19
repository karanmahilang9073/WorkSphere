import React, {useState, useEffect} from 'react'
import { getSalaries, deleteSalary, updateStatus } from '../../services/SalaryService'
import SalaryCard from '../../components/salary/SalaryCard'
import {toast} from 'react-toastify'
import SalaryModal from '../../components/salary/SalaryModal'
import EditSalary from '../../components/salary/EditSalary'
import { predictSalary } from '../../services/AiService'



function Compensation() {
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [editingSalary, setEditingSalary] = useState(null)

    const [aiResult, setAiresult] = useState("")

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getSalaries()
                setSalaries(res)
            } catch (error) {
                console.error('error while loading salaries', error)
                toast.error('failed to fetch salaries')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleDelete = async(salaryId) => {
        setError(null)
        try {
            await deleteSalary(salaryId)
            setSalaries(prev => prev.filter(s => s._id !== salaryId))
            toast.success('salary deleted successfully')
        } catch (error) {
            console.error('error while deleting salary', error)
            toast.error('failed to delete salary')
        } finally {
            setLoading(false)
        }
    }

    const handleStatus = async(salaryId, currentStatus) => {
        setError(null)
        setLoading(true)
        try {
            const nextStatus = currentStatus === 'pending' ? 'processing' : 'paid'
            const res = await updateStatus(salaryId, nextStatus)
            setSalaries(prev => prev.map(s => s._id === salaryId ? res.salary : s))
            toast.success('salary status updated successfully')
        } catch (error) {
            console.error('error while updating salary status ', error)
            toast.error('failed to update salary status')
        } finally {
            setLoading(false)
        }
    }

    const handlePredict = async(employeeId) => {
        setError(null)
        setLoading(true)
        try {
            const res = await predictSalary(employeeId)
            setAiresult(res)
        } catch (error) {
            console.error('error while predicting salary',error)
            toast.error('failed to predict salary')
        } finally {
            setLoading(false)
        }
    } 


  return (
    <div className='p-4 bg-white shadow rounded-lg'>
        {/* header */}
        <h2 className="text-xl font-semibold mb-4">Salary records</h2>

        {/* create salary button */}
        <button onClick={() => setShowModal(true)} className='bg-green-500 text-white px-4 py-2 rounded mb-4'>Create salary</button>

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
                        <SalaryCard salary={salary} onStatusUpdate={handleStatus}  />
                        <div className='flex gap-2'>
                            <button onClick={() => setEditingSalary(salary)} disabled={salary.status === 'paid'} className={`flex-1 py-1 rounded ${salary.status === 'paid' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'}`}>Edit</button>
                            <button onClick={() => handleDelete(salary._id)} className='flex-1 bg-red-500 text-white py-1 rounded'>Delete</button>
                            <button onClick={() => handlePredict(salary.employee)} className='bg-indigo-500 text-white py-1 rounded'>Predict salary</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* predicted salary */}
        {aiResult && (
            <div className="mt-4 p4 bg-gray-100 rounded">
                <h3 className="font-semibold">AI predicion</h3>
                <p className="text-sm whitespace-pre-wrap">{aiResult}</p>
            </div>
        )}
      
        {/* salary modal */}
        {showModal && <SalaryModal onClose={() => setShowModal(false)} />}

        {/* editing salary */}
        {editingSalary && (
            <EditSalary salary={editingSalary} onClose={() => setEditingSalary(null)} onUpdate={(updateSalary) => setSalaries(prev => prev.map(s => s._id === updateSalary._id ? updateSalary : s))} />
        )}
 
    </div>
  )
}

export default Compensation
