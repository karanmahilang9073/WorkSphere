import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTaskById, updateStatus } from '../../services/TaskService'
import { toast } from 'react-toastify'
import {
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    User,
    Building2,
    Shield,
    Check,
    Timer,
    FileText,
    CircleDot,
    Play,
    ChevronRight,
    RefreshCw
} from 'lucide-react'

const PRIORITY_STYLES = {
    high: {
        badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
        label: "High Priority"
    },
    medium: {
        badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
        label: "Medium Priority"
    },
    low: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
        label: "Low Priority"
    }
}

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500"
    },
    "in-progress": {
        label: "In Progress",
        badge: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500 animate-pulse"
    },
    inprogress: {
        label: "In Progress",
        badge: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500 animate-pulse"
    },
    completed: {
        label: "Completed",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500"
    },
    missed: {
        label: "Missed Deadline",
        badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500"
    }
}

export default function TaskDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    useEffect(() => {
        const fetchTask = async () => {
            setLoading(true)
            try {
                const data = await getTaskById(id)
                setTask(data)
            } catch (err) {
                console.error("Failed to load task details", err)
                toast.error(err?.message || "Failed to load task details")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchTask()
    }, [id])

    const handleStatusChange = async (newStatus) => {
        if (!task || task.status === newStatus) return
        setUpdatingStatus(true)
        try {
            const updated = await updateStatus(task._id, newStatus)
            setTask(updated)
            toast.success(`Status updated to ${newStatus}`)
        } catch (err) {
            console.error("Failed to update status", err)
            toast.error(err?.message || "Failed to update task status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[400px] bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center shadow-xs">
                <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500 mt-4">Loading task details...</p>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
                    <AlertCircle />
                </div>
                <h3 className="text-base font-bold text-slate-900">Task Not Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                    The requested task could not be located or you may not have permission to view it.
                </p>
                <button
                    onClick={() => navigate('/employee/my-tasks')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to My Tasks</span>
                </button>
            </div>
        )
    }

    const priorityKey = (task.priority || "medium").toLowerCase()
    const priority = PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.medium
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed"
    const deadlineDate = task.deadline ? new Date(task.deadline) : null
    const createdDate = task.createdAt ? new Date(task.createdAt) : null
    const updatedDate = task.updatedAt ? new Date(task.updatedAt) : null

    // Determine lifecycle phase index (0: pending, 1: in progress, 2: completed)
    const normalizedStatus = task.status === 'inprogress' ? 'in-progress' : task.status
    const activeStep = normalizedStatus === 'completed' ? 2 : normalizedStatus === 'in-progress' ? 1 : 0

    return (
        <div className="space-y-6">
            {/* Top Navigation & Status Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/employee/my-tasks')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Tasks</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Link to="/employee" className="hover:text-slate-800 transition">Workspace</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <Link to="/employee/my-tasks" className="hover:text-slate-800 transition">My Tasks</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">Task Details</span>
                    </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">Update Status:</span>
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200/60">
                        {[
                            { key: 'pending', label: 'Pending' },
                            { key: 'in-progress', label: 'In Progress' },
                            { key: 'completed', label: 'Completed' }
                        ].map((st) => (
                            <button
                                key={st.key}
                                onClick={() => handleStatusChange(st.key)}
                                disabled={updatingStatus || normalizedStatus === st.key}
                                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                                    normalizedStatus === st.key
                                        ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900'
                                } disabled:opacity-60`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Columns: Task Details & Lifecycle */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Task Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
                        {/* Meta Tags Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${priority.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>
                                    {priority.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${status.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                    {status.label}
                                </span>
                            </div>

                            {isOverdue && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Overdue
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-4">
                            {task.title}
                        </h1>

                        {/* Description */}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                Description
                            </span>
                            <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-4">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {task.description || "No description provided for this task."}
                                </p>
                            </div>
                        </div>

                        {/* Lifecycle Progress Stepper */}
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                                Task Lifecycle Progress
                            </span>

                            <div className="grid grid-cols-3 gap-3 text-center">
                                {/* Step 1: Assigned */}
                                <div className={`p-4 rounded-xl border transition-all ${
                                    activeStep >= 0
                                        ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}>
                                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                        <CircleDot className="w-4 h-4 text-indigo-600" />
                                        <span className="text-xs font-bold">Assigned</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 block">
                                        {createdDate ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                                    </span>
                                </div>

                                {/* Step 2: In Progress */}
                                <div className={`p-4 rounded-xl border transition-all ${
                                    activeStep === 1
                                        ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-semibold'
                                        : activeStep > 1
                                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                                        : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                                }`}>
                                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                        <Timer className={`w-4 h-4 ${activeStep === 1 ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span className="text-xs font-bold">In Progress</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 block">
                                        {activeStep >= 1 ? 'Work Underway' : 'Not Started'}
                                    </span>
                                </div>

                                {/* Step 3: Completed */}
                                <div className={`p-4 rounded-xl border transition-all ${
                                    activeStep === 2
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-semibold'
                                        : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                                }`}>
                                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                        <CheckCircle2 className={`w-4 h-4 ${activeStep === 2 ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        <span className="text-xs font-bold">Completed</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 block">
                                        {activeStep === 2 ? 'Finished' : 'Pending Completion'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Metadata & Details */}
                <div className="space-y-6">
                    {/* Quick Resolution Actions */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Quick Resolution
                        </h3>

                        {normalizedStatus !== 'completed' ? (
                            <button
                                onClick={() => handleStatusChange('completed')}
                                disabled={updatingStatus}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>Mark as Completed</span>
                            </button>
                        ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Task Marked as Completed</span>
                            </div>
                        )}

                        {normalizedStatus === 'pending' && (
                            <button
                                onClick={() => handleStatusChange('in-progress')}
                                disabled={updatingStatus}
                                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
                                <span>Start Working (In Progress)</span>
                            </button>
                        )}

                        {normalizedStatus === 'completed' && (
                            <button
                                onClick={() => handleStatusChange('in-progress')}
                                disabled={updatingStatus}
                                className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Reopen Task</span>
                            </button>
                        )}
                    </div>

                    {/* Timeline & Deadlines */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Timeline & Deadlines
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</p>
                                    <p className={`text-xs font-bold truncate ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                        {deadlineDate ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Assigned On</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {createdDate ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}
                                    </p>
                                </div>
                            </div>

                            {updatedDate && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Last Updated</p>
                                        <p className="text-xs font-bold text-slate-800 truncate">
                                            {updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Staff */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Assigned Staff
                        </h3>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                                {task.assignedTo?.name?.charAt(0)?.toUpperCase() || "E"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {task.assignedTo?.name || "Assigned Employee"}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {task.assignedTo?.email || "No email available"}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {task.assignedTo?.department && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                            <Building2 className="w-3 h-3" />
                                            {task.assignedTo.department}
                                        </span>
                                    )}
                                    {task.assignedTo?.role && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                                            <Shield className="w-3 h-3" />
                                            {task.assignedTo.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
