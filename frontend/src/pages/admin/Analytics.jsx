import {useState, useEffect} from 'react'
import { getUsers } from '../../services/userService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import { getAllAttendance } from '../../services/attendanceService'
import { getSalaries } from '../../services/SalaryService'
import { toast } from 'react-toastify'



function Analytics() {
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAnalytics = async() => {
            try {
                setLoading(true)
                setError(null)
                const [userRes, taskRes, leaveRes, attendanceRes, salaryRes] = await Promise.all([
                    getUsers(),
                    getTasks(),
                    getLeaves(),
                    getAllAttendance(),
                    getSalaries(),
                ])

                const user = userRes || []
                const attendance = attendanceRes || []
                const leave = leaveRes || []
                const task = taskRes || []
                const salary = salaryRes ||[]

                // calculation
                // total employees
                const totalEmployees = user.length 
                // attendance %
                const present = attendance.filter(a => a.status === "present").length
                const attendancePercentage = attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0
                // leave stats
                const approvedLeave = leave.filter(l => l.status ===  'approved').length
                const pendingLeave = leave.filter(l => l.status ===  'pending').length
                // task stats
                const completedTask = task.filter(t => t.status === "completed").length
                const pendingTask = task.filter(t => t.status !== "completed").length
                // salary stats
                const totalSalary = salary.reduce((sum, s) => sum + (s.netSalary || 0), 0)
                const avgSalary = salary.length > 0 ? (totalSalary / salary.length).toFixed(0) : 0

                const finalStats = {
                    totalEmployees,
                    attendancePercentage,
                    task : {
                        completed : completedTask,
                        pending : pendingTask,
                    },
                    leave : {
                        completed : approvedLeave,
                        pending : pendingLeave
                    },
                    salary : {
                        total : totalSalary,
                        average : avgSalary,
                    }
                }
                setStats(finalStats)
            } catch (error) {
                console.error('error while loading stats', error)
                setError('failed to load analytic')
                toast.error('failed to load stats')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
     }, [])


  return (
    <div className='p-6 grid grid-cols-1 lg:grid-cols-3 gap-6'>

        <div className="lg:col-span-2">

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

        {/* header */}
        <h1 className="text-2xl font-bold mb-6">Dashboard Analytic</h1>

        {/* grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* total employees */}
            <div className="bg-white shadow rounded-xl p-5">
                <h2 className='text-gray-500 text-sm'>Total Employees</h2>
                <p className="text-2xl font-bold mt-2">
                    {stats?.totalEmployees || 0}
                </p>
            </div>

            {/* attendance */}
            <div className="bg-white shadow rounded-xl p-5">
                <h2 className="text-gray-500 text-sm">Attendance %</h2>
                <p className="text-2xl font-bold mt-2">
                    {stats.attendancePercentage || 0}%
                </p>
            </div>

            {/* completed task */}
            <div className="bg-white shadow rounded-xl p-5">
                <h2 className="text-gray-500 text-sm">Completed Task</h2>
                <p className='text-2xl font-bold mt-2'>
                    {stats?.task?.completed || 0}
                </p>
            </div>

            {/* approved leaves */}
            <div className="bg-white shadow rounded-xl p-5">
                <h2 className="text-gray-500 text-sm">Approved leaves</h2>
                <p className="text-2xl font-bold mt-2">
                    {stats?.leave?.completed || 0}
                </p>
            </div>

            {/* avg salary */}
            <div className="bg-white shadow rounded-xl p-5">
                <h2 className="text-gray-500 text-sm">Avg Salary</h2>
                <p className="text-2xl font-bold mt-2">
                    ₹{stats?.salary?.average}
                </p>
            </div>
        </div>

        </div>

       
    </div>
  )
}

export default Analytics
