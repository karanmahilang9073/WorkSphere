import React, { useEffect, useState } from 'react'
import { getMyAttendance, checkIn, checkOut, checkInWithQR } from '../../services/attendanceService'
import { toast } from 'react-toastify'
import {
    MapPin,
    QrCode,
    Clock,
    ShieldCheck,
    Zap,
    RefreshCw,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    CheckCircle2,
    CalendarDays,
    Timer,
    Check,
    AlertCircle
} from 'lucide-react'

function MyAttendance() {
    const today = new Date()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState(null)
    const [todayAttendance, setTodayAttendance] = useState(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8

    // Real-time clock
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // QR Modal State
    const [showQRModal, setShowQRModal] = useState(false)
    const [qrCodeInput, setQrCodeInput] = useState('')

    // Fetch monthly attendance
    const fetchAttendance = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getMyAttendance(month, year)
            setAttendance(data || [])
            setCurrentPage(1)
        } catch (err) {
            console.error(err)
            toast.error('Failed to fetch attendance')
            setError('Failed to fetch attendance')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendance()
    }, [month, year])

    // Update today's attendance record
    useEffect(() => {
        const todayDate = new Date()
        const todayRecord = attendance.find(a => {
            const d1 = new Date(a.date)
            return (
                d1.getDate() === todayDate.getDate() &&
                d1.getMonth() === todayDate.getMonth() &&
                d1.getFullYear() === todayDate.getFullYear()
            )
        })
        setTodayAttendance(todayRecord || null)
    }, [attendance])

    const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear()

    // Helper: Get Browser Location
    const getCoordinates = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null)
                return
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { timeout: 6000, enableHighAccuracy: true }
            )
        })
    }

    // Geo-Fence Check-In
    const handleCheckIn = async () => {
        if (todayAttendance?.checkIn) {
            toast.error("Already checked in today")
            return
        }

        setActionLoading(true)
        try {
            const loc = await getCoordinates()
            if (!loc) {
                toast.error("GPS location permission is required. Please allow location access or scan the Office QR Code.")
                setActionLoading(false)
                return
            }
            const res = await checkIn(loc, "geofence")
            toast.success('Geo-verified check-in successful!')
            setTodayAttendance(res.attendance)
            setAttendance(prev => [res.attendance, ...prev])
        } catch (err) {
            toast.error(err?.message || 'Check-in failed')
        } finally {
            setActionLoading(false)
        }
    }

    // QR Code Check-In
    const handleQRCheckIn = async (e) => {
        e.preventDefault()
        if (!qrCodeInput.trim()) {
            toast.error("Please enter or paste the Office QR token")
            return
        }

        setActionLoading(true)
        try {
            const loc = await getCoordinates()
            const res = await checkInWithQR(qrCodeInput.trim(), loc)
            toast.success('QR Code Check-in successful!')
            setTodayAttendance(res.attendance)
            setAttendance(prev => [res.attendance, ...prev.filter(a => a._id !== res.attendance._id)])
            setShowQRModal(false)
            setQrCodeInput('')
        } catch (err) {
            toast.error(err?.message || 'Invalid or expired QR code')
        } finally {
            setActionLoading(false)
        }
    }

    // Check Out
    const handleCheckOut = async () => {
        if (!todayAttendance) {
            toast.error("Check-in record not found")
            return
        }

        setActionLoading(true)
        try {
            const res = await checkOut()
            setTodayAttendance(res.attendance)
            setAttendance(prev => prev.map(a => a._id === res.attendance._id ? res.attendance : a))
            toast.success('Check-out successful! Shift hours recorded.')
        } catch (err) {
            toast.error(err?.message || 'Check-out failed')
        } finally {
            setActionLoading(false)
        }
    }

    // Calculations & Formats
    const totalHours = attendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(1)
    const totalOvertime = attendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0).toFixed(1)
    const presentDays = attendance.filter(a => a.status === 'present').length

    const formatTime = (date) => {
        if (!date) return '--:--'
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    const formatDateMonth = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', { month: 'short' })
    }

    const formatDateDay = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', { day: '2-digit' })
    }

    const formatDateYear = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric' })
    }

    const formatDayName = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    }

    // Pagination calculations
    const totalPages = Math.ceil(attendance.length / pageSize) || 1
    const paginatedRecords = attendance.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return (
        <div className='p-4 md:p-6 space-y-4 max-w-7xl mx-auto'>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">
                            My Attendance
                        </h1>
                        <p className="text-xs text-slate-500">
                            Live tracking, geo-verified punches & monthly records
                        </p>
                    </div>
                </div>

                {/* Filter Month/Year Selector */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className='appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg pl-2.5 pr-7 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'>
                            {[
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                            ].map((name, i) => (
                                <option key={i + 1} value={i + 1}>{name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className='appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg pl-2.5 pr-7 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'>
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Present</p>
                        <h3 className="text-xl font-black text-slate-900 mt-0.5">{presentDays} <span className="text-xs font-medium text-slate-400">days</span></h3>
                    </div>
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Hours</p>
                        <h3 className="text-xl font-black text-indigo-600 mt-0.5">{totalHours} <span className="text-xs font-medium text-slate-400">hrs</span></h3>
                    </div>
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Overtime</p>
                        <h3 className="text-xl font-black text-amber-600 mt-0.5">+{totalOvertime} <span className="text-xs font-medium text-slate-400">hrs</span></h3>
                    </div>
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Current Time</p>
                        <h3 className="text-sm font-bold font-mono text-white mt-0.5">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </h3>
                    </div>
                    <div className="w-8 h-8 bg-white/10 text-indigo-300 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Today's Shift Banner */}
            {isCurrentMonth && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                {todayAttendance?.checkIn ? (
                                    todayAttendance.checkOut ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <CheckCircle2 className="w-3 h-3" /> Shift Completed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Shift Active
                                        </span>
                                    )
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                        Not Checked In
                                    </span>
                                )}
                                <span className="text-[11px] text-slate-400">
                                    • {todayAttendance?.shiftType || 'General'} Shift
                                </span>
                            </div>

                            <h2 className="text-sm font-bold text-white">
                                {todayAttendance?.checkIn
                                    ? todayAttendance.checkOut
                                        ? `Completed for today (Closed at ${new Date(todayAttendance.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`
                                        : `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                                    : "Start your shift with Geo-Fence or QR scan"}
                            </h2>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCheckIn}
                                disabled={todayAttendance?.checkIn || actionLoading}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs shadow-xs">
                                <MapPin className="w-3.5 h-3.5" /> Check In
                            </button>

                            <button
                                onClick={() => setShowQRModal(true)}
                                disabled={todayAttendance?.checkIn || actionLoading}
                                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs border border-white/20">
                                <QrCode className="w-3.5 h-3.5 text-indigo-300" /> QR Scan
                            </button>

                            <button
                                onClick={handleCheckOut}
                                disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut || actionLoading}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs shadow-xs">
                                <LogOut className="w-3.5 h-3.5" /> Check Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Elevated Modern Monthly Attendance Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        <h3 className="text-sm font-bold text-slate-900">Attendance Activity Log</h3>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                        {attendance.length} Total Logs
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center items-center text-slate-500 gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs">Loading records...</span>
                    </div>
                ) : error ? (
                    <div className="text-rose-600 text-center py-6 text-xs font-medium bg-rose-50/50">
                        {error}
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-xs font-medium">No attendance records found for this period.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                                        <th className="py-3 px-5">Date</th>
                                        <th className="py-3 px-4">Shift Type</th>
                                        <th className="py-3 px-4">Check-In</th>
                                        <th className="py-3 px-4">Check-Out</th>
                                        <th className="py-3 px-4">Work Duration</th>
                                        <th className="py-3 px-4">Overtime</th>
                                        <th className="py-3 px-4">Method</th>
                                        <th className="py-3 px-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {paginatedRecords.map((a) => {
                                        const isPresent = a.status?.toLowerCase() === 'present'
                                        const isLeave = a.status?.toLowerCase() === 'leave'

                                        return (
                                            <tr key={a._id} className="hover:bg-indigo-50/25 transition-colors group">
                                                {/* Date with badge */}
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase leading-none">{formatDateMonth(a.date)}</span>
                                                            <span className="text-xs font-extrabold text-slate-900 leading-none mt-0.5">{formatDateDay(a.date)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-xs">{formatDayName(a.date)}, {formatDateYear(a.date)}</div>
                                                            <div className="text-[10px] text-slate-400 font-normal">{a.employee?.name || 'Staff'}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Shift */}
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-semibold border border-purple-200/60">
                                                        {a.shiftType || 'General'}
                                                    </span>
                                                </td>

                                                {/* Check-In */}
                                                <td className="py-3 px-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-emerald-800 font-semibold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {formatTime(a.checkIn)}
                                                    </div>
                                                </td>

                                                {/* Check-Out */}
                                                <td className="py-3 px-4">
                                                    {a.checkOut ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50/80 border border-rose-200/60 rounded-lg text-rose-800 font-semibold text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                            {formatTime(a.checkOut)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-normal text-xs pl-2">--:--</span>
                                                    )}
                                                </td>

                                                {/* Work Hours */}
                                                <td className="py-3 px-4">
                                                    {a.workHours ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900 text-xs">{a.workHours.toFixed(1)} hrs</span>
                                                            <span className="text-[10px] text-slate-400 font-normal">/ 8h</span>
                                                        </div>
                                                    ) : a.checkIn && !a.checkOut ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-semibold border border-indigo-100">
                                                            <Timer className="w-3 h-3 animate-spin" /> In Progress
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">--</span>
                                                    )}
                                                </td>

                                                {/* Overtime */}
                                                <td className="py-3 px-4">
                                                    {a.overtimeHours > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                                                            <Zap className="w-3 h-3 text-amber-500" /> +{a.overtimeHours} hrs
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">0.0 hrs</span>
                                                    )}
                                                </td>

                                                {/* Method */}
                                                <td className="py-3 px-4">
                                                    {a.checkInMethod === 'qr' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-medium border border-emerald-200">
                                                            <QrCode className="w-3 h-3 text-emerald-600" /> QR Code
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[11px] font-medium border border-cyan-200">
                                                            <MapPin className="w-3 h-3 text-cyan-600" /> Geo-Fence
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {a.late && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                                Late
                                                            </span>
                                                        )}
                                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${
                                                            isPresent 
                                                                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' 
                                                                : isLeave 
                                                                ? 'bg-blue-100/80 text-blue-800 border border-blue-200' 
                                                                : 'bg-rose-100/80 text-rose-800 border border-rose-200'
                                                        }`}>
                                                            {a.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Elevated Pagination Bar */}
                        <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, attendance.length)}</span> of <span className="font-bold text-slate-700">{attendance.length}</span> entries
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs transition-all">
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>

                                <div className="text-xs font-bold text-slate-700 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                                    Page {currentPage} of {totalPages}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs transition-all">
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-indigo-600" /> Office QR Check-In
                            </h3>
                            <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                                ×
                            </button>
                        </div>

                        <p className="text-xs text-slate-500">
                            Enter or paste the active QR token from the kiosk screen:
                        </p>

                        <form onSubmit={handleQRCheckIn} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Paste QR token..."
                                value={qrCodeInput}
                                onChange={(e) => setQrCodeInput(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                                autoFocus
                            />

                            <div className="flex gap-2 justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowQRModal(false)}
                                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {actionLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MyAttendance