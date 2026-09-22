import {useState, useEffect, useContext} from 'react'
import { getUsers } from '../../services/userService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import {toast} from 'react-toastify'
import {Link} from 'react-router-dom'
import ChatBox from '../../components/ai/ChatBox'
import { AuthContext } from '../../context/AuthContext'


function Dashboard() {
    const [totalEmployees, setTotalEmployees] = useState(0)
    const [tasks, setTasks] = useState([])
    const [pendingLeaves, setPendingLeaves] = useState(0)
    const [loading, setLoading] = useState(true)

    const {user} = useContext(AuthContext)

    useEffect(() => {
        const fetchStats = async() => {
            setLoading(true)
            try {
                const [userRes, taskRes, leaveRes] = await Promise.all([getUsers(), getTasks(), getLeaves()])
                setTotalEmployees(userRes.length)
                setTasks(taskRes)
                setPendingLeaves(leaveRes.leaves.filter(l => l.status === 'pending').length)
            } catch (error) {
                console.error('error while fetching stats', error)
                toast.error('failed to fetch stats')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    })

    const hour = new Date().getHours()
    let greeting = "Good Evening";
    if(hour < 12){
        greeting = "Good Morning";
    } else if(hour < 16){
        greeting = "Good Afternoon";
    }

    if(loading){
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border border-t-4 border-blue-500"></div>
            </div>
        )
    }

  return (
    <div className='flex h-screen'>

        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">

        {/* left side - dashboard */}
        {/* header */}
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold">👋{greeting}, {user.name}!</h2>
            <p className="text-gray-600 mt-2">Role: {user.role}</p>
            <p className="text-gray-800 text-sm ">Today: {today}</p>
        </div>

        {/* stat grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-10">

            {/* employee */}
            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-gray-500">Total {user.role === "Admin" ? "users" : "Employees"}</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to='/admin/employees' className='bg-blue-200 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition h-30 flex flex-col justify-between'>
                    <h3 className="text-lg font-semibold text-blue-700">👥 {user.role === "Admin" ? "users" : "Employees"}</h3>
                    <p className="text-sm text-gray-600 mt-2">Manage {user.role === "Admin" ? "Users" : "Employees"}</p>
                </Link>

                <Link to='/admin/tasks' className='bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-lg transition h-30 flex flex-col justify-between'>
                    <h3 className="text-lg font-semibold text-green-700">📋 Tasks</h3>
                    <p className="text-sm text-gray-600 mt-2">Assign and Manage Tasks</p>
                </Link>

                <Link to='/admin/leaves' className='bg-yellow-50 border border-yellow-200 rounded-xl p-5 hover:shadow-lg transition h-30 flex flex-col justify-between'>
                    <h3 className="text-lg font-semibold text-yellow-700">🏖 Leaves</h3>
                    <p className="text-sm text-gray-600 mt-2">Review and requests</p>
                </Link>

                <Link to='/admin/compensation' className='bg-purple-50 border border-purple-200 rounded-xl p-3 hover:shadow-lg transition h-30 flex flex-col justify-between'>
                    <h3 className="text-lg font-semibold text-purple-700 textc">💰 Compensation</h3>
                    <p className="text-sm text-gray-600 mt-2">Manage Employee Salaries</p>
                </Link>
            </div>
        </div>

        </div>

        {/* right side chatboax */}
        <div className="w-80 p-4 bg-white shadow flex flex-col h-120">
            <h2 className="text-xl font-semibold mb-3">AI assistant</h2>
            <div className="flex-1 min-h-0">
                <ChatBox />
            </div>
        </div>

        
    </div>
  )
}

export default Dashboard
