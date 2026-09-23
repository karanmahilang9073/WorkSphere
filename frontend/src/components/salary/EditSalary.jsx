import React, { useState } from 'react'
import { updateSalary } from '../../services/SalaryService'
import { toast } from 'react-toastify'
import { X, Edit3, Calculator, Save, Loader2 } from 'lucide-react'

function EditSalary({ salary, onClose, onUpdate }) {
    const [baseSalary, setBaseSalary] = useState(salary?.baseSalary || 0)
    const [allowance, setAllowance] = useState(salary?.allowance || 0)
    const [deduction, setDeduction] = useState(salary?.deduction || 0)
    const [loading, setLoading] = useState(false)

    const base = Number(baseSalary) || 0
    const allow = Number(allowance) || 0
    const deduct = Number(deduction) || 0
    const netSalary = Math.max(0, base + allow - deduct)

    const formatMonth = (m) => {
        if (!m) return ''
        return new Date(m).toLocaleDateString('default', { month: 'long', year: 'numeric' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateSalary(salary._id, {
                baseSalary: base,
                allowance: allow,
                deduction: deduct
            })
            onUpdate(res.data)
            toast.success('Salary updated successfully')
            onClose()
        } catch (error) {
            console.error('failed to update salary', error)
            toast.error(error?.message || 'Failed to update salary')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Edit Salary Breakdown</h2>
                            <p className="text-xs text-slate-300">
                                {salary?.employee?.name} • {formatMonth(salary?.month)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Base Salary (₹)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={baseSalary}
                            onChange={(e) => setBaseSalary(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Allowance (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={allowance}
                                onChange={(e) => setAllowance(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Deduction (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={deduction}
                                onChange={(e) => setDeduction(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Calculated Net Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Updated Net Salary</p>
                                <p className="text-xs text-slate-400">Total payable to employee</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-slate-900">
                                ₹{netSalary.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditSalary
