import { useState, useEffect } from 'react'
import { getAdminOverview } from '../../services/AnalyticsService'
import { getUsers } from '../../services/userService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import { getAllAttendance } from '../../services/attendanceService'
import { getSalaries } from '../../services/SalaryService'
import { toast } from 'react-toastify'
import {
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    CheckSquare,
    Banknote,
    TrendingUp,
    RefreshCw,
    Calendar,
    Briefcase,
    Building2,
    PieChart,
    BarChart3,
    ShieldAlert,
    QrCode,
    MapPin,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'

function Analytics() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchAnalyticsData = async () => {
        setLoading(true)
        setError(null)
        try {
            // First attempt: Dedicated Backend Analytics Endpoint
            try {
                const data = await getAdminOverview()
                if (data && data.workforce) {
                    setAnalytics(data)
                    setLoading(false)
                    return
                }
            } catch (apiErr) {
                console.warn('Backend analytics endpoint fallback:', apiErr)
            }

            // Fallback: Safe Aggregation from individual services
            const [userRes, taskRes, leaveRes, attendanceRes, salaryRes] = await Promise.all([
                getUsers(1, 100).catch(() => ({})),
                getTasks().catch(() => []),
                getLeaves(1, 100).catch(() => ({})),
                getAllAttendance(1, 100).catch(() => ({})),
                getSalaries(1, 100).catch(() => ({}))
            ])

            const users = userRes?.users || (Array.isArray(userRes) ? userRes : [])
            const tasks = Array.isArray(taskRes) ? taskRes : (taskRes?.data || taskRes?.tasks || [])
            const leaves = leaveRes?.leaves || (Array.isArray(leaveRes) ? leaveRes : [])
            const attendance = attendanceRes?.attendance || (Array.isArray(attendanceRes) ? attendanceRes : [])
            const salaries = salaryRes?.salaries || (Array.isArray(salaryRes) ? salaryRes : [])

            const totalEmployees = users.filter(u => u.role?.toLowerCase() === 'employee').length || users.length || 0
            const totalAdmins = users.filter(u => ['admin', 'hr'].includes(u.role?.toLowerCase())).length

            // Department count
            const deptMap = {}
            users.forEach(u => {
                if (u.department) {
                    deptMap[u.department] = (deptMap[u.department] || 0) + 1
                }
            })
            const departments = Object.entries(deptMap).map(([dept, count]) => ({ department: dept, count }))

            // Today's attendance
            const now = new Date()
            const todayStr = now.toISOString().split('T')[0]
            const todayAttendance = attendance.filter(a => {
                if (!a.date) return false
                return new Date(a.date).toISOString().split('T')[0] === todayStr
            })

            const todayPresent = todayAttendance.filter(a => a.status === 'present').length
            const todayHalfDay = todayAttendance.filter(a => a.status === 'half-day').length
            const todayLate = todayAttendance.filter(a => a.late).length
            const baseCount = totalEmployees > 0 ? totalEmployees : users.length || 1
            const attendancePercentage = Number(((todayPresent / baseCount) * 100).toFixed(1))

            // Tasks
            const completedTasks = tasks.filter(t => t.status === 'completed').length
            const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length
            const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'in-progress').length
            const highPriorityTasks = tasks.filter(t => t.priority === 'high').length
            const taskRate = tasks.length > 0 ? Number(((completedTasks / tasks.length) * 100).toFixed(1)) : 0

            // Leaves
            const approvedLeaves = leaves.filter(l => l.status === 'approved').length
            const pendingLeaves = leaves.filter(l => l.status === 'pending').length
            const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length

            // Payroll
            const totalPayroll = salaries.reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
            const totalDisbursed = salaries.filter(s => s.status === 'paid').reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
            const totalPending = salaries.filter(s => s.status !== 'paid').reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
            const avgSalary = salaries.length > 0 ? Math.round(totalPayroll / salaries.length) : 0

            setAnalytics({
                workforce: {
                    totalUsers: users.length,
                    employeesCount: totalEmployees,
                    adminCount: totalAdmins,
                    departments
                },
                attendance: {
                    todayTotalPunches: todayAttendance.length,
                    todayPresent,
                    todayHalfDay,
                    todayLate,
                    todayAbsent: Math.max(0, baseCount - todayPresent - todayHalfDay),
                    attendancePercentage,
                    methods: {
                        qr: todayAttendance.filter(a => a.checkInMethod === 'qr').length,
                        manual: todayAttendance.filter(a => a.checkInMethod === 'manual').length,
                        geo: todayAttendance.filter(a => a.checkInMethod === 'geo').length
                    }
                },
                tasks: {
                    total: tasks.length,
                    completed: completedTasks,
                    inProgress: inProgressTasks,
                    pending: pendingTasks,
                    highPriority: highPriorityTasks,
                    completionRate: taskRate
                },
                leaves: {
                    total: leaves.length,
                    approved: approvedLeaves,
                    pending: pendingLeaves,
                    rejected: rejectedLeaves,
                    types: []
                },
                payroll: {
                    totalPayroll,
                    totalDisbursed,
                    totalPending,
                    avgSalary,
                    slipsCount: salaries.length,
                    paidSlips: salaries.filter(s => s.status === 'paid').length,
                    pendingSlips: salaries.filter(s => s.status !== 'paid').length
                }
            })
        } catch (err) {
            console.error('Failed to load analytics', err)
            setError('Failed to aggregate organization analytics.')
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-[450px] bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center shadow-2xs">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-base font-bold text-slate-800 mt-4">Generating HRMS Analytics</h3>
                <p className="text-xs text-slate-400 mt-1">Aggregating workforce metrics, attendance, tasks, and payroll records...</p>
            </div>
        )
    }

    if (error && !analytics) {
        return (
            <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-2xs text-center">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                    <AlertCircle />
                </div>
                <h3 className="text-base font-bold text-slate-900">{error}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Please verify database connectivity and try again.</p>
                <button
                    onClick={fetchAnalyticsData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analytics</span>
                </button>
            </div>
        )
    }

    const { workforce, attendance, tasks, leaves, payroll } = analytics || {}

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                        HR & Workforce Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time intelligence on workforce distribution, punch compliance, task velocity, and payroll.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Dashboard
                    </div>

                    <button
                        onClick={fetchAnalyticsData}
                        title="Refresh analytics data"
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Workforce */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">
                            {workforce?.totalUsers || 0}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {workforce?.employeesCount || 0} Staff • {workforce?.adminCount || 0} Admin/HR
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Today's Attendance Rate */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Today's Attendance</p>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                            {attendance?.attendancePercentage || 0}%
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {attendance?.todayPresent || 0} Present • {attendance?.todayLate || 0} Late
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                {/* Task Velocity */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Task Completion</p>
                        <h3 className="text-2xl font-bold text-sky-700 mt-1">
                            {tasks?.completionRate || 0}%
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {tasks?.completed || 0} Done of {tasks?.total || 0} Tasks
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center text-xl shrink-0">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                </div>

                {/* Payroll Disbursed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Total Disbursed</p>
                        <h3 className="text-2xl font-bold text-violet-700 mt-1">
                            ₹{(payroll?.totalDisbursed || 0).toLocaleString('en-IN')}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {payroll?.paidSlips || 0} Paid • {payroll?.pendingSlips || 0} Pending
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center text-xl shrink-0">
                        <Banknote className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Row 2: Department Distribution & Attendance Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Department Headcount</h3>
                                    <p className="text-xs text-slate-400">Staff distribution by organizational division</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {workforce?.departments?.length || 0} Teams
                            </span>
                        </div>

                        {workforce?.departments?.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                No department data assigned yet.
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2">
                                {workforce?.departments?.map((dept, idx) => {
                                    const total = workforce?.totalUsers || 1
                                    const pct = Math.round((dept.count / total) * 100)
                                    const colors = [
                                        'from-indigo-500 to-indigo-600',
                                        'from-sky-500 to-sky-600',
                                        'from-emerald-500 to-emerald-600',
                                        'from-amber-500 to-amber-600',
                                        'from-rose-500 to-rose-600'
                                    ]
                                    const color = colors[idx % colors.length]

                                    return (
                                        <div key={dept.department} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-800">{dept.department}</span>
                                                <span className="text-slate-500">
                                                    <span className="font-bold text-slate-700">{dept.count}</span> ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Total active staff accounts: {workforce?.employeesCount || 0}</span>
                        <span className="font-semibold text-indigo-600">WorkSphere Directory</span>
                    </div>
                </div>

                {/* Today's Attendance Health Matrix */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Today's Attendance Matrix</h3>
                                    <p className="text-xs text-slate-400">Shift status and verification channel breakdown</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                {attendance?.todayTotalPunches || 0} Punches
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center">
                                <p className="text-[11px] font-semibold text-emerald-700">On Time</p>
                                <h4 className="text-xl font-bold text-emerald-800 mt-1">
                                    {Math.max(0, (attendance?.todayPresent || 0) - (attendance?.todayLate || 0))}
                                </h4>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-center">
                                <p className="text-[11px] font-semibold text-amber-700">Late In</p>
                                <h4 className="text-xl font-bold text-amber-800 mt-1">
                                    {attendance?.todayLate || 0}
                                </h4>
                            </div>

                            <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 text-center">
                                <p className="text-[11px] font-semibold text-sky-700">Half-Day</p>
                                <h4 className="text-xl font-bold text-sky-800 mt-1">
                                    {attendance?.todayHalfDay || 0}
                                </h4>
                            </div>

                            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-center">
                                <p className="text-[11px] font-semibold text-rose-700">Absent</p>
                                <h4 className="text-xl font-bold text-rose-800 mt-1">
                                    {attendance?.todayAbsent || 0}
                                </h4>
                            </div>
                        </div>

                        {/* Check-in Channels */}
                        <div className="space-y-2 mt-4">
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Punch Method Breakdown</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                                    <div>
                                        <p className="text-[10px] text-slate-400">QR Kiosk</p>
                                        <p className="font-bold text-slate-800">{attendance?.methods?.qr || 0}</p>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                    <div>
                                        <p className="text-[10px] text-slate-400">Geo-Fence</p>
                                        <p className="font-bold text-slate-800">{attendance?.methods?.geo || 0}</p>
                                    </div>
                                </div>

                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                                    <div>
                                        <p className="text-[10px] text-slate-400">Manual</p>
                                        <p className="font-bold text-slate-800">{attendance?.methods?.manual || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Attendance window syncs with configured dynamic shift schedules.
                    </div>
                </div>
            </div>

            {/* Row 3: Task Execution, Leaves, and Compensation Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Execution Matrix */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Task Velocity</h3>
                                <p className="text-xs text-slate-400">Work item progression metrics</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="my-4">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-medium text-slate-600">Completion Health</span>
                                <span className="font-bold text-slate-900">{tasks?.completionRate || 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${tasks?.completionRate || 0}%` }}
                                ></div>
                                <div
                                    className="bg-sky-400 h-full"
                                    style={{ width: `${tasks?.total ? (tasks.inProgress / tasks.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                                <span className="flex items-center gap-2 text-slate-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                                </span>
                                <span className="font-bold text-slate-900">{tasks?.completed || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                                <span className="flex items-center gap-2 text-slate-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> In Progress
                                </span>
                                <span className="font-bold text-slate-900">{tasks?.inProgress || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                                <span className="flex items-center gap-2 text-slate-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> To-Do / Pending
                                </span>
                                <span className="font-bold text-slate-900">{tasks?.pending || 0}</span>
                            </div>
                        </div>

                        {tasks?.highPriority > 0 && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>
                                    <strong className="font-bold">{tasks.highPriority}</strong> high priority item(s) require attention.
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Total {tasks?.total || 0} active task assignments.
                    </div>
                </div>

                {/* Leave & Absence Management */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Leave Requests</h3>
                                <p className="text-xs text-slate-400">Approval and absence load</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 my-4">
                            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
                                <p className="text-[10px] font-semibold text-emerald-700 uppercase">Approved</p>
                                <h4 className="text-xl font-bold text-emerald-800 mt-1">{leaves?.approved || 0}</h4>
                            </div>

                            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
                                <p className="text-[10px] font-semibold text-amber-700 uppercase">Pending</p>
                                <h4 className="text-xl font-bold text-amber-800 mt-1">{leaves?.pending || 0}</h4>
                            </div>

                            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-center">
                                <p className="text-[10px] font-semibold text-rose-700 uppercase">Rejected</p>
                                <h4 className="text-xl font-bold text-rose-800 mt-1">{leaves?.rejected || 0}</h4>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Leave Volume</p>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 text-slate-600">
                                <div className="flex justify-between">
                                    <span>Total Applications Filed</span>
                                    <span className="font-bold text-slate-900">{leaves?.total || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Approval Rate</span>
                                    <span className="font-bold text-emerald-600">
                                        {leaves?.total ? Math.round((leaves.approved / leaves.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Policy allows Paid, Sick, and Casual leave allocations.
                    </div>
                </div>

                {/* Compensation & Payroll Ledger */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                                <Banknote className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Payroll Ledger</h3>
                                <p className="text-xs text-slate-400">Financial distribution & averages</p>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 my-4">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Net Salary</p>
                            <h2 className="text-3xl font-black text-slate-900 mt-0.5">
                                ₹{(payroll?.avgSalary || 0).toLocaleString('en-IN')}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Calculated across {payroll?.slipsCount || 0} salary records</p>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100/60 rounded-xl text-emerald-800">
                                <span className="font-medium flex items-center gap-1.5">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Disbursed Payouts
                                </span>
                                <span className="font-bold">₹{(payroll?.totalDisbursed || 0).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-100/60 rounded-xl text-amber-800">
                                <span className="font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Liabilities
                                </span>
                                <span className="font-bold">₹{(payroll?.totalPending || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Total net payroll ledger: ₹{(payroll?.totalPayroll || 0).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
