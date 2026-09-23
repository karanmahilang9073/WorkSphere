import React, { useEffect, useState } from 'react'
import { X, UserCheck, Mail, Building2, Shield, DollarSign, Save } from 'lucide-react'

function EditemployeeModal({ show, onClose, employee, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        role: '',
        salary: ''
    })
    const [error, setError] = useState({})

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                department: employee.department || '',
                role: employee.role || '',
                salary: employee.salary !== undefined ? employee.salary : ''
            })
            setError({})
        }
    }, [employee])

    if (!show) return null

    const validate = () => {
        let newError = {}
        if (!formData.name || !formData.name.trim()) newError.name = 'Full name is required'
        if (!formData.email || !formData.email.trim()) newError.email = 'Valid email is required'
        if (!formData.department || !formData.department.trim()) newError.department = 'Department is required'
        if (formData.salary === '' || isNaN(formData.salary)) newError.salary = 'Valid salary is required'
        setError(newError)
        return Object.keys(newError).length === 0
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (error[e.target.name]) {
            setError(prev => ({ ...prev, [e.target.name]: undefined }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Edit Employee Details</h2>
                            <p className="text-[11px] text-slate-500">Update personnel record and compensation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Employee Name"
                            className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                        {error.name && <p className="text-rose-500 text-[11px] mt-1 font-medium">{error.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            Work Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="employee@company.com"
                            className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                        {error.email && <p className="text-rose-500 text-[11px] mt-1 font-medium">{error.email}</p>}
                    </div>

                    {/* Department & Role Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                Department
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="IT / Engineering"
                                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            {error.department && <p className="text-rose-500 text-[11px] mt-1 font-medium">{error.department}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                System Role
                            </label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                disabled
                                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            Monthly Salary (₹ / $)
                        </label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="Salary amount"
                            className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                        {error.salary && <p className="text-rose-500 text-[11px] mt-1 font-medium">{error.salary}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditemployeeModal
