import React, { useEffect, useState, useMemo } from 'react'
import { createTask, deleteTask, getTasks, updateStatus, updateTask } from '../../services/TaskService'
import { toast } from 'react-toastify'
import TaskCard from '../../components/task/TaskCard'
import { getUsers } from '../../services/userService.js'
import { recommendTask } from '../../services/AiService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import {
    ListTodo,
    Plus,
    Sparkles,
    Search,
    SlidersHorizontal,
    Table as TableIcon,
    Kanban,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    X,
    Edit3,
    Trash2,
    Check,
    RefreshCw,
    Building2,
    Shield,
    ChevronRight,
    ArrowUpRight,
    CheckSquare
} from 'lucide-react'

const PRIORITY_STYLES = {
    high: "bg-rose-50 text-rose-700 border-rose-200/80",
    medium: "bg-amber-50 text-amber-700 border-amber-200/80",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200/80"
}

const STATUS_STYLES = {
    pending: "bg-amber-50 text-amber-700 border-amber-200/80",
    inprogress: "bg-blue-50 text-blue-700 border-blue-200/80",
    "in-progress": "bg-blue-50 text-blue-700 border-blue-200/80",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    missed: "bg-rose-50 text-rose-700 border-rose-200/80"
}

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

const formatDate = (date) => {
    if (!date) return "--"
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

function Tasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])

    // View Mode (Table or Kanban)
    const [viewMode, setViewMode] = useState("table")

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editTask, setEditTask] = useState(null)
    const [showAiModal, setShowAiModal] = useState(false)
    const [deleteConfirmTask, setDeleteConfirmTask] = useState(null)

    // Form submission guards
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    // AI Recommendation
    const [aiTask, setAiTask] = useState("")
    const [aiLoading, setAiLoading] = useState(false)
    const [aiDept, setAiDept] = useState("IT")

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [priorityFilter, setPriorityFilter] = useState("ALL")
    const [assigneeFilter, setAssigneeFilter] = useState("ALL")

    // Form
    const [form, setForm] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        assignedTo: ''
    })

    const { socket } = useSocket()

    const loadTasks = async () => {
        setLoading(true)
        try {
            const res = await getTasks()
            setTasks(Array.isArray(res) ? res : [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch tasks')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTasks()
    }, [])

    useEffect(() => {
        if (!socket) return
        socket.on('task-assigned', (newTask) => {
            const item = newTask?.data || newTask?.task || newTask
            if (!item?._id) return
            setTasks(prev => prev.some(t => t._id === item._id) ? prev : [item, ...prev])
        })
        return () => socket.off('task-assigned')
    }, [socket])

    // Load users for assignee dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers(1, 100)
                const userList = res.users || (Array.isArray(res) ? res : [])
                setUsers(userList)
            } catch (error) {
                console.error('Failed to fetch users', error)
            }
        }
        fetchUsers()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.title || !form.assignedTo) {
            toast.error('Title and Assignee are required')
            return
        }
        setIsSubmitting(true)
        try {
            const newTask = await createTask(form)
            const item = newTask?.data || newTask?.task || newTask
            if (item?._id) {
                setTasks((prev) => prev.some(t => t._id === item._id) ? prev : [item, ...prev])
            }
            toast.success('Task created and assigned successfully!')
            setForm({ title: '', description: '', deadline: '', priority: 'medium', assignedTo: '' })
            setShowCreateModal(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteTask(id)
            setTasks((prev) => prev.filter((t) => t._id !== id))
            toast.success('Task deleted successfully')
            setDeleteConfirmTask(null)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete task')
        }
    }

    const handleComplete = async (id) => {
        try {
            const res = await updateStatus(id, 'completed')
            setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: 'completed' } : t)))
            toast.success('Task marked as completed!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update task')
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (isUpdating) return
        if (!editTask?.title) {
            toast.error('Task title is required')
            return
        }
        setIsUpdating(true)
        try {
            const updated = await updateTask(editTask._id, editTask)
            const item = updated?.data || updated?.task || updated
            setTasks((prev) => prev.map((t) => (t._id === item._id ? item : t)))
            toast.success('Task updated successfully')
            setEditTask(null)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update task")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleRecommend = async () => {
        setAiLoading(true)
        setShowAiModal(true)
        setAiTask("")
        try {
            const res = await recommendTask(aiDept)
            setAiTask(res)
            toast.success('AI task recommendation generated!')
        } catch (error) {
            console.error('Error in recommend task', error)
            setAiTask('Failed to generate task recommendations. Please try again.')
            toast.error('Failed to generate AI recommendations')
        } finally {
            setAiLoading(false)
        }
    }

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const title = t.title || ""
            const desc = t.description || ""
            const assignee = t.assignedTo?.name || "Unassigned"

            const matchesSearch =
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignee.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus =
                statusFilter === "ALL" ||
                (t.status || "").toLowerCase().replace('-', '') === statusFilter.toLowerCase().replace('-', '')

            const matchesPriority =
                priorityFilter === "ALL" ||
                (t.priority || "medium").toLowerCase() === priorityFilter.toLowerCase()

            const matchesAssignee =
                assigneeFilter === "ALL" ||
                t.assignedTo?._id === assigneeFilter

            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
        })
    }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter])

    // Metrics summary
    const metrics = useMemo(() => {
        const total = tasks.length
        const pending = tasks.filter(t => t.status === 'pending').length
        const inProgress = tasks.filter(t => t.status === 'inprogress' || t.status === 'in-progress').length
        const completed = tasks.filter(t => t.status === 'completed').length
        return { total, pending, inProgress, completed }
    }, [tasks])

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Task & Operations Manager</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {metrics.total} Tasks
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Assign organizational workflows, monitor deadlines, and optimize productivity with AI
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                    <button
                        onClick={handleRecommend}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200/70 transition shadow-2xs"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>AI Recommend Task</span>
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Task</span>
                    </button>

                    <button
                        onClick={loadTasks}
                        title="Refresh Tasks"
                        className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">All Tasks</span>
                        <span className="text-xl font-bold text-slate-900">{metrics.total}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-amber-600 block uppercase">Pending</span>
                        <span className="text-xl font-bold text-amber-700">{metrics.pending}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-blue-600 block uppercase">In Progress</span>
                        <span className="text-xl font-bold text-blue-700">{metrics.inProgress}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-emerald-600 block uppercase">Completed</span>
                        <span className="text-xl font-bold text-emerald-700">{metrics.completed}</span>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3.5 justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search task, description, assignee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters & View Switcher */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Assignee Filter */}
                    <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700 max-w-[140px] truncate"
                    >
                        <option value="ALL">All Assignees</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>

                    {/* View Switcher */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5 ml-auto md:ml-0">
                        <button
                            onClick={() => setViewMode("table")}
                            title="Table View"
                            className={`p-1.5 rounded-lg transition ${
                                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs font-semibold" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            title="Kanban Board View"
                            className={`p-1.5 rounded-lg transition ${
                                viewMode === "kanban" ? "bg-white text-indigo-600 shadow-2xs font-semibold" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <Kanban className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-medium">Loading organization tasks...</span>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <ListTodo className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No tasks found</p>
                        <p className="text-xs text-slate-400 mt-1">Create a new task or adjust your search filters.</p>
                    </div>
                ) : viewMode === "table" ? (
                    /* Tabular Format */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Task</th>
                                    <th className="py-3.5 px-4">Assigned To</th>
                                    <th className="py-3.5 px-4">Priority</th>
                                    <th className="py-3.5 px-4">Deadline</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredTasks.map((task, idx) => {
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                                    const assigneeName = task.assignedTo?.name || "Unassigned"
                                    const assigneeEmail = task.assignedTo?.email || ""
                                    const priority = (task.priority || "medium").toLowerCase()
                                    const priorityBadge = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
                                    const statusKey = (task.status || "pending").toLowerCase()
                                    const statusBadge = STATUS_STYLES[statusKey] || STATUS_STYLES.pending

                                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed"

                                    return (
                                        <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Task Title & Description */}
                                            <td className="py-3.5 px-5 max-w-xs">
                                                <div>
                                                    <span className="font-semibold text-slate-900 block text-xs">
                                                        {task.title}
                                                    </span>
                                                    {task.description && (
                                                        <span className="text-[11px] text-slate-400 block truncate mt-0.5" title={task.description}>
                                                            {task.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                                                        {getInitials(assigneeName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-800 block text-xs truncate">
                                                            {assigneeName}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block truncate">
                                                            {assigneeEmail || "Direct Assignee"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityBadge} capitalize`}>
                                                    {task.priority || "Medium"}
                                                </span>
                                            </td>

                                            {/* Deadline */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className={`font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-700'}`}>
                                                        {formatDate(task.deadline)}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge} uppercase tracking-wider`}>
                                                    {task.status || "Pending"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {task.status !== "completed" && (
                                                        <button
                                                            onClick={() => handleComplete(task._id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs border border-emerald-200/80 transition"
                                                            title="Mark Task as Completed"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Complete</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setEditTask(task)}
                                                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200/70 rounded-xl transition"
                                                        title="Edit Task"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteConfirmTask(task)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 rounded-xl transition"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Kanban Board View */
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Pending Column */}
                        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                                    {filteredTasks.filter(t => t.status === 'pending').length}
                                </span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                                {filteredTasks.filter(t => t.status === 'pending').map(task => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onDelete={() => setDeleteConfirmTask(task)}
                                        onComplete={handleComplete}
                                        onEdit={setEditTask}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" /> In Progress
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                                    {filteredTasks.filter(t => t.status === 'inprogress' || t.status === 'in-progress').length}
                                </span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                                {filteredTasks.filter(t => t.status === 'inprogress' || t.status === 'in-progress').map(task => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onDelete={() => setDeleteConfirmTask(task)}
                                        onComplete={handleComplete}
                                        onEdit={setEditTask}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Completed Column */}
                        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                                    {filteredTasks.filter(t => t.status === 'completed').length}
                                </span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                                {filteredTasks.filter(t => t.status === 'completed').map(task => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onDelete={() => setDeleteConfirmTask(task)}
                                        onComplete={handleComplete}
                                        onEdit={setEditTask}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Create & Assign New Task</h2>
                                    <p className="text-[11px] text-slate-500">Define operational deliverables and team responsibilities</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Design Payment Gateway Integration"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Describe deliverables, requirements, and scope..."
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assign To</label>
                                    <select
                                        value={form.assignedTo}
                                        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} ({u.department || 'General'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Deadline</label>
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Assigning Task...</span>
                                        </>
                                    ) : (
                                        <span>Assign Task</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editTask && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Modify Task</h2>
                                    <p className="text-[11px] text-slate-500">Update scope, deadline or assignments</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditTask(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    value={editTask.title}
                                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={editTask.description || ""}
                                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={editTask.priority || 'medium'}
                                        onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Deadline</label>
                                    <input
                                        type="date"
                                        value={editTask.deadline ? editTask.deadline.split("T")[0] : ""}
                                        onChange={(e) => setEditTask({ ...editTask, deadline: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditTask(null)}
                                    className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Task Recommendation Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">AI Task & Workflow Recommendation</h3>
                                    <p className="text-[11px] text-slate-500">Intelligent workload and priority suggestions</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-700">Target Department:</span>
                                <select
                                    value={aiDept}
                                    onChange={(e) => setAiDept(e.target.value)}
                                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                >
                                    <option value="IT">IT & Engineering</option>
                                    <option value="DEVOPS">DevOps & Infrastructure</option>
                                    <option value="HR">Human Resources</option>
                                    <option value="Management">Management & Operations</option>
                                </select>
                                <button
                                    onClick={handleRecommend}
                                    disabled={aiLoading}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition ml-auto disabled:opacity-50"
                                >
                                    {aiLoading ? "Generating..." : "Generate"}
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto">
                                {aiLoading ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs font-medium">WorkSphere AI is generating departmental task recommendations...</span>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                        {aiTask || "Select a department and click Generate to receive tailored task suggestions."}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmTask && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200/90 text-center animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5 shadow-inner">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Delete Task?</h2>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                            Are you sure you want to delete <strong className="text-slate-800">"{deleteConfirmTask.title}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-2.5">
                            <button
                                onClick={() => setDeleteConfirmTask(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmTask._id)}
                                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks
