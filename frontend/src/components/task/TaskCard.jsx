import React, { useMemo } from 'react'
import { Calendar, Check, Trash2, Edit3, Clock, AlertCircle } from 'lucide-react'

const PRIORITY_STYLES = {
    high: "bg-rose-50 text-rose-700 border-rose-200/80",
    medium: "bg-amber-50 text-amber-700 border-amber-200/80",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200/80"
}

const getInitials = (name) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

function TaskCard({ task, onDelete, onComplete, onEdit }) {
    const isOverdue = useMemo(() => {
        return task?.deadline && new Date(task.deadline) < new Date() && task.status !== "completed"
    }, [task?.deadline, task?.status])

    if (!task) return null

    const assigneeName = task.assignedTo?.name || "Unassigned"
    const priority = (task.priority || "medium").toLowerCase()
    const priorityClass = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
                {/* Header: Priority & Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityClass} capitalize`}>
                        {task.priority || "Medium"}
                    </span>

                    <div className="flex items-center gap-1">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Edit Task"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(task._id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Task"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Footer: Assignee & Deadline */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {getInitials(assigneeName)}
                    </div>
                    <span className="font-semibold text-slate-700 truncate max-w-[100px]">
                        {assigneeName}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No date'}
                    </span>
                </div>
            </div>

            {/* Complete Button */}
            {task.status !== "completed" && onComplete && (
                <button
                    onClick={() => onComplete(task._id)}
                    className="w-full mt-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1"
                >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                </button>
            )}
        </div>
    )
}

export default React.memo(TaskCard)
