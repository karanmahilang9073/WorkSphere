import React from 'react'
import { User, Check, Edit3, Bot, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function SalaryCard({ salary, onStatusUpdate, onEdit, onPredict }) {
    if (!salary) return null

    const formatMonth = (month) => {
        if (!month) return 'N/A'
        return new Date(month).toLocaleDateString("default", { month: 'short', year: 'numeric' })
    }

    const statusConfig = {
        paid: {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
            dot: 'bg-emerald-500',
            label: 'Paid'
        },
        processing: {
            badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
            dot: 'bg-sky-500 animate-pulse',
            label: 'Processing'
        },
        pending: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
            dot: 'bg-amber-500',
            label: 'Pending'
        }
    }

    const currentStatus = statusConfig[salary.status] || {
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: salary.status?.toUpperCase() || 'UNKNOWN'
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            {/* Top Bar */}
            <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatMonth(salary.month)}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}></span>
                    {currentStatus.label}
                </span>
            </div>

            {/* Employee Details */}
            <div className="p-4 pt-3.5 flex-1">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {salary.employee?.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {salary.employee?.name || 'Unknown Employee'}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                            {salary.employee?.email || 'No email'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                {salary.employee?.role || 'Staff'}
                            </span>
                            {salary.employee?.department && (
                                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                                    {salary.employee?.department}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Net Salary Amount */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-3">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Net Payout
                    </span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        ₹{Number(salary.netSalary || 0).toLocaleString('en-IN')}
                    </div>
                </div>

                {/* Breakdown Mini Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <ArrowUpRight className="w-3 h-3" /> Allowances
                        </div>
                        <p className="font-bold text-emerald-800 mt-0.5">
                            +₹{Number(salary.allowance || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100/60 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                            <ArrowDownRight className="w-3 h-3" /> Deductions
                        </div>
                        <p className="font-bold text-rose-800 mt-0.5">
                            -₹{Number(salary.deduction || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Integrated Card Footer Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                {salary.status !== 'paid' ? (
                    <button
                        onClick={() => onStatusUpdate(salary._id, salary.status === 'pending' ? 'paid' : 'paid')}
                        title="Mark as Paid"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                        <Check className="w-3 h-3" />
                        <span>Pay</span>
                    </button>
                ) : (
                    <div className="flex-1 text-center py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100/60 rounded-lg">
                        Disbursed
                    </div>
                )}

                <button
                    onClick={() => onEdit(salary)}
                    disabled={salary.status === 'paid'}
                    title={salary.status === 'paid' ? 'Paid slips cannot be edited' : 'Edit salary details'}
                    className="p-2 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>

                {salary.status !== 'paid' && onPredict && (
                    <button
                        onClick={() => onPredict(salary.employee?._id || salary.employee)}
                        title="AI Salary Forecast"
                        className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Bot className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default SalaryCard
