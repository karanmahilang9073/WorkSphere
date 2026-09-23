import React, { useState, useEffect } from 'react'
import { getShifts, updateShifts } from '../../services/attendanceService'
import { toast } from 'react-toastify'
import {
    Clock,
    Sun,
    Briefcase,
    Sunset,
    Moon,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Info,
    ShieldAlert,
    Timer
} from 'lucide-react'

const SHIFT_ICONS = {
    morning: Sun,
    general: Briefcase,
    evening: Sunset,
    night: Moon
}

const SHIFT_COLORS = {
    morning: {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        iconBg: "bg-amber-100 text-amber-600",
        border: "border-amber-200"
    },
    general: {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-100 text-blue-600",
        border: "border-blue-200"
    },
    evening: {
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        iconBg: "bg-orange-100 text-orange-600",
        border: "border-orange-200"
    },
    night: {
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        iconBg: "bg-indigo-100 text-indigo-600",
        border: "border-indigo-200"
    }
}

const DEFAULT_FALLBACK = [
    {
        shiftEnum: "morning",
        shiftType: "Morning",
        name: "Morning Shift",
        startTime: "08:00",
        endTime: "17:00",
        graceMinutes: 15,
        windowStartHour: 6,
        windowEndHour: 12,
        isActive: true
    },
    {
        shiftEnum: "general",
        shiftType: "General",
        name: "General Shift",
        startTime: "10:00",
        endTime: "19:00",
        graceMinutes: 15,
        windowStartHour: 12,
        windowEndHour: 17,
        isActive: true
    },
    {
        shiftEnum: "evening",
        shiftType: "Evening",
        name: "Evening Shift",
        startTime: "14:00",
        endTime: "23:00",
        graceMinutes: 15,
        windowStartHour: 17,
        windowEndHour: 22,
        isActive: true
    },
    {
        shiftEnum: "night",
        shiftType: "Night",
        name: "Night Shift",
        startTime: "22:00",
        endTime: "06:00",
        graceMinutes: 15,
        windowStartHour: 22,
        windowEndHour: 6,
        isActive: true
    }
]

export default function ShiftSettings() {
    const [shifts, setShifts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchShifts = async () => {
        setLoading(true)
        try {
            const data = await getShifts()
            if (data && data.length > 0) {
                setShifts(data)
            } else {
                setShifts(DEFAULT_FALLBACK)
            }
        } catch (err) {
            console.error("Failed to load shift timings:", err)
            toast.error("Failed to load shifts")
            setShifts(DEFAULT_FALLBACK)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShifts()
    }, [])

    const handleShiftChange = (index, field, value) => {
        setShifts(prev => {
            const copy = [...prev]
            copy[index] = { ...copy[index], [field]: value }
            return copy
        })
    }

    const handleResetDefaults = () => {
        if (window.confirm("Are you sure you want to reset all shift timings to company defaults?")) {
            setShifts(DEFAULT_FALLBACK)
            toast.info("Shift timings reset to defaults. Click 'Save Shift Timings' to apply.")
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateShifts(shifts)
            toast.success("Shift timings saved successfully!")
            await fetchShifts()
        } catch (err) {
            console.error("Failed to update shifts:", err)
            toast.error(err?.message || "Failed to update shifts")
        } finally {
            setSaving(false)
        }
    }

    const calculateShiftDuration = (start, end) => {
        if (!start || !end) return "--"
        const [sh, sm] = start.split(':').map(Number)
        const [eh, em] = end.split(':').map(Number)
        let startMins = sh * 60 + sm
        let endMins = eh * 60 + em
        if (endMins <= startMins) {
            endMins += 24 * 60
        }
        const diffHrs = ((endMins - startMins) / 60).toFixed(1)
        return `${diffHrs} hrs`
    }

    const calculateLateTime = (startTime, grace) => {
        if (!startTime) return "--"
        const [h, m] = startTime.split(':').map(Number)
        const graceNum = parseInt(grace) || 0
        let total = h * 60 + m + graceNum
        const lh = Math.floor((total % (24 * 60)) / 60)
        const lm = total % 60
        const pad = (n) => n.toString().padStart(2, '0')
        return `${pad(lh)}:${pad(lm)}`
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shift Timings & Rules</h1>
                        <p className="text-sm text-slate-500">Configure company work shifts, daily start/end times, and late check-in grace periods</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Defaults
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{saving ? 'Saving...' : 'Save Shifts'}</span>
                    </button>
                </div>
            </div>

            {/* Info Notice */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-indigo-900">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <span className="font-semibold">How Shift Assignment Works:</span>
                    <p className="text-xs text-indigo-700 leading-relaxed">
                        When employees check in, WorkSphere evaluates their arrival against the configured shifts and grace periods. If an employee clocks in after the shift start time plus the grace minutes, they are automatically flagged as <strong className="text-rose-600">Late</strong>.
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/90 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Loading shift configurations...</p>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shifts.map((shift, idx) => {
                            const IconComponent = SHIFT_ICONS[shift.shiftEnum] || Clock
                            const colors = SHIFT_COLORS[shift.shiftEnum] || SHIFT_COLORS.general
                            const lateTime = calculateLateTime(shift.startTime, shift.graceMinutes)
                            const duration = calculateShiftDuration(shift.startTime, shift.endTime)

                            return (
                                <div
                                    key={shift.shiftEnum || idx}
                                    className={`bg-white rounded-2xl p-5 border shadow-sm transition hover:shadow-md ${
                                        shift.isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/60 opacity-80'
                                    }`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={shift.name}
                                                    onChange={(e) => handleShiftChange(idx, 'name', e.target.value)}
                                                    className="font-bold text-slate-800 text-sm focus:outline-none focus:border-b-2 focus:border-indigo-600 bg-transparent"
                                                />
                                                <p className="text-xs text-slate-400 capitalize">{shift.shiftEnum} Shift</p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-xs font-medium text-slate-500">Active</span>
                                            <input
                                                type="checkbox"
                                                checked={shift.isActive !== false}
                                                onChange={(e) => handleShiftChange(idx, 'isActive', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </label>
                                    </div>

                                    {/* Inputs Grid */}
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {/* Start Time */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={shift.startTime || "09:00"}
                                                onChange={(e) => handleShiftChange(idx, 'startTime', e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                required
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={shift.endTime || "18:00"}
                                                onChange={(e) => handleShiftChange(idx, 'endTime', e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                required
                                            />
                                        </div>

                                        {/* Grace Period */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                                                <Timer className="w-3.5 h-3.5 text-slate-400" />
                                                Grace Period (Mins)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="120"
                                                    value={shift.graceMinutes ?? 15}
                                                    onChange={(e) => handleShiftChange(idx, 'graceMinutes', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-12"
                                                />
                                                <span className="absolute right-3 top-2 text-xs text-slate-400 font-normal">min</span>
                                            </div>
                                        </div>

                                        {/* Shift Duration pill */}
                                        <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                                <span className="text-[11px] text-slate-400 block font-medium">Expected Duration</span>
                                                <span className="text-xs font-bold text-slate-700">{duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto-Assignment Window */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-slate-600">Active Window:</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[10px]">
                                                {shift.windowStartHour}:00 - {shift.windowEndHour}:00
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-600">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>Late if clock-in &gt; {lateTime}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Changes will take effect immediately for all subsequent employee check-ins.</span>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{saving ? 'Saving...' : 'Save Shift Timings'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

