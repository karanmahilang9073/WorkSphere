import React, { useState, useEffect, useMemo } from 'react'
import { getLeaves, updateLeaveStatus } from '../../services/LeaveService'
import LeaveCard from '../../components/leave/LeaveCard'
import { toast } from 'react-toastify'
import { analyzeLeave } from '../../services/AiService'
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    SlidersHorizontal,
    Table as TableIcon,
    LayoutGrid,
    Sparkles,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    User,
    Building2,
    MessageSquare,
    Shield
} from 'lucide-react'

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
        label: "Pending Review"
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

function Leaves() {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // View Mode (Default to 'table')
    const [viewMode, setViewMode] = useState("table")

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [typeFilter, setTypeFilter] = useState("ALL")

    // AI Insight
    const [aiLeave, setAiLeave] = useState("")
    const [analyzingLeaveId, setAnalyzingLeaveId] = useState(null)
    const [showAiModal, setShowAiModal] = useState(false)
    const [selectedLeave, setSelectedLeave] = useState(null)

    // Action Processing
    const [actionLoadingId, setActionLoadingId] = useState(null)

    const fetchLeaves = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getLeaves(page, 15)
            setLeaves(res.leaves || [])
            setTotalPages(res.totalPages || 1)
        } catch (err) {
            console.error("Error loading leaves", err)
            setError("Failed to fetch leaves")
            toast.error("Failed to fetch leaves")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [page])

    const handleApprove = async (leaveId) => {
        setActionLoadingId(leaveId)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "approved")
            setLeaves(prev => prev.map(l => l._id === leaveId ? (updatedLeave || { ...l, status: "approved" }) : l))
            toast.success("Leave approved successfully!")
        } catch (err) {
            console.error("Error while approving", err)
            toast.error("Failed to approve leave")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleReject = async (leaveId) => {
        setActionLoadingId(leaveId)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "rejected")
            setLeaves(prev => prev.map(l => l._id === leaveId ? (updatedLeave || { ...l, status: "rejected" }) : l))
            toast.success("Leave request rejected")
        } catch (err) {
            console.error("Error while rejecting", err)
            toast.error("Failed to reject leave")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleAnalyze = async (leave) => {
        setSelectedLeave(leave)
        setAnalyzingLeaveId(leave._id)
        setShowAiModal(true)
        setAiLeave("")
        try {
            const res = await analyzeLeave({
                employeeId: leave.employee?._id || leave.employee,
                startDate: leave.startDate,
                endDate: leave.endDate,
                reason: leave.reason
            })
            setAiLeave(res)
            toast.success("AI Leave analysis completed!")
        } catch (err) {
            console.error("Error analyzing leave", err)
            setAiLeave("Failed to generate AI evaluation. Please try again.")
            toast.error("Failed to analyze leave")
        } finally {
            setAnalyzingLeaveId(null)
        }
    }

    // Filtered Leaves
    const filteredLeaves = useMemo(() => {
        return leaves.filter((leave) => {
            const empName = leave.employee?.name || "Staff Member"
            const empEmail = leave.employee?.email || ""
            const reason = leave.reason || ""
            const lType = leave.leaveType || leave.type || "Casual"

            const matchesSearch =
                empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                empEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                reason.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus =
                statusFilter === "ALL" ||
                (leave.status || "").toLowerCase() === statusFilter.toLowerCase()

            const matchesType =
                typeFilter === "ALL" ||
                lType.toLowerCase() === typeFilter.toLowerCase()

            return matchesSearch && matchesStatus && matchesType
        })
    }, [leaves, searchQuery, statusFilter, typeFilter])

    // Metric Summary Counters
    const metrics = useMemo(() => {
        return {
            total: leaves.length,
            pending: leaves.filter(l => l.status === 'pending').length,
            approved: leaves.filter(l => l.status === 'approved').length,
            rejected: leaves.filter(l => l.status === 'rejected').length
        }
    }, [leaves])

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management & Approvals</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {metrics.total} Total
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Review and authorize employee PTO, sick days, vacation, and leave requests
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchLeaves}
                        title="Refresh Leaves"
                        className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Applications</span>
                        <span className="text-xl font-bold text-slate-900">{metrics.total}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-amber-600 block uppercase">Pending Review</span>
                        <span className="text-xl font-bold text-amber-700">{metrics.pending}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-emerald-600 block uppercase">Approved</span>
                        <span className="text-xl font-bold text-emerald-700">{metrics.approved}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-rose-600 block uppercase">Rejected</span>
                        <span className="text-xl font-bold text-rose-700">{metrics.rejected}</span>
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
                        placeholder="Search employee, email, reason..."
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
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Leave Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Leave Types</option>
                        <option value="Casual">Casual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Earned">Earned Leave</option>
                        <option value="Weekoff">Weekoff</option>
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
                            onClick={() => setViewMode("card")}
                            title="Card View"
                            className={`p-1.5 rounded-lg transition ${
                                viewMode === "card" ? "bg-white text-indigo-600 shadow-2xs font-semibold" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-medium">Loading leave requests...</span>
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No leave requests found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : viewMode === "table" ? (
                    /* Tabular Format */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Employee</th>
                                    <th className="py-3.5 px-4">Leave Type</th>
                                    <th className="py-3.5 px-4">Duration & Dates</th>
                                    <th className="py-3.5 px-4">Reason</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredLeaves.map((leave, idx) => {
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                                    const empName = leave.employee?.name || "Staff Member"
                                    const empEmail = leave.employee?.email || "employee@company.com"
                                    const empDept = leave.employee?.department || "General"

                                    const leaveType = leave.leaveType || leave.type || "Casual"
                                    const typeClass = LEAVE_TYPE_STYLES[leaveType] || LEAVE_TYPE_STYLES.Casual

                                    const statusInfo = STATUS_STYLES[leave.status] || STATUS_STYLES.pending
                                    const StatusIcon = statusInfo.icon
                                    const { text: dateText, days } = formatDates(leave.startDate, leave.endDate)
                                    const isPending = leave.status === "pending"
                                    const isActioning = actionLoadingId === leave._id

                                    return (
                                        <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Employee */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                                                        {getInitials(empName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-900 block text-xs truncate">
                                                            {empName}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block truncate">
                                                            {empDept} • {empEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Leave Type */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeClass}`}>
                                                    {leaveType} Leave
                                                </span>
                                            </td>

                                            {/* Duration & Dates */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div>
                                                    <span className="font-semibold text-slate-800 block text-xs">
                                                        {dateText}
                                                    </span>
                                                    <span className="text-[11px] text-indigo-600 font-medium">
                                                        {days} {days === 1 ? 'day' : 'days'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="text-xs text-slate-600 truncate" title={leave.reason}>
                                                    "{leave.reason}"
                                                </p>
                                                {leave.approvedComment && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate italic">
                                                        Note: {leave.approvedComment}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badge}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    <span>{statusInfo.label}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* AI Evaluation */}
                                                    <button
                                                        onClick={() => handleAnalyze(leave)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition shadow-2xs"
                                                        title="Evaluate with WorkSphere AI"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span>AI Review</span>
                                                    </button>

                                                    {/* Approve & Reject for Pending */}
                                                    {isPending && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(leave._id)}
                                                                disabled={isActioning}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs disabled:opacity-50"
                                                                title="Approve Leave"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                <span>Approve</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleReject(leave._id)}
                                                                disabled={isActioning}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-2xs disabled:opacity-50"
                                                                title="Reject Leave"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                <span>Reject</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Fallback Modern Card View */
                    <div className="p-5 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredLeaves.map((l) => (
                            <LeaveCard
                                key={l._id}
                                leave={l}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onAnalyze={() => handleAnalyze(l)}
                            />
                        ))}
                    </div>
                )}

                {/* Footer with Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-500">
                        Showing <strong className="text-slate-700">{filteredLeaves.length}</strong> of{' '}
                        <strong className="text-slate-700">{leaves.length}</strong> applications
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>

                        <span className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-indigo-600">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page >= totalPages || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Review Modal */}
            {showAiModal && selectedLeave && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-indigo-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">AI Leave Impact & Pattern Review</h3>
                                    <p className="text-[11px] text-slate-500">
                                        Applicant: {selectedLeave.employee?.name || "Staff Member"} • {selectedLeave.leaveType || selectedLeave.type || "Casual"} Leave
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {analyzingLeaveId ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-medium">WorkSphere AI is analyzing workforce impact & leave history...</span>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                    {aiLeave}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Close Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Leaves
