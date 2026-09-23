import { useState, useEffect, useContext, useMemo } from 'react'
import { getUsers } from '../../services/userService'
import { getTasks } from '../../services/TaskService'
import { getLeaves } from '../../services/LeaveService'
import { getAllAttendance } from '../../services/attendanceService'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import ChatBox from '../../components/ai/ChatBox'
import { AuthContext } from '../../context/AuthContext'
import {
    Users,
    Clock,
    Calendar,
    ListTodo,
    ArrowUpRight,
    UserPlus,
    Timer,
    MapPin,
    DollarSign,
    BarChart3,
    Sparkles,
    Shield,
    CheckCircle2,
    AlertCircle,
    Building2,
    RefreshCw,
    QrCode,
    ChevronRight,
    TrendingUp
} from 'lucide-react'

const AVATAR_GRADIENTS = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
]

const getInitials = (name) => {
    if (!name) return "EM"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

function Dashboard() {
    const [employees, setEmployees] = useState([])
    const [tasks, setTasks] = useState([])
    const [leaves, setLeaves] = useState([])
    const [recentAttendance, setRecentAttendance] = useState([])
    const [loading, setLoading] = useState(true)

    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [userRes, taskRes, leaveRes, attRes] = await Promise.allSettled([
                getUsers(1, 100),
                getTasks(),
                getLeaves(1, 50),
                getAllAttendance(1, 8)
            ])

            if (userRes.status === 'fulfilled') {
                const userList = userRes.value?.users || (Array.isArray(userRes.value) ? userRes.value : [])
                setEmployees(userList)
            }
            if (taskRes.status === 'fulfilled') {
                setTasks(Array.isArray(taskRes.value) ? taskRes.value : [])
            }
            if (leaveRes.status === 'fulfilled') {
                const leaveList = leaveRes.value?.leaves || (Array.isArray(leaveRes.value) ? leaveRes.value : [])
                setLeaves(leaveList)
            }
            if (attRes.status === 'fulfilled') {
                const attList = attRes.value?.attendance || (Array.isArray(attRes.value) ? attRes.value : [])
                setRecentAttendance(attList)
            }
        } catch (error) {
            console.error('Error fetching dashboard data', error)
            toast.error('Failed to load dashboard metrics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // Time of day greeting
    const hour = new Date().getHours()
    let greeting = "Good Evening"
    if (hour < 12) {
        greeting = "Good Morning"
    } else if (hour < 16) {
        greeting = "Good Afternoon"
    }

    const todayDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    })

    // Computed Stats
    const pendingLeaves = useMemo(() => {
        return leaves.filter(l => l.status === 'pending')
    }, [leaves])

    const departmentStats = useMemo(() => {
        const counts = {}
        employees.forEach(emp => {
            const dept = emp.department || 'General'
            counts[dept] = (counts[dept] || 0) + 1
        })
        return counts
    }, [employees])

    const todayCheckedInCount = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10)
        return recentAttendance.filter(a => {
            if (!a.date) return false
            const d = new Date(a.date).toISOString().slice(0, 10)
            return d === todayStr || a.checkIn
        }).length
    }, [recentAttendance])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-xs font-medium">Loading HRMS enterprise workspace...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Executive Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                <Shield className="w-3.5 h-3.5" />
                                {user?.role || "Admin"} Portal
                            </span>
                            <span className="text-xs text-slate-400">
                                {todayDate}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {greeting}, {user?.name || "Admin"}!
                        </h1>
                        <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
                            WorkSphere organization health is optimal. Monitor daily attendance, shift logs, pending approvals, and workforce productivity.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {user?.role === "Admin" && (
                            <Link
                                to="/admin/create-user"
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Add Employee</span>
                            </Link>
                        )}
                        <Link
                            to="/admin/attendance"
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                        >
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span>Attendance Logs</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Top 4 Enterprise KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Workforce */}
                <Link
                    to="/admin/employees"
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Total Workforce
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {employees.length}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                Across {Object.keys(departmentStats).length || 1} Departments
                            </span>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                        <span>View Employee Directory</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </Link>

                {/* 2. Today's Attendance */}
                <Link
                    to="/admin/attendance"
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Today's Attendance
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {todayCheckedInCount > 0 ? `${todayCheckedInCount} Active` : "Logged"}
                            </h3>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Real-time Shift Tracking
                            </span>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                        <span>Check Live Punches</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </Link>

                {/* 3. Pending Leaves */}
                <Link
                    to="/admin/leaves"
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Pending Leaves
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {pendingLeaves.length}
                            </h3>
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Requires Review
                            </span>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
                        <span>Review Leave Requests</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </Link>

                {/* 4. Active Tasks */}
                <Link
                    to="/admin/tasks"
                    className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Operational Tasks
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {tasks.length}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                Workflows & Goals
                            </span>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ListTodo className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
                        <span>Assign & Track Tasks</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Main Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Columns: Live Feed, Dept Distribution, and Quick Hub */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Check-Ins & Attendance Log */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Recent Attendance Activity</h3>
                                    <p className="text-[11px] text-slate-500">Live employee check-in logs and shift punctuality</p>
                                </div>
                            </div>
                            <Link
                                to="/admin/attendance"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <span>Full Table</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {recentAttendance.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-medium">No check-ins recorded yet today.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentAttendance.slice(0, 5).map((att, idx) => {
                                    const empName = att.employee?.name || "Staff Member"
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                                    const timeStr = att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'

                                    return (
                                        <div key={att._id || idx} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                                    {getInitials(empName)}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-800 block">
                                                        {empName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 capitalize">
                                                        {att.shift || att.shiftType || "General"} Shift
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-right">
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-700 block">
                                                        {timeStr}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {att.checkInMethod === 'qr' ? 'QR Scan' : 'Geo-Fence'}
                                                    </span>
                                                </div>

                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    att.status === 'present'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : att.status === 'half-day'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {att.late ? 'Late' : (att.status || 'Present')}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Department Workforce Distribution</h3>
                                    <p className="text-[11px] text-slate-500">Personnel allocation across company branches</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(departmentStats).map(([dept, count]) => {
                                const total = employees.length || 1
                                const percent = Math.round((count / total) * 100)

                                return (
                                    <div key={dept} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                                            <span>{dept}</span>
                                            <span className="text-indigo-600 font-bold">{count} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* HR Management Quick Access Hub */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">HR Administration Hub</h3>
                        <p className="text-[11px] text-slate-500 mb-4">Fast-access controls for company policies and personnel modules</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Link
                                to="/admin/employees"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <Users className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Directory</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Staff & Roles</p>
                            </Link>

                            <Link
                                to="/admin/shifts"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <Timer className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Shift Timings</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Hours & Grace</p>
                            </Link>

                            <Link
                                to="/admin/geo-fence"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <MapPin className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Geo-Fence</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">GPS Perimeter</p>
                            </Link>

                            <Link
                                to="/admin/leaves"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <Calendar className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Leave Requests</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Approve PTO</p>
                            </Link>

                            <Link
                                to="/admin/tasks"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <ListTodo className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Tasks</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Workflows</p>
                            </Link>

                            <Link
                                to="/admin/compensation"
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition group text-left"
                            >
                                <DollarSign className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-slate-800">Compensation</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Salaries & Payroll</p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Approvals & Smart AI Assistant */}
                <div className="space-y-6">
                    {/* Pending Leave Approvals Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                <h3 className="text-sm font-bold text-slate-900">Pending Leave Approvals</h3>
                            </div>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px] border border-amber-200">
                                {pendingLeaves.length} Action Needed
                            </span>
                        </div>

                        {pendingLeaves.length === 0 ? (
                            <div className="py-6 text-center text-slate-400">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                                <p className="text-xs font-medium text-slate-700">All caught up!</p>
                                <p className="text-[11px] text-slate-400">No pending leave applications.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {pendingLeaves.slice(0, 3).map((leave) => (
                                    <div key={leave._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-slate-800 block">
                                                    {leave.employee?.name || "Staff Member"}
                                                </span>
                                                <span className="text-[11px] text-indigo-600 font-medium capitalize">
                                                    {leave.type || "Casual"} Leave
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        {leave.reason && (
                                            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                                                "{leave.reason}"
                                            </p>
                                        )}
                                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-end">
                                            <Link
                                                to="/admin/leaves"
                                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                                            >
                                                <span>Review Application</span>
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Workplace AI Copilot */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[460px]">
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900">WorkSphere AI Copilot</h3>
                                    <p className="text-[10px] text-slate-500">Ask HR policies, shift rules & assistance</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0">
                            <ChatBox />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
