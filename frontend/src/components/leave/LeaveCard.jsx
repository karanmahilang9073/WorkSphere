import { memo } from 'react'
import { Calendar, Check, X, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react'

const LEAVE_TYPE_STYLES = {
    Casual: "bg-blue-50 text-blue-700 border-blue-200/80",
    Sick: "bg-rose-50 text-rose-700 border-rose-200/80",
    Earned: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    Weekoff: "bg-purple-50 text-purple-700 border-purple-200/80"
}

const STATUS_STYLES = {
    pending: {
        badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        icon: Clock,
        label: "Pending"
    },
    approved: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        icon: CheckCircle2,
        label: "Approved"
    },
    rejected: {
        badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        icon: XCircle,
        label: "Rejected"
    },
    cancelled: {
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        icon: XCircle,
        label: "Cancelled"
    }
}

const getInitials = (name) => {
    if (!name) return "EM"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

const formatDates = (start, end) => {
    if (!start || !end) return { text: "--", days: 0 }
    const s = new Date(start)
    const e = new Date(end)
    const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const eStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

    const diffTime = Math.max(0, e.getTime() - s.getTime())
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (sStr === eStr) {
        return { text: sStr, days: 1 }
    }
    return { text: `${sStr} – ${eStr}`, days }
}

function LeaveCard({ leave, onApprove, onReject, onAnalyze }) {
    if (!leave) return null

    const empName = leave.employee?.name || "Staff Member"
    const empEmail = leave.employee?.email || "employee@company.com"
    const leaveType = leave.leaveType || leave.type || "Casual"
    const typeClass = LEAVE_TYPE_STYLES[leaveType] || LEAVE_TYPE_STYLES.Casual

    const statusInfo = STATUS_STYLES[leave.status] || STATUS_STYLES.pending
    const StatusIcon = statusInfo.icon
    const { text: dateText, days } = formatDates(leave.startDate, leave.endDate)
    const isPending = leave.status === "pending"

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {getInitials(empName)}
                        </div>
                        <div>
                            <span className="font-bold text-xs text-slate-900 block truncate">
                                {empName}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                                {empEmail}
                            </span>
                        </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badge}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                    </span>
                </div>

                {/* Leave Type and Dates */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeClass}`}>
                            {leaveType} Leave
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{dateText}</span>
                    </div>
                </div>

                {/* Reason */}
                {leave.reason && (
                    <p className="text-xs text-slate-600 italic line-clamp-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100/80 mb-3">
                        "{leave.reason}"
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                {onAnalyze && (
                    <button
                        onClick={() => onAnalyze(leave)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition"
                    >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>AI Review</span>
                    </button>
                )}

                {isPending && onApprove && onReject && (
                    <div className="flex items-center gap-1.5 ml-auto">
                        <button
                            onClick={() => onApprove(leave._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
                        >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                        </button>
                        <button
                            onClick={() => onReject(leave._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
                        >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default memo(LeaveCard)
