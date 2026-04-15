import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import { getAllAttendance } from '../../services/attendanceService'
import { getSalaries } from '../../services/SalaryService'
import { toast } from 'react-toastify'

function EmpAnalytics() {
    const {employeeId} = useParams()
    const navigate = useNavigate()

    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStats = async() => {
            try {
                setLoading(true)
                setError(null)
                const [taskRes, leaveRes, attendanceRes,] = await Promise.all([
                    getTasks(),
                    getLeaves(),
                    getAllAttendance(),
                    getSalaries(),
                ])
                // filter by current employees
                const empTasks = taskRes.filter(t => t.assignedTo._id === employeeId)
                const empLeaves = leaveRes.filter(l => l.employee._id === employeeId)
                const empAttendance = attendanceRes.filter(a => a.employee._id === employeeId)
                // const empSalaries = salaryRes.filter(s => s.employee._id === employeeId)
                const empSalaries = []
               
                // calculate stats
                const stats = {
                    tasks : {
                        total : empTasks.length,
                        completed : empTasks.filter(t => t.status === 'completed').length,
                        pending : empTasks.filter(t => t.status !== 'completed').length
                    },
                    leaves : {
                        total : empLeaves.length,
                        completed : empLeaves.filter(t => t.status === 'approved').length,
                        pending : empLeaves.filter(t => t.status !== 'approved').length
                    },
                    attendances : {
                        total : empAttendance.length,
                        completed : empAttendance.filter(t => t.status === 'present').length,
                        pending : empAttendance.filter(t => t.status !== 'present').length
                    },
                    salaries : {
                        total : empSalaries.length,
                        completed : empSalaries.filter(t => t.status === 'paid').length,
                        pending : empSalaries.filter(t => t.status !== 'paid').length
                    },
                }
                setStats(stats)
            } catch (error) {
                console.error('error while loading stats', error)
                toast.error('failed to fetch eployee stats')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [employeeId])


  return (
    <div className='p-6'>
        
        {/* back button */}
        <button onClick={() => navigate('/admin/employees')} className='mb-4 bg-gray-400 text-white px-4 py-2 rounded'>go back</button>

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

        

        {/* stats card */}
        {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                
                <div className="bg-white shadow rounded-xl p-5">
                    <h2 className="text-gray-500 text-sm">Task completed</h2>
                    <p className="text-2xl font-bold">{stats?.tasks?.completed || 0}</p>
                </div>
                <div className="bg-white shadow rounded-xl p-5">
                    <h2 className="text-gray-500 text-sm">Leaves approved</h2>
                    <p className="text-2xl font-bold">{stats?.leaves?.completed || 0}</p>
                </div>
                <div className="bg-white shadow rounded-xl p-5">
                    <h2 className="text-gray-500 text-sm">Attendance days</h2>
                    <p className="text-2xl font-bold">{stats?.attendances?.completed || 0}</p>
                </div>
                <div className="bg-white shadow rounded-xl p-5">
                    <h2 className="text-gray-500 text-sm">Salary paid</h2>
                    <p className="text-2xl font-bold">{stats?.salaries?.completed || 0}</p>
                </div>
            </div>
        )}
      
    </div>
  )
}

export default EmpAnalytics
