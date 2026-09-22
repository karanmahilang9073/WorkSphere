import { useEffect, useState } from 'react'
import { getLeaves, applyLeave } from '../../services/LeaveService'
import { toast } from 'react-toastify'
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    CalendarDays,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    FileText
} from 'lucide-react'

function MyLeaves() {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Form state
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [leaveType, setLeaveType] = useState('Sick')
    const [reason, setReason] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 7

    const today = new Date().toISOString().split('T')[0]

    const fetchLeaves = async () => {
        setLoading(true)
        try {
            const res = await getLeaves()
            setLeaves(res.leaves || [])
        } catch (error) {
            console.error('error fetching leaves', error)
            toast.error('Failed to fetch leaves')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [])

    const calculateDays = (start, end) => {
        if (!start || !end) return 0
        const diff = new Date(end) - new Date(start)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
        return days > 0 ? days : 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!leaveType || !startDate || !endDate || !reason.trim()) {
            toast.error('All fields are required')
            return
        }
        if (new Date(endDate) < new Date(startDate)) {
            toast.error('End date cannot be earlier than start date')
            return
        }

        setActionLoading(true)
        try {
            await applyLeave({ leaveType, startDate, endDate, reason })
            toast.success('Leave application submitted successfully')
            setShowModal(false)
            setStartDate('')
            setEndDate('')
            setReason('')
            setLeaveType('Sick')
            fetchLeaves()
        } catch (error) {
            console.error('error while applying leave', error)
            toast.error(error?.message || 'Failed to submit leave application')
        } finally {
            setActionLoading(false)
        }
    }

    // Metric counts
    const pendingCount = leaves.filter(l => l.status === 'pending').length
    const approvedCount = leaves.filter(l => l.status === 'approved').length
    const rejectedCount = leaves.filter(l => l.status === 'rejected').length

    // Pagination
    const totalPages = Math.ceil(leaves.length / pageSize) || 1
    const paginatedLeaves = leaves.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const formatDate = (date) => {
        if (!date) return '--'
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className='p-4 md:p-6 space-y-4 max-w-7xl mx-auto'>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">
                            Leave Management
                        </h1>
                        <p className="text-xs text-slate-500">
                            Apply for time off and track application approvals
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs">
                    <Plus className="w-4 h-4" /> Apply for Leave
                </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                        <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Awaiting manager review</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Leaves</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Approved this year</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{leaves.length}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rejectedCount} rejected</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Leave Applications Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        My Leave Applications
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200/60">
                        {leaves.length} Total
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center items-center text-slate-500 gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs">Loading leave requests...</span>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">No Leave Requests Found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Apply for Leave" above to submit a new request.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                                        <th className="py-3 px-5">Leave Type</th>
                                        <th className="py-3 px-4">Duration</th>
                                        <th className="py-3 px-4">Date Range</th>
                                        <th className="py-3 px-4">Reason</th>
                                        <th className="py-3 px-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {paginatedLeaves.map((l) => {
                                        const isApproved = l.status === 'approved'
                                        const isRejected = l.status === 'rejected'
                                        const days = l.totalDays || calculateDays(l.startDate, l.endDate)

                                        return (
                                            <tr key={l._id} className="hover:bg-indigo-50/20 transition-colors">
                                                {/* Type */}
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                                        l.leaveType === 'Sick'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                                                            : l.leaveType === 'Casual'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                                                            : 'bg-purple-50 text-purple-700 border-purple-200/60'
                                                    }`}>
                                                        {l.leaveType} Leave
                                                    </span>
                                                </td>

                                                {/* Total Days */}
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </td>

                                                {/* Date Range */}
                                                <td className="py-3.5 px-4 text-slate-700">
                                                    <span className="font-semibold">{formatDate(l.startDate)}</span>
                                                    <span className="text-slate-400 mx-1.5">to</span>
                                                    <span className="font-semibold">{formatDate(l.endDate)}</span>
                                                </td>

                                                {/* Reason */}
                                                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                                                    {l.reason || 'Personal'}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-5 text-right">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        isApproved
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : isRejected
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                                                        {isRejected && <XCircle className="w-3 h-3" />}
                                                        {!isApproved && !isRejected && <Clock className="w-3 h-3" />}
                                                        {l.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <span className="text-xs text-slate-500 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs">
                                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs">
                                        Next <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Apply Leave Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" /> Apply for Leave
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Leave Type</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Weekoff">Weekoff</option>
                                    <option value="Earned">Earned Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        min={today}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || today}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {startDate && endDate && (
                                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-semibold flex items-center justify-between">
                                    <span>Requested duration:</span>
                                    <span className="font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                                        {calculateDays(startDate, endDate)} day(s)
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Provide brief reason for time off..."
                                    rows={3}
                                    className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition-colors">
                                    {actionLoading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MyLeaves
