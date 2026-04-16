import {useState, useEffect} from 'react'
import { getUsers } from '../../services/userService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import {toast} from 'react-toastify'
import {Link} from 'react-router-dom'


function Dashboard() {
    const [totalEmployees, setTotalEmployees] = useState(0)
    const [tasks, setTasks] = useState([])
    const [pendingLeaves, setPendingLeaves] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async() => {
            setLoading(true)
            try {
                const [userRes, taskRes, leaveRes] = await Promise.all([getUsers(), getTasks(), getLeaves()])
                setTotalEmployees(userRes.length)
                setTasks(taskRes)
                setPendingLeaves(leaveRes.filter(l => l.status === 'pending').length)
            } catch (error) {
                console.error('error while fetching stats', error)
                toast.error('failed to fetch stats')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if(loading){
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border border-t-4 border-blue-500"></div>
            </div>
        )
    }

  return (
    <div className='p-6 bg-gray-100'>
        {/* header */}
        <h1 className='text-3xl font-bold mb-5'>Admin dashboard</h1>

        {/* stat grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* employee */}
            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-gray-500">Total Employee</h2>
                <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            
            {/* tasks */}
            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-gray-500">Total tasks</h2>
                <p className="text-2xl font-bold">{tasks.length}</p>
            </div>

            {/* pending leaves */}
            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-gray-500">pending leaves</h2>
                <p className="text-2xl font-bold">{pendingLeaves}</p>
            </div>

        </div>

        {/* quick actions */}
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">quick actions</h2>

            <div className="flex flex-wrap gap-4">
                <Link to='/admin/employees' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700'>Employees</Link>

                <Link to='/admin/tasks' className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700'>Tasks</Link>

                <Link to='/admin/leaves' className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700'>Leaves</Link>

                <Link to='/admin/compensation' className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700'>compensation</Link>
            </div>
        </div>
      
    </div>
  )
}

export default Dashboard
