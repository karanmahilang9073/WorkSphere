import {useState, useEffect} from 'react'
import { getUsers, updateUser, deleteUser } from '../../services/userService'
import { toast } from 'react-toastify'
import EditemployeeModal from '../../components/common/EditemployeeModal'
import { useNavigate } from 'react-router-dom'
import { getPerformance } from '../../services/AiService'



function Employee() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] =  useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [searchEmp, setSearchEmp] = useState('')
    const [viewModal, setViewModal] = useState(false)

    const [aiPerformance, setAiPerformance] = useState('')

    const navigate = useNavigate()

    const filterEmp = employees.filter(emp => emp.name.toLowerCase().includes(searchEmp.toLowerCase()) || emp.email.toLowerCase().includes(searchEmp.toLowerCase()))

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

    const handleEdit = async( data) => {
        setError(null)
        const id = selectedEmployee._id
        try {
            const res = await updateUser(id, data)
            setEmployees(employees => employees.map(e => e._id === id ? res.user : e))
            setShowModal(false)
            toast.success('user updated successfully')
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

    const handleView = (emp) => {
        setSelectedEmployee(emp)
        setViewModal(true)
    }

    const handlePerformance = async(employeeId) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getPerformance(employeeId)
            setAiPerformance(res)
            toast.success('performance insight get successfullly')
        } catch (error) {
            console.error('error while fetching performance insight', error)
            toast.error('failed to get performance insight')
        } finally {
            setLoading(false)
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

        {/* searchbar */}
        <input type="text" placeholder='search by name or email' value={searchEmp} onChange={(e) => setSearchEmp(e.target.value)} className='w-full border p-2 mb-4' />

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
                       {filterEmp.map((emp) => (
                        <tr key={emp._id} className='hover:bg-gray-100'>
                            <td className='p-3 border-b'>{emp.name}</td>
                            <td className='p-3 border-b'>{emp.email}</td>
                            <td className='p-3 border-b'>{emp.department}</td>
                            <td className='p-3 border-b'>{emp.role}</td>
                            <td className="p-3 border-b">
                                <button onClick={() => handleView(emp)} className='bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm'>View</button>
                                <button onClick={() => {setSelectedEmployee(emp); setShowModal(true)}} className='bg-yellow-500 text-white px-2 py-1 rounded text-sm mr-2'>edit</button>
                                <button onClick={() => handleDelete(emp._id)} className='bg-red-500 text-white px-2 py-1 rounded text-sm'>Delete</button>
                                <button onClick={() => navigate(`/admin/employee-analytics/${emp._id}`)} className='bg-purple-500 text-white px-2 py-1 rounded mr-2 text-sm'>view analytics</button>
                                <button onClick={() => {handlePerformance(emp._id); setSelectedEmployee(emp)}} className='bg-indigo-500  text-white px-2 py-1 rounded text-sm mr-2'>AI report</button>
                            </td>
                        </tr>
                       ))}
                    </tbody>
                </table>
            </div>  
        )}

        {aiPerformance && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">AI performance report for:- {selectedEmployee?.name}</h3>
                <p className="text-sm whitespace-pre-wrap">{aiPerformance}</p>
            </div>
        )}

        {viewModal && selectedEmployee && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{selectedEmployee.name}</h3>
            
            <div className="space-y-4 mb-6">
                <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold">{selectedEmployee.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-lg font-semibold">{selectedEmployee.department}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold">{selectedEmployee.role}</p>
                </div>
            </div>
            
            <button onClick={() => setViewModal(false)} className="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Close</button>
        </div>
    </div>
        )}
        
      <EditemployeeModal show={showModal} onClose={() => setShowModal(false)} employee={selectedEmployee} onSave={handleEdit} />

        
    </div>
  )
}

export default Employee
