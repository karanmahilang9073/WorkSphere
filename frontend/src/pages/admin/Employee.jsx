import {useState, useEffect} from 'react'
import { getUsers, updateUser, deleteUser } from '../../services/userService'
import { toast } from 'react-toastify'

function Employee() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getUsers()
                setEmployees(res)
            } catch (error) {
                console.error('error while fetcing employees', error)
                toast.error('failed to fetch employees')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleEdit = async(id, data) => {
        setError(null)
        try {
            const res = await updateUser(id, data)
            setEmployees(employees => employees.map(e => e._id === id ? res : e))
        } catch (error) {
            console.error('error while updating user', error)
            toast.error('failed to update user')
        } 
    }

    const handleDelete = async(id) => {
        setError(null)
        try {
            await deleteUser(id)
            setEmployees(employees => employees.filter(e => e._id !== id))
            toast.success('user deleted successfully')
        } catch (error) {
            console.error('failed to delete user', error)
            toast.error('failed to delete user')
        } 
    }


  return (
    <div className='p-4 bg-white shadow rounded-lg'>

        {/* heading */}
        <h2 className="text-xl font-semibold mb-4">Employees</h2>

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {/* error */}
        {error && (
            <div className="text-red-500 border-red-200 text-center py-4">{error}</div>
        )}

        {/* empty state */}
        {!loading && !error && employees.length === 0 && (
            <div className="text-gray-500 text-center py-4">no employee records found</div>
        )}

        {/* table */}
        {!loading && !error && employees.length > 0 && (
            <div className="overflow-x-auto">
                <table className='w-full border border-gray-200 rounded-lg'>
                    {/* table head */}
                    <thead className='bg-gray-100 text-left'>
                        <tr>
                            <th className='p-3 border-b'>Name</th>
                            <th className='p-3 border-b'>Email</th>
                            <th className='p-3 border-b'>Department</th>
                            <th className='p-3 border-b'>Role</th>
                            <th className='p-3 border-b'>Action</th>
                        </tr>
                    </thead>
                    
                    {/* table body */}
                    <tbody>
                       {employees.map((emp) => (
                        <tr key={emp._id} className='hover:bg-gray-100'>
                            <td className='p-3 border-b'>{emp.name}</td>
                            <td className='p-3 border-b'>{emp.email}</td>
                            <td className='p-3 border-b'>{emp.department}</td>
                            <td className='p-3 border-b'>{emp.role}</td>
                            
                            {/* actions */}
                            <td className='p-3 border-b text-center space-x-2'>
                                <button onClick={() => handleEdit(emp._id, emp)} className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-700'>
                                    edit
                                </button>
                                <button onClick={() => handleDelete(emp._id)} className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-700'>
                                    Remove
                                </button>
                            </td>
                        </tr>
                       ))}
                    </tbody>

                </table>
            </div>
        )}
        
      
    </div>
  )
}

export default Employee
