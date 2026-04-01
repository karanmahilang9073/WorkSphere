import  { useEffect, useState } from 'react'

//services
import { getTasks } from '../../services/TaskService'
import { getMyAttendance } from '../../services/attendanceService'
import { getSalaries } from '../../services/SalaryService'
import { getLeaves } from '../../services/LeaveService'

//cards
import TaskCard from '../../components/task/TaskCard'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import SalaryCard from '../../components/salary/SalaryCard'
import LeaveCard from '../../components/leave/LeaveCard'

function Dashboard() {
    const [task, setTask] = useState([])
    const [attendance, setAttendance] = useState([])
    const [salary, setSalary] = useState(null)
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchData = async() => {
            try {
                setLoading(true)

                const taskRes = await getTasks()
                setTask(taskRes || [])

                const attendanceRes = await getMyAttendance()
                setAttendance(attendanceRes || [])

                const salaryRes = await getSalaries()
                setSalary(salaryRes || [])

                const leaveRes = await getLeaves()
                setLeaves(leaveRes || [])

            } catch (error) {
                console.error('dashboard fetch error', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if(loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        )
    }

  return (
    <div className='p-5 space-y-6 '>
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>

        {/* grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* tasks */}
            {task.map((t) => {
                return (
                    <TaskCard key={t._id} task={t} />
                )
            })}

            {/* attendance */}
            {attendance.map((a) => {
                return (
                    <AttendanceCard key={a._id} attendance={a} />
                )
            })}

            {/* salary */}
            {salary.map((s) => {
                return (
                    <SalaryCard key={s._id} salary={s} />
                )
            })}

            {/* leave */}
            {leaves.map((l) => {
                return (
                    <LeaveCard key={l._id} leave={l} />
                )
            })}

        </div>
    </div>
  )
}

export default Dashboard
