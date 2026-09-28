import React, { useEffect, useState } from 'react'
import { getUserProfile, updateUser } from '../../services/userService'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import {
    UserCircle,
    Mail,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Edit3,
    Save,
    Sparkles,
    Shield,
    Users,
    MapPin,
    Clock,
    BarChart3,
    ArrowRight,
    Crown
} from 'lucide-react'

function Profile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Edit state
    const [isEditMode, setIsEditMode] = useState(false)
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        department: '',
    })
    const [isSaving, setIsSaving] = useState(false)

    const fetchProfile = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getUserProfile()
            setProfile(res)
            setEditData({
                name: res?.name || '',
                email: res?.email || '',
                department: res?.department || '',
            })
        } catch (err) {
            console.error('Error fetching admin profile', err)
            setError('Failed to load profile details')
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!profile?._id) return

        setIsSaving(true)
        try {
            const updated = await updateUser(profile._id, editData)
            setProfile(updated)
            // Update stored user in local storage to keep layout in sync
            const stored = localStorage.getItem('user')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    localStorage.setItem('user', JSON.stringify({ ...parsed, ...updated }))
                } catch (e) {
                    /* ignore */
                }
            }
            setIsEditMode(false)
            toast.success('Admin profile updated successfully!')
        } catch (err) {
            console.error('Error updating admin profile', err)
            toast.error(err?.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditData({
            name: profile?.name || '',
            email: profile?.email || '',
            department: profile?.department || '',
        })
        setIsEditMode(false)
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Loading Skeleton */}
            {loading && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs space-y-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
                        <div className="space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-48"></div>
                            <div className="h-3.5 bg-slate-200 rounded w-32"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="h-16 bg-slate-100 rounded-xl"></div>
                        <div className="h-16 bg-slate-100 rounded-xl"></div>
                        <div className="h-16 bg-slate-100 rounded-xl"></div>
                        <div className="h-16 bg-slate-100 rounded-xl"></div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold">
                    {error}
                </div>
            )}

            {/* Profile Content */}
            {profile && !loading && (
                <div className="space-y-6">
                    {/* Unified Hero Header Card */}
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-slate-800 relative overflow-hidden">
                        {/* Decorative ambient glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-indigo-400/30 shrink-0 uppercase tracking-tight">
                                    {profile.name ? profile.name.slice(0, 2) : 'AD'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-xl sm:text-2xl font-bold text-white capitalize leading-tight">
                                            {profile.name}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Active Administrator
                                        </span>
                                    </div>
                                    <p className="text-xs text-indigo-200/90 flex items-center gap-1.5 mt-1 font-medium">
                                        <Mail className="w-3.5 h-3.5 text-indigo-300" /> {profile.email}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-slate-200 font-semibold rounded-lg text-[11px] border border-white/10">
                                            <Building2 className="w-3 h-3 text-indigo-300" /> {profile.department || 'Management'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-200 font-semibold rounded-lg text-[11px] border border-indigo-400/20">
                                            <Crown className="w-3 h-3 text-amber-300" /> {profile.role || 'Admin'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex sm:flex-col items-end gap-2.5 w-full sm:w-auto justify-between">
                                <span className="text-[11px] font-semibold text-indigo-200/90 bg-white/10 px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                    Full Access Granted
                                </span>
                                {!isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Container */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
                        {!isEditMode ? (
                            /* View Mode */
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                        Administrator Credentials & Organization Info
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <UserCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Full Name</span>
                                                <span className="text-xs font-bold text-slate-800 capitalize">{profile.name}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Email Address</span>
                                                <span className="text-xs font-bold text-slate-800">{profile.email}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Department</span>
                                                <span className="text-xs font-bold text-slate-800">{profile.department || 'Not Assigned'}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">System Role & Privilege</span>
                                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                    {profile.role || 'Admin'}
                                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-semibold border border-indigo-200/60">
                                                        Super Admin
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3.5 md:col-span-2">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Access Status</span>
                                                <span className="text-xs font-bold text-emerald-700">Active & Unrestricted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={handleSave} className="space-y-5 pt-2">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Edit Administrator Information
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Update your contact name, administration email address, and department.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={editData.department}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Role (System Protected)
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.role}
                                            disabled
                                            className="w-full px-3.5 py-2.5 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer">
                                        <Save className="w-3.5 h-3.5" />
                                        <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Quick Access Administrative Control Shortcuts */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            Administrative Shortcuts & System Governance
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <Link
                                to="/admin/employees"
                                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Workforce</p>
                                        <p className="text-[10px] text-slate-400">Manage Staff</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </Link>

                            <Link
                                to="/admin/geo-fence"
                                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Geo-Fence</p>
                                        <p className="text-[10px] text-slate-400">Office Radius</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </Link>

                            <Link
                                to="/admin/shifts"
                                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Shifts</p>
                                        <p className="text-[10px] text-slate-400">Timings & Grace</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </Link>

                            <Link
                                to="/admin/analytics"
                                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Analytics</p>
                                        <p className="text-[10px] text-slate-400">Reports & KPIs</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile

