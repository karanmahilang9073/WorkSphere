import { useState, useEffect, useContext, useMemo } from 'react'
import { getUsers, updateUser, deleteUser } from '../../services/userService'
import { toast } from 'react-toastify'
import EditemployeeModal from '../../components/common/EditemployeeModal'
import { useNavigate, Link } from 'react-router-dom'
import { getPerformance } from '../../services/AiService'
import { AuthContext } from '../../context/AuthContext'
import {
    Users,
    Search,
    UserPlus,
    Sparkles,
    BarChart2,
    Edit3,
    Trash2,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    Building2,
    Shield,
    Mail,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    SlidersHorizontal,
    Briefcase
} from 'lucide-react'

const ROLE_COLORS = {
    Admin: "bg-rose-50 text-rose-700 border-rose-200",
    HR: "bg-purple-50 text-purple-700 border-purple-200",
    Employee: "bg-blue-50 text-blue-700 border-blue-200"
}

const AVATAR_GRADIENTS = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
]

const getInitials = (name) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

function Employee() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [showModal, setShowModal] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [searchEmp, setSearchEmp] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('ALL')
    const [roleFilter, setRoleFilter] = useState('ALL')

    const [viewModal, setViewModal] = useState(false)
    const [deleteEmployee, setDeleteEmployee] = useState(null)

    const [aiPerformance, setAiPerformance] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [showAiModal, setShowAiModal] = useState(false)

    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getUsers(currentPage, 10)
            setEmployees(res.users || [])
            setTotalPages(res.totalPages || 1)
        } catch (err) {
            console.error('Error fetching employees', err)
            setError('Failed to fetch employees')
            toast.error('Failed to fetch employees')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [currentPage])

    // Available Departments
    const departments = useMemo(() => {
        const set = new Set(employees.map(e => e.department).filter(Boolean))
        return ['ALL', ...Array.from(set)]
    }, [employees])

    // Filtered list
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch =
                (emp.name || '').toLowerCase().includes(searchEmp.toLowerCase()) ||
                (emp.email || '').toLowerCase().includes(searchEmp.toLowerCase())
            const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter
            const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter
            return matchesSearch && matchesDept && matchesRole
        })
    }, [employees, searchEmp, departmentFilter, roleFilter])

    const handleEdit = async (data) => {
        setError(null)
        const id = selectedEmployee._id
        try {
            const res = await updateUser(id, data)
            setEmployees(prev => prev.map(e => e._id === id ? res.user : e))
            setShowModal(false)
            toast.success('Employee updated successfully')
        } catch (err) {
            console.error('Error updating user', err)
            toast.error('Failed to update employee')
        }
    }

    const handleDelete = async (id) => {
        setError(null)
        try {
            await deleteUser(id)
            setEmployees(prev => prev.filter(e => e._id !== id))
            toast.success('Employee deleted successfully')
        } catch (err) {
            console.error('Failed to delete user', err)
            toast.error('Failed to delete employee')
        }
    }

    const handleView = (emp) => {
        setSelectedEmployee(emp)
        setViewModal(true)
    }

    const handlePerformance = async (emp) => {
        setSelectedEmployee(emp)
        setAiLoading(true)
        setShowAiModal(true)
        setAiPerformance('')
        try {
            const res = await getPerformance(emp._id)
            setAiPerformance(res)
            toast.success('AI insight generated successfully!')
        } catch (err) {
            console.error('Error fetching performance insight', err)
            setAiPerformance('Failed to generate AI report. Please try again.')
            toast.error('Failed to get performance insight')
        } finally {
            setAiLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {employees.length} Members
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Manage staff profiles, department roles, performance evaluations & analytics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchData}
                        title="Refresh List"
                        className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200/90 rounded-xl transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                    {user?.role === "Admin" && (
                        <Link
                            to="/admin/create-user"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Employee</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3.5 justify-between">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchEmp}
                        onChange={(e) => setSearchEmp(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                    />
                    {searchEmp && (
                        <button
                            onClick={() => setSearchEmp('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filter:</span>
                    </div>

                    {/* Department Filter */}
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept === 'ALL' ? 'All Departments' : dept}
                            </option>
                        ))}
                    </select>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-medium">Loading employee directory...</span>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No employees found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new team member.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Employee</th>
                                    <th className="py-3.5 px-4">Department</th>
                                    <th className="py-3.5 px-4">Role</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredEmployees.map((emp, idx) => {
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                                    const roleClass = ROLE_COLORS[emp.role] || ROLE_COLORS.Employee

                                    return (
                                        <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Name & Avatar */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                                                        {getInitials(emp.name)}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-900 block text-xs">
                                                            {emp.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-300" />
                                                            {emp.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    {emp.department || "General"}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleClass}`}>
                                                    <Shield className="w-3 h-3 opacity-70" />
                                                    {emp.role}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {/* AI Performance Report */}
                                                    <button
                                                        onClick={() => handlePerformance(emp)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200/70 transition shadow-2xs"
                                                        title="Generate AI Performance Review"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span>AI Report</span>
                                                    </button>

                                                    {/* Analytics (Admin only) */}
                                                    {user?.role === "Admin" && (
                                                        <button
                                                            onClick={() => navigate(`/admin/employee-analytics/${emp._id}`)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/70 transition shadow-2xs"
                                                            title="View In-Depth Analytics"
                                                        >
                                                            <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
                                                            <span>Analytics</span>
                                                        </button>
                                                    )}

                                                    {/* View Profile */}
                                                    <button
                                                        onClick={() => handleView(emp)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/70 rounded-xl transition shadow-2xs"
                                                        title="View Profile Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => { setSelectedEmployee(emp); setShowModal(true) }}
                                                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200/70 rounded-xl transition shadow-2xs"
                                                        title="Edit Employee"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete (Admin only) */}
                                                    {user?.role === "Admin" && (
                                                        <button
                                                            onClick={() => setDeleteEmployee(emp)}
                                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/70 rounded-xl transition shadow-2xs"
                                                            title="Delete Employee"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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
                )}

                {/* Table Footer with Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-500">
                        Showing <strong className="text-slate-700">{filteredEmployees.length}</strong> of{' '}
                        <strong className="text-slate-700">{employees.length}</strong> loaded members
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>

                        <span className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-indigo-600">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage >= totalPages || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Employee Profile Modal */}
            {viewModal && selectedEmployee && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="relative p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                            <button
                                onClick={() => setViewModal(false)}
                                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl border border-white/30 shadow-inner">
                                    {getInitials(selectedEmployee.name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
                                        {selectedEmployee.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Details Grid */}
                        <div className="p-6 space-y-4 text-xs">
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                                <div>
                                    <span className="text-[11px] text-slate-400 block font-medium">Work Email</span>
                                    <span className="font-semibold text-slate-800">{selectedEmployee.email}</span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                <div>
                                    <span className="text-[11px] text-slate-400 block font-medium">Department</span>
                                    <span className="font-semibold text-slate-800">{selectedEmployee.department || "General"}</span>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                                <div>
                                    <span className="text-[11px] text-slate-400 block font-medium">System Role</span>
                                    <span className="font-semibold text-slate-800">{selectedEmployee.role}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewModal(false)}
                                className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Performance Modal */}
            {showAiModal && selectedEmployee && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-indigo-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">AI Performance Evaluation</h3>
                                    <p className="text-[11px] text-slate-500">Employee: {selectedEmployee.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {aiLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-medium">WorkSphere AI is analyzing employee performance metrics...</span>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                    {aiPerformance}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                            <button
                                onClick={() => handlePerformance(selectedEmployee)}
                                disabled={aiLoading}
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/80 transition flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Re-evaluate
                            </button>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteEmployee && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200/90 text-center animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5 shadow-inner">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Delete Employee?</h2>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                            Are you sure you want to permanently remove <strong className="text-slate-800">{deleteEmployee.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-2.5">
                            <button
                                onClick={() => setDeleteEmployee(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleDelete(deleteEmployee._id); setDeleteEmployee(null) }}
                                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            <EditemployeeModal
                show={showModal}
                onClose={() => setShowModal(false)}
                employee={selectedEmployee}
                onSave={handleEdit}
            />
        </div>
    )
}

export default Employee
