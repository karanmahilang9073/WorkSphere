import React, { useEffect, useState } from 'react'
import { getUserProfile, updateUser } from '../../services/userService'
import { toast } from 'react-toastify'
import {
    UserCircle,
    Mail,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Edit3,
    Save,
    X,
    Key,
    Briefcase,
    Calendar,
    Sparkles
} from 'lucide-react'

function Myprofile() {
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
            console.error('Error fetching profile', err)
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
            setIsEditMode(false)
            toast.success('Profile updated successfully!')
        } catch (err) {
            console.error('Error updating profile', err)
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
        <div className='p-4 md:p-6 space-y-4 max-w-5xl mx-auto'>
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
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs">
                    {error}
                </div>
            )}

            {/* Profile Content */}
            {profile && !loading && (
                <div className="space-y-4">
                    {/* Unified Hero Header Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-indigo-300/30 shrink-0 uppercase">
                                    {profile.name ? profile.name.slice(0, 2) : 'WS'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h1 className="text-xl font-bold text-white capitalize leading-tight">
                                            {profile.name}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-indigo-200/90 flex items-center gap-1.5 mt-1 font-medium">
                                        <Mail className="w-3.5 h-3.5 text-indigo-300" /> {profile.email}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-slate-200 font-semibold rounded-lg text-[11px] border border-white/10">
                                            <Building2 className="w-3 h-3 text-indigo-300" /> {profile.department || 'General'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-slate-200 font-semibold rounded-lg text-[11px] border border-white/10">
                                            <ShieldCheck className="w-3 h-3 text-indigo-300" /> {profile.role || 'Employee'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex sm:flex-col items-end gap-2.5 w-full sm:w-auto justify-between">
                                <span className="text-[11px] font-semibold text-indigo-200/80 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Verified ID
                                </span>
                                {!isEditMode && (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all">
                                        <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Container */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">

                        {/* View Mode */}
                        {!isEditMode ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Employee Credentials & Organization Info
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <UserCircle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Full Name</span>
                                                <span className="text-xs font-bold text-slate-800 capitalize">{profile.name}</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Email Address</span>
                                                <span className="text-xs font-bold text-slate-800">{profile.email}</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Department</span>
                                                <span className="text-xs font-bold text-slate-800">{profile.department || 'Not Assigned'}</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Assigned Role</span>
                                                <span className="text-xs font-bold text-slate-800">{profile.role || 'Employee'}</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Employment Status</span>
                                                <span className="text-xs font-bold text-emerald-700">Active & Verified</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                                                <Key className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase block">WorkSphere ID</span>
                                                <span className="text-xs font-mono font-bold text-slate-700">{profile._id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={handleSave} className="space-y-4 pt-2">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Edit Personal Information
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Update your display name, contact email, and department.
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
                                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
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
                                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
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
                                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Role (Read-Only)
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.role}
                                            disabled
                                            className="w-full px-3.5 py-2 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50">
                                        <Save className="w-3.5 h-3.5" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Myprofile
