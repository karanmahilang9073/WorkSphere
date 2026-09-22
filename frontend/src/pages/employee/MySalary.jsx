import { useState, useEffect } from 'react'
import { getSalaries } from '../../services/SalaryService'
import { toast } from 'react-toastify'
import {
    IndianRupee,
    TrendingUp,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    FileText,
    RefreshCw,
    Receipt,
    Percent,
    ShieldCheck,
    ArrowDownRight,
    ArrowUpRight,
    X,
    Printer
} from 'lucide-react'

function MySalary() {
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedPayslip, setSelectedPayslip] = useState(null)

    useEffect(() => {
        const fetchSalaries = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getSalaries(1, 50)
                setSalaries(res?.salaries || [])
            } catch (err) {
                console.error('error fetching salaries', err)
                toast.error('Failed to fetch salary records')
                setError('Failed to fetch salary records')
            } finally {
                setLoading(false)
            }
        }
        fetchSalaries()
    }, [])

    const formatMonth = (month) => {
        if (!month) return 'Invalid Month'
        return new Date(month).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })
    }

    const formatShortMonth = (month) => {
        if (!month) return ''
        return new Date(month).toLocaleDateString("en-US", { month: 'short' })
    }

    const formatYear = (month) => {
        if (!month) return ''
        return new Date(month).toLocaleDateString("en-US", { year: 'numeric' })
    }

    // Metric Calculations
    const latestSalary = salaries[0]
    const totalNetEarned = salaries.reduce((acc, curr) => acc + (curr.netSalary || 0), 0)
    const totalAllowances = salaries.reduce((acc, curr) => acc + (curr.allowance || 0), 0)
    const totalDeductions = salaries.reduce((acc, curr) => acc + (curr.deduction || 0), 0)

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className='p-4 md:p-6 space-y-4 max-w-7xl mx-auto'>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">
                            My Salary & Compensation
                        </h1>
                        <p className="text-xs text-slate-500">
                            Monthly payslips, earnings breakdown, and tax deductions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80">
                        {salaries.length} Payslip(s) on record
                    </span>
                </div>
            </div>

            {/* Financial Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Latest Net Pay */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latest Net Pay</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                            {latestSalary ? `₹${latestSalary.netSalary?.toLocaleString()}` : '₹0'}
                        </h3>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            {latestSalary ? formatMonth(latestSalary.month) : 'No payouts yet'}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                {/* Total Cumulative Earnings */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
                        <h3 className="text-2xl font-black text-indigo-600 mt-1">
                            ₹{totalNetEarned.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Cumulative net earnings</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                </div>

                {/* Total Allowances */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Allowances</p>
                        <h3 className="text-2xl font-black text-blue-600 mt-1">
                            +₹{totalAllowances.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Bonuses & benefits</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                </div>

                {/* Total Deductions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Deductions</p>
                        <h3 className="text-2xl font-black text-rose-600 mt-1">
                            -₹{totalDeductions.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Taxes & standard cuts</p>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                        <ArrowDownRight className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Monthly Payslips History
                        </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200/60">
                        {salaries.length} Slips Generated
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center items-center text-slate-500 gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs">Loading salary statements...</span>
                    </div>
                ) : error ? (
                    <div className="text-rose-600 text-center py-6 text-xs font-medium bg-rose-50/50">
                        {error}
                    </div>
                ) : salaries.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">No Salary Statements Found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Your HR team has not published any payslips for your account yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50/90 text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                                    <th className="py-3 px-5">Pay Period</th>
                                    <th className="py-3 px-4">Base Salary</th>
                                    <th className="py-3 px-4">Allowance</th>
                                    <th className="py-3 px-4">Deduction</th>
                                    <th className="py-3 px-4">Net Take-Home</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {salaries.map((s) => {
                                    const isPaid = s.status?.toLowerCase() === 'paid'
                                    const isProcessing = s.status?.toLowerCase() === 'processing'

                                    return (
                                        <tr key={s._id} className="hover:bg-indigo-50/20 transition-colors">
                                            {/* Period with badge */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                                                        <span className="text-[9px] font-bold text-indigo-600 uppercase leading-none">{formatShortMonth(s.month)}</span>
                                                        <span className="text-[10px] font-extrabold text-slate-800 leading-none mt-0.5">{formatYear(s.month)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-xs">{formatMonth(s.month)}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Direct Deposit</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Base */}
                                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                                                ₹{s.baseSalary?.toLocaleString()}
                                            </td>

                                            {/* Allowance */}
                                            <td className="py-3.5 px-4 font-semibold text-emerald-600">
                                                +₹{s.allowance ? s.allowance.toLocaleString() : '0'}
                                            </td>

                                            {/* Deduction */}
                                            <td className="py-3.5 px-4 font-semibold text-rose-600">
                                                -₹{s.deduction ? s.deduction.toLocaleString() : '0'}
                                            </td>

                                            {/* Net Take-Home */}
                                            <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                                ₹{s.netSalary?.toLocaleString()}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    isPaid
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : isProcessing
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {isPaid && <CheckCircle2 className="w-3 h-3" />}
                                                    {isProcessing && <Clock className="w-3 h-3" />}
                                                    {s.status}
                                                </span>
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-3.5 px-5 text-right">
                                                <button
                                                    onClick={() => setSelectedPayslip(s)}
                                                    className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-2xs">
                                                    View Slip
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payslip Modal Preview */}
            {selectedPayslip && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">WorkSphere Payslip</h3>
                                <p className="text-xs text-slate-500">Period: {formatMonth(selectedPayslip.month)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Print">
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none">
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Employee Meta */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Employee Name:</span>
                                <span className="font-bold text-slate-800">{selectedPayslip.employee?.name || 'Staff Member'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Designation / Role:</span>
                                <span className="font-bold text-slate-800">{selectedPayslip.employee?.role || 'Employee'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Payment Status:</span>
                                <span className="font-bold text-emerald-600 uppercase">{selectedPayslip.status}</span>
                            </div>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Base Salary</span>
                                <span className="font-bold text-slate-900">₹{selectedPayslip.baseSalary?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Special Allowances & Perks</span>
                                <span className="font-bold text-emerald-600">+₹{selectedPayslip.allowance?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Tax & Provident Deductions</span>
                                <span className="font-bold text-rose-600">-₹{selectedPayslip.deduction?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between py-3 bg-indigo-50/60 px-3 rounded-xl border border-indigo-100/80 text-sm font-black">
                                <span className="text-indigo-900">Net Take-Home Pay</span>
                                <span className="text-indigo-700 text-base">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedPayslip(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MySalary
