import {useState, useEffect} from 'react'
import SalaryCard from '../../components/salary/SalaryCard'
import { getSalaries } from '../../services/SalaryService'
import {toast} from 'react-toastify'


function MySalary() {
    const[salary, setSalary] = useState([])
    const [loading, setLoading] =  useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSalaries = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getSalaries()
                setSalary(res)
            } catch (error) {
                console.error('error fetching salaries',error)
                toast.error('failed to fetch salaries')
                setError('failed to fetch salaries')
            } finally {
                setLoading(false)
            }
        }
        fetchSalaries()
    }, [])


  return (
    <div className='p-6 space-y-6'>
        <h2 className="text-2xl font-bold">My Salary</h2>

        {/* error */}
        {error && (
            <div className="text-red-500 text-center py-6">{error}</div>
        )}

        {/* empty */ }
        {!loading && !error && salary.length === 0 && (
            <div className="text-center text-gray-600 py-10 ">
                No salary records found
            </div>
        )}

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            </div>
        )}

        {/* card */}
        {!loading && salary.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {salary.map((item) => (
                    <SalaryCard key={item._id} salary={item} />
                ))}
            </div>
        )}

      
    </div>
  )
}

export default MySalary
