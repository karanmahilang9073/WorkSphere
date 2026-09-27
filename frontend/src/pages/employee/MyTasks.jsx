import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteTask, getTasks, updateStatus } from '../../services/TaskService'
import TaskCard from '../../components/task/TaskCard'
import { toast } from 'react-toastify'
import { useSocket } from '../../context/SocketContext'
import {
    ListTodo,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    CheckSquare,
    Filter,
    Table as TableIcon,
    LayoutGrid,
    ArrowRight,
    Check,
    Timer,
    CircleDot,
    RefreshCw,
    ExternalLink
} from 'lucide-react'

const PRIORITY_STYLES = {
    high: "bg-rose-50 text-rose-700 border-rose-200/80",
    medium: "bg-amber-50 text-amber-700 border-amber-200/80",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200/80"
}

const STATUS_STYLES = {
    pending: { label: "Pending", badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-500" },
    "in-progress": { label: "In Progress", badge: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-500 animate-pulse" },
    completed: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" },
    missed: { label: "Missed", badge: "bg-rose-50 text-rose-700 border-rose-200/80", dot: "bg-rose-500" }
}

function MyTasks() {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // View mode: 'table' (default) or 'grid'
    const [viewMode, setViewMode] = useState('table')

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [priorityFilter, setPriorityFilter] = useState('ALL')

    const [updatingId, setUpdatingId] = useState(null)

    const fetchTasks = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getTasks()
            setTasks(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('error while fetching task', err)
            toast.error('Failed to fetch tasks')
            setError('Failed to fetch tasks')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const { socket } = useSocket()

    useEffect(() => {
        if (!socket) return
        socket.on('task-assigned', (newTask) => {
            setTasks(prev => [newTask, ...prev])
            toast.success('New task assigned to you!')
        })
        return () => socket.off('task-assigned')
    }, [socket])

    const handleComplete = async (id, e) => {
        if (e) e.stopPropagation()
        setUpdatingId(id)
        try {
            const updated = await updateStatus(id, "completed")
            setTasks(prev => prev.map(t => t._id === id ? updated : t))
            toast.success('Task marked as completed!')
        } catch (err) {
            console.error('failed to complete task', err)
            toast.error(err?.message || 'Failed to complete task')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleQuickStatus = async (id, newStatus, e) => {
        if (e) e.stopPropagation()
        setUpdatingId(id)
        try {
            const updated = await updateStatus(id, newStatus)
            setTasks(prev => prev.map(t => t._id === id ? updated : t))
            toast.success(`Task moved to ${newStatus.replace('-', ' ')}`)
        } catch (err) {
            console.error('failed to update status', err)
            toast.error(err?.message || 'Failed to update status')
        } finally {
            setUpdatingId(null)
        }
    }

    // Filter logic
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch =
                !searchQuery.trim() ||
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'in-progress'
                    ? ['in-progress', 'inprogress'].includes(task.status)
                    : task.status === statusFilter)

            const matchesPriority =
                priorityFilter === 'ALL' ||
                task.priority?.toLowerCase() === priorityFilter.toLowerCase()

            return matchesSearch && matchesStatus && matchesPriority
        })
    }, [tasks, searchQuery, statusFilter, priorityFilter])

    // KPI Metrics
    const metrics = useMemo(() => {
        const total = tasks.length
        const completed = tasks.filter(t => t.status === 'completed').length
        const inProgress = tasks.filter(t => ['in-progress', 'inprogress'].includes(t.status)).length
        const pending = tasks.filter(t => t.status === 'pending').length
        const highPriority = tasks.filter(t => t.priority?.toLowerCase() === 'high' && t.status !== 'completed').length

        return { total, completed, inProgress, pending, highPriority }
    }, [tasks])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                        <ListTodo className="w-6 h-6 text-indigo-600" />
                        My Tasks & Deliverables
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track your assigned tasks, update progress milestones, and manage project deadlines.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchTasks}
                        title="Refresh task list"
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Metrics Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.total}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Assigned to you</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                        <ListTodo className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
                        <h3 className="text-2xl font-bold text-blue-700 mt-0.5">{metrics.inProgress}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Active workloads</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                        <Timer className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">{metrics.completed}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}% velocity
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Pending Action</p>
                        <h3 className="text-2xl font-bold text-amber-700 mt-0.5">{metrics.pending}</h3>
                        <p className="text-[11px] text-rose-500 font-medium mt-0.5">
                            {metrics.highPriority} High Priority
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-lg shrink-0">
                        <CircleDot className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search task title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Filters & View Switcher */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Status Filter Pills */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                        {['ALL', 'pending', 'in-progress', 'completed'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                                    statusFilter === st
                                        ? 'bg-white text-indigo-600 shadow-2xs'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                {st === 'ALL' ? 'All Tasks' : st.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* View Switcher: Table vs Cards */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('table')}
                            title="Tabular View"
                            className={`p-1.5 rounded-lg text-sm transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white text-indigo-600 shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Cards View"
                            className={`p-1.5 rounded-lg text-sm transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white text-indigo-600 shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 mt-3">Loading your assigned deliverables...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                        <CheckSquare className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                            ? "No tasks match your selected filter criteria. Try clearing search or filters."
                            : "You currently have no tasks assigned. Enjoy your day or check in with your team lead!"}
                    </p>
                </div>
            ) : viewMode === 'table' ? (
                /* Enterprise Tabular Format */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                <tr>
                                    <th className="px-6 py-4">Task Deliverable</th>
                                    <th className="px-5 py-4">Priority</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Deadline</th>
                                    <th className="px-5 py-4">Assigned On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTasks.map((task) => {
                                    const priority = PRIORITY_STYLES[(task.priority || "medium").toLowerCase()] || PRIORITY_STYLES.medium
                                    const status = STATUS_STYLES[task.status] || STATUS_STYLES.pending
                                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed"
                                    const isUpdating = updatingId === task._id

                                    return (
                                        <tr
                                            key={task._id}
                                            onClick={() => navigate(`/employee/my-tasks/${task._id}`)}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        >
                                            {/* Title & Description */}
                                            <td className="px-6 py-4 max-w-md">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="p-2 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 rounded-xl transition-colors shrink-0 mt-0.5">
                                                        <ListTodo className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                                            <span>{task.title}</span>
                                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priority} capitalize`}>
                                                    {task.priority || "Medium"}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                                    {status.label}
                                                </span>
                                            </td>

                                            {/* Deadline */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'}>
                                                        {task.deadline
                                                            ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                            : '--'}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Assigned Date */}
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {task.createdAt
                                                    ? new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                    : '--'}
                                            </td>

                                            {/* Quick Actions */}
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {task.status !== 'completed' ? (
                                                        <button
                                                            onClick={(e) => handleComplete(task._id, e)}
                                                            disabled={isUpdating}
                                                            title="Mark as Completed"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Complete</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => handleQuickStatus(task._id, 'in-progress', e)}
                                                            disabled={isUpdating}
                                                            title="Reopen task to in-progress"
                                                            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => navigate(`/employee/my-tasks/${task._id}`)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="View full task details"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Card Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <div
                            key={task._id}
                            onClick={() => navigate(`/employee/my-tasks/${task._id}`)}
                            className="cursor-pointer"
                        >
                            <TaskCard
                                task={task}
                                onComplete={(id) => handleComplete(id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyTasks
