import React, { useState, useEffect, useMemo } from 'react'
import { getSalaries, updateStatus } from '../../services/SalaryService'
import SalaryCard from '../../components/salary/SalaryCard'
import { toast } from 'react-toastify'
import SalaryModal from '../../components/salary/SalaryModal'
import EditSalary from '../../components/salary/EditSalary'
import { predictSalary } from '../../services/AiService'
import {
    Banknote,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Plus,
    List,
    LayoutGrid,
    Bot,
    X,
    Loader2,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    Edit3,
    Check,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react'

function Compensation() {
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [editingSalary, setEditingSalary] = useState(null)

    // View mode: 'table' or 'grid'
    const [viewMode, setViewMode] = useState('table')

    // Search & Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Pagination
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)

    // AI Prediction Modal
    const [aiModalOpen, setAiModalOpen] = useState(false)
    const [aiResult, setAiResult] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiEmployeeName, setAiEmployeeName] = useState('')

    // Action loading tracking for buttons
    const [actionLoadingId, setActionLoadingId] = useState(null)

    const fetchSalaries = async (page = currentPage, status = statusFilter) => {
        setLoading(true)
        setError(null)
        try {
            const apiStatus = status === 'all' ? '' : status
            const res = await getSalaries(page, 10, apiStatus)
            setSalaries(res.salaries || [])
            setTotalPages(res.totalPages || 1)
            setTotalRecords(res.totalRecords || (res.salaries ? res.salaries.length : 0))
        } catch (err) {
            console.error('error while loading salaries', err)
            setError('Failed to fetch salary records')
            toast.error('Failed to fetch salary records')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSalaries(currentPage, statusFilter)
    }, [currentPage, statusFilter])

    const handleStatus = async (salaryId, targetStatus) => {
        setActionLoadingId(salaryId)
        try {
            const res = await updateStatus(salaryId, targetStatus)
            setSalaries(prev => prev.map(s => s._id === salaryId ? res.salary : s))
            toast.success(`Salary marked as ${targetStatus}`)
        } catch (err) {
            console.error('error while updating salary status', err)
            toast.error(err?.message || 'Failed to update salary status')
        } finally {
            setActionLoadingId(null)
        }
    }

    const handlePredict = async (employeeId, employeeName = 'Employee') => {
        setAiEmployeeName(employeeName)
        setAiResult('')
        setAiLoading(true)
        setAiModalOpen(true)
        try {
            const res = await predictSalary(employeeId)
            setAiResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
        } catch (err) {
            console.error('error while predicting salary', err)
            setAiResult('Unable to retrieve AI prediction at this moment.')
            toast.error('Failed to generate salary prediction')
        } finally {
            setAiLoading(false)
        }
    }

    // Filter client-side search query
    const filteredSalaries = useMemo(() => {
        if (!searchQuery.trim()) return salaries
        const query = searchQuery.toLowerCase()
        return salaries.filter(s => {
            const empName = s.employee?.name?.toLowerCase() || ''
            const empEmail = s.employee?.email?.toLowerCase() || ''
            const empDept = s.employee?.department?.toLowerCase() || ''
            const empRole = s.employee?.role?.toLowerCase() || ''
            return empName.includes(query) || empEmail.includes(query) || empDept.includes(query) || empRole.includes(query)
        })
    }, [salaries, searchQuery])

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const totalPayroll = salaries.reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
        const disbursed = salaries.filter(s => s.status === 'paid').reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
        const pending = salaries.filter(s => s.status !== 'paid').reduce((acc, s) => acc + (Number(s.netSalary) || 0), 0)
        const totalAllowances = salaries.reduce((acc, s) => acc + (Number(s.allowance) || 0), 0)
        const totalDeductions = salaries.reduce((acc, s) => acc + (Number(s.deduction) || 0), 0)

        return {
            totalPayroll,
            disbursed,
            pending,
            totalAllowances,
            totalDeductions,
            paidCount: salaries.filter(s => s.status === 'paid').length,
            pendingCount: salaries.filter(s => s.status !== 'paid').length
        }
    }, [salaries])

    const formatMonth = (month) => {
        if (!month) return 'N/A'
        return new Date(month).toLocaleDateString('default', { month: 'short', year: 'numeric' })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Paid
                    </span>
                )
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                        Processing
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                    </span>
                )
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                        <Banknote className="w-6 h-6 text-indigo-600" />
                        Compensation & Payroll
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitor payroll disbursements, salary structures, deductions, and tax ledgers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchSalaries(currentPage, statusFilter)}
                        title="Refresh records"
                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Salary Slip</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Payroll */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Net Payroll</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">
                            ₹{metrics.totalPayroll.toLocaleString('en-IN')}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{salaries.length} loaded records</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>

                {/* Disbursed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Disbursed (Paid)</p>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                            ₹{metrics.disbursed.toLocaleString('en-IN')}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{metrics.paidCount} slips completed</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Payout</p>
                        <h3 className="text-2xl font-bold text-amber-700 mt-1">
                            ₹{metrics.pending.toLocaleString('en-IN')}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{metrics.pendingCount} awaiting approval</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* Net Allowances / Deductions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Benefits & Tax</p>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> ₹{metrics.totalAllowances.toLocaleString('en-IN')}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                                <ArrowDownRight className="w-3 h-3" /> ₹{metrics.totalDeductions.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Allowances vs Deductions</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center text-xl shrink-0">
                        <Banknote className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Toolbar & View Toggle */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search employee name, email, department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters & View Switcher */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Status Filter Pills */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
                        {['all', 'paid', 'processing', 'pending'].map((st) => (
                            <button
                                key={st}
                                onClick={() => {
                                    setStatusFilter(st)
                                    setCurrentPage(1)
                                }}
                                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                                    statusFilter === st
                                        ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                                        : 'hover:text-slate-900'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('table')}
                            title="Table View"
                            className={`p-1.5 rounded-lg text-sm transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white text-indigo-600 shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Card Grid View"
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

            {/* Main Content Area */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 mt-3">Loading payroll records...</p>
                </div>
            ) : filteredSalaries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                        <Banknote className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No salary records found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {searchQuery
                            ? `No records matching "${searchQuery}". Try clearing search.`
                            : 'No compensation slips have been generated for this filter criteria.'}
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Generate First Slip
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                /* Enterprise Ledger Table */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-5 py-4">Pay Period</th>
                                    <th className="px-5 py-4">Base Salary</th>
                                    <th className="px-5 py-4">Allowances</th>
                                    <th className="px-5 py-4">Deductions</th>
                                    <th className="px-5 py-4">Net Payout</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSalaries.map((salary) => {
                                    const isActing = actionLoadingId === salary._id
                                    return (
                                        <tr key={salary._id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Employee info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                                                        {salary.employee?.name?.charAt(0)?.toUpperCase() || 'E'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 leading-tight">
                                                            {salary.employee?.name || 'Unknown Employee'}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {salary.employee?.email || '—'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                                                                {salary.employee?.role || 'Staff'}
                                                            </span>
                                                            {salary.employee?.department && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
                                                                    {salary.employee?.department}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Month */}
                                            <td className="px-5 py-4 text-slate-700 font-medium">
                                                {formatMonth(salary.month)}
                                            </td>

                                            {/* Base Salary */}
                                            <td className="px-5 py-4 text-slate-700 font-medium">
                                                ₹{Number(salary.baseSalary || 0).toLocaleString('en-IN')}
                                            </td>

                                            {/* Allowances */}
                                             <td className="px-5 py-4">
                                                 <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                                                     <ArrowUpRight className="w-3 h-3" />
                                                     ₹{Number(salary.allowance || 0).toLocaleString('en-IN')}
                                                 </span>
                                             </td>

                                             {/* Deductions */}
                                             <td className="px-5 py-4">
                                                 <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs bg-rose-50 px-2 py-0.5 rounded-md">
                                                     <ArrowDownRight className="w-3 h-3" />
                                                     ₹{Number(salary.deduction || 0).toLocaleString('en-IN')}
                                                 </span>
                                             </td>

                                             {/* Net Payout */}
                                             <td className="px-5 py-4">
                                                 <span className="font-bold text-slate-900 text-base">
                                                     ₹{Number(salary.netSalary || 0).toLocaleString('en-IN')}
                                                 </span>
                                             </td>

                                             {/* Status Badge */}
                                             <td className="px-5 py-4">
                                                 {getStatusBadge(salary.status)}
                                             </td>

                                             {/* Actions */}
                                             <td className="px-6 py-4 text-right">
                                                 <div className="flex items-center justify-end gap-1.5">
                                                     {salary.status !== 'paid' ? (
                                                         <button
                                                             onClick={() => handleStatus(salary._id, 'paid')}
                                                             disabled={isActing}
                                                             title="Mark as Paid"
                                                             className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                                                         >
                                                             {isActing ? (
                                                                 <Loader2 className="w-3 h-3 animate-spin" />
                                                             ) : (
                                                                 <Check className="w-3 h-3" />
                                                             )}
                                                             <span>Pay</span>
                                                         </button>
                                                     ) : (
                                                         <button
                                                             onClick={() => handleStatus(salary._id, 'pending')}
                                                             disabled={isActing}
                                                             title="Revert to Pending"
                                                             className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                                         >
                                                             Revert
                                                         </button>
                                                     )}

                                                     <button
                                                         onClick={() => setEditingSalary(salary)}
                                                         disabled={salary.status === 'paid'}
                                                         title={salary.status === 'paid' ? 'Paid slips cannot be modified' : 'Edit salary details'}
                                                         className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                     >
                                                         <Edit3 className="w-3.5 h-3.5" />
                                                     </button>

                                                     {salary.status !== 'paid' && (
                                                         <button
                                                             onClick={() => handlePredict(salary.employee?._id || salary.employee, salary.employee?.name)}
                                                             title="AI Salary Forecast"
                                                             className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                         >
                                                             <Bot className="w-3.5 h-3.5" />
                                                         </button>
                                                     )}
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
                 <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                     {filteredSalaries.map((salary) => (
                         <SalaryCard
                             key={salary._id}
                             salary={salary}
                             onStatusUpdate={handleStatus}
                             onEdit={setEditingSalary}
                             onPredict={(empId) => handlePredict(empId, salary.employee?.name)}
                         />
                     ))}
                 </div>
             )}

             {/* Pagination Controls */}
             {totalPages > 1 && (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                     <p className="text-xs text-slate-500 font-medium">
                         Showing page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
                         <span className="font-semibold text-slate-800">{totalPages}</span> ({totalRecords} records)
                     </p>

                     <div className="flex items-center gap-2">
                         <button
                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                             disabled={currentPage === 1 || loading}
                             className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                         >
                             <ChevronLeft className="w-3.5 h-3.5" />
                             <span>Previous</span>
                         </button>

                         <div className="flex items-center gap-1">
                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                 <button
                                     key={p}
                                     onClick={() => setCurrentPage(p)}
                                     className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                         currentPage === p
                                             ? 'bg-indigo-600 text-white shadow-xs'
                                             : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                     }`}
                                 >
                                     {p}
                                 </button>
                             ))}
                         </div>

                         <button
                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                             disabled={currentPage === totalPages || loading}
                             className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                         >
                             <span>Next</span>
                             <ChevronRight className="w-3.5 h-3.5" />
                         </button>
                     </div>
                 </div>
             )}

             {/* Salary Modal (Create) */}
             {showModal && (
                 <SalaryModal
                     onClose={() => setShowModal(false)}
                     onSuccess={(newSalary) => {
                         setSalaries(prev => [newSalary, ...prev])
                     }}
                 />
             )}

             {/* Edit Salary Modal */}
             {editingSalary && (
                 <EditSalary
                     salary={editingSalary}
                     onClose={() => setEditingSalary(null)}
                     onUpdate={(updated) => {
                         setSalaries(prev => prev.map(s => s._id === updated._id ? updated : s))
                     }}
                 />
             )}

             {/* AI Salary Forecast Modal */}
             {aiModalOpen && (
                 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                     <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
                         <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
                                     <Bot className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <h2 className="text-lg font-bold">AI Salary Benchmark & Forecast</h2>
                                     <p className="text-xs text-indigo-200">Analysis for {aiEmployeeName}</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => setAiModalOpen(false)}
                                 className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                             >
                                 <X className="w-4 h-4" />
                             </button>
                         </div>

                        <div className="p-6">
                            {aiLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-semibold text-slate-700 mt-4">
                                        Evaluating performance & market compensation standards...
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Synthesizing attendance, experience, role tier, and benchmarks.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                                        {aiResult}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setAiModalOpen(false)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Compensation
