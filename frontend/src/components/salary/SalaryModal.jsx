import React, { useEffect, useState } from 'react'
import { createSalary } from '../../services/SalaryService'
import { getUsers } from '../../services/userService'
import { toast } from 'react-toastify'
import { X, Banknote, Calculator, CheckCircle2, Loader2 } from 'lucide-react'

function SalaryModal({ onClose, onSuccess }) {
    const [employees, setEmployees] = useState([])
    const [formData, setFormData] = useState({
        employee: '',
        baseSalary: '',
        allowance: '0',
        deduction: '0',
        month: new Date().toISOString().substring(0, 7), // YYYY-MM
    })
    const [loading, setLoading] = useState(false)
    const [fetchingUsers, setFetchingUsers] = useState(true)

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setFetchingUsers(true)
                const res = await getUsers(1, 100)
                const list = res?.users || (Array.isArray(res) ? res : [])
                setEmployees(list)
            } catch (error) {
                console.error('failed to fetch employees', error)
                toast.error('Failed to load employee list')
            } finally {
                setFetchingUsers(false)
            }
        }
        fetchEmployee()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const base = Number(formData.baseSalary) || 0
    const allowance = Number(formData.allowance) || 0
    const deduction = Number(formData.deduction) || 0
    const netSalary = Math.max(0, base + allowance - deduction)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!formData.employee || !formData.baseSalary || !formData.month) {
            toast.error('Please fill in Employee, Base Salary, and Month')
            return
        }

        // Format month into full date string (first of the month)
        const monthDate = formData.month.length === 7 ? `${formData.month}-01` : formData.month

        setLoading(true)
        try {
            const res = await createSalary({
                employee: formData.employee,
                baseSalary: base,
                allowance: allowance,
                deduction: deduction,
                month: monthDate
            })
            toast.success('Salary record generated successfully')
            if (onSuccess) onSuccess(res.data)
            onClose()
        } catch (error) {
            console.error('failed to create salary', error)
            toast.error(error?.message || 'Failed to create salary record')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
                            <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Generate Payroll Record</h2>
                            <p className="text-xs text-slate-300">Create new compensation slip for an employee</p>
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
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    {/* Employee Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Employee <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="employee"
                            value={formData.employee}
                            onChange={handleChange}
                            required
                            disabled={fetchingUsers}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                        >
                            <option value="">{fetchingUsers ? "Loading staff list..." : "-- Select Employee --"}</option>
                            {employees.map(emp => (
                                <option value={emp._id} key={emp._id}>
                                    {emp.name} — {emp.role} {emp.department ? `(${emp.department})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Month Period */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Pay Month <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="month"
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        {/* Base Salary */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Base Salary (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="baseSalary"
                                placeholder="e.g. 50000"
                                min="0"
                                value={formData.baseSalary}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Allowance */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Allowances (₹)
                            </label>
                            <input
                                type="number"
                                name="allowance"
                                placeholder="0"
                                min="0"
                                value={formData.allowance}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        {/* Deduction */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Deductions (₹)
                            </label>
                            <input
                                type="number"
                                name="deduction"
                                placeholder="0"
                                min="0"
                                value={formData.deduction}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Net Salary Preview Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Calculated Net Payout</p>
                                <p className="text-xs text-slate-400">Base + Allowances - Deductions</p>
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
                            disabled={loading || !formData.baseSalary || !formData.employee}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Create Salary Record</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SalaryModal
