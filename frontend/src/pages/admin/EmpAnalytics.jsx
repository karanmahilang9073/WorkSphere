import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployeeOverview } from '../../services/AnalyticsService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import { getAllAttendance } from '../../services/attendanceService'
import { getSalaries } from '../../services/SalaryService'
import { getUserProfile } from '../../services/userService'
import { toast } from 'react-toastify'
import {
    ArrowLeft,
    CheckSquare,
    Calendar,
    Clock,
    Banknote,
    User,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Building2,
    Mail
} from 'lucide-react'

function EmpAnalytics() {
    const { employeeId } = useParams()
    const navigate = useNavigate()

    const [stats, setStats] = useState(null)
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)

                // Try backend dedicated endpoint
                try {
                    const data = await getEmployeeOverview(employeeId)
                    if (data) {
                        setStats(data)
                        setEmployee(data.employee)
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.warn('Dedicated employee overview fallback:', e)
                }

                // Fallback aggregation
                const [taskRes, leaveRes, attendanceRes, salaryRes] = await Promise.all([
                    getTasks().catch(() => []),
                    getLeaves(1, 100).catch(() => ({})),
                    getAllAttendance(1, 100).catch(() => ({})),
                    getSalaries(1, 100).catch(() => ({}))
                ])

                const taskList = Array.isArray(taskRes) ? taskRes : (taskRes?.data || [])
                const leaveList = leaveRes?.leaves || (Array.isArray(leaveRes) ? leaveRes : [])
                const attList = attendanceRes?.attendance || (Array.isArray(attendanceRes) ? attendanceRes : [])
                const salList = salaryRes?.salaries || (Array.isArray(salaryRes) ? salaryRes : [])

                const empTasks = taskList.filter(t => (t.assignedTo?._id || t.assignedTo) === employeeId)
                const empLeaves = leaveList.filter(l => (l.employee?._id || l.employee) === employeeId)
                const empAttendance = attList.filter(a => (a.employee?._id || a.employee) === employeeId)
                const empSalaries = salList.filter(s => (s.employee?._id || s.employee) === employeeId)

                const totalEarnings = empSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0)

                setStats({
                    tasks: {
                        total: empTasks.length,
                        completed: empTasks.filter(t => t.status === 'completed').length,
                        pending: empTasks.filter(t => t.status !== 'completed').length
                    },
                    leaves: {
                        total: empLeaves.length,
                        approved: empLeaves.filter(l => l.status === 'approved').length,
                        pending: empLeaves.filter(l => l.status === 'pending').length,
                        rejected: empLeaves.filter(l => l.status === 'rejected').length
                    },
                    attendance: {
                        total: empAttendance.length,
                        present: empAttendance.filter(a => a.status === 'present').length,
                        late: empAttendance.filter(a => a.late).length,
                        halfDay: empAttendance.filter(a => a.status === 'half-day').length
                    },
                    salaries: {
                        total: empSalaries.length,
                        paid: empSalaries.filter(s => s.status === 'paid').length,
                        pending: empSalaries.filter(s => s.status !== 'paid').length,
                        totalEarnings
                    }
                })
            } catch (err) {
                console.error('error while loading stats', err)
                setError('Failed to fetch employee analytics')
                toast.error('Failed to fetch employee stats')
            } finally {
                setLoading(false)
            }
        }

        if (employeeId) {
            fetchStats()
        }
    }, [employeeId])

    return (
        <div className="space-y-6">
            {/* Top Bar with Go Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/employees')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Employees</span>
                </button>

                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                    Individual Performance View
                </span>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 mt-3">Loading employee performance metrics...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Employee Profile Header Card */}
                    {employee && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-xs">
                                    {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{employee.name}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" /> {employee.email}
                                        </span>
                                        {employee.department && (
                                            <>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    <Building2 className="w-3 h-3" /> {employee.department}
                                                </span>
                                            </>
                                        )}
                                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {employee.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Tasks Completed */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.tasks?.completed || 0}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {stats?.tasks?.pending || 0} Pending of {stats?.tasks?.total || 0} Total
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center text-xl shrink-0">
                                <CheckSquare className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Leaves Approved */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Leaves</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.leaves?.approved || 0}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {stats?.leaves?.pending || 0} Pending Approval
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Attendance Days */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Present</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.attendance?.present || 0}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {stats?.attendance?.late || 0} Late • {stats?.attendance?.halfDay || 0} Half-Day
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Salary Total Paid */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    ₹{(stats?.salaries?.totalEarnings || 0).toLocaleString('en-IN')}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {stats?.salaries?.paid || 0} Slips Paid
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center text-xl shrink-0">
                                <Banknote className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default EmpAnalytics
