import React, { useEffect, useState } from 'react'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import { getMyAttendance, checkIn, checkOut, checkInWithQR } from '../../services/attendanceService'
import { toast } from 'react-toastify'
import { MapPin, QrCode, Clock, ShieldCheck, Zap, RefreshCw } from 'lucide-react'

function MyAttendance() {
    const today = new Date()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState(null)
    const [todayAttendance, setTodayAttendance] = useState(null)

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
                { timeout: 5000 }
            )
        })
    }

    // Standard / Geo-Check-In
    const handleCheckIn = async () => {
        if (todayAttendance?.checkIn) {
            toast.error("Already checked in today")
            return
        }

        setActionLoading(true)
        try {
            const loc = await getCoordinates()
            const res = await checkIn(loc, loc ? "geofence" : "manual")
            toast.success(loc ? 'Geo-verified check-in successful!' : 'Check-in successful!')
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
            toast.error("Please enter the Office QR code/token")
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
            toast.error("Check-in not found")
            return
        }

        setActionLoading(true)
        try {
            const res = await checkOut()
            setTodayAttendance(res.attendance)
            setAttendance(prev => prev.map(a => a._id === res.attendance._id ? res.attendance : a))
            toast.success('Check-out successful! Work hours recorded.')
        } catch (err) {
            toast.error(err?.message || 'Check-out failed')
        } finally {
            setActionLoading(false)
        }
    }

    // Summary statistics
    const totalHours = attendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(1)
    const totalOvertime = attendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0).toFixed(1)
    const presentDays = attendance.filter(a => a.status === 'present').length

    return (
        <div className='p-6 space-y-6 max-w-7xl mx-auto'>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-600" /> Attendance & Work Tracking
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Track daily shifts, overtime hours, and verify touchless check-ins</p>
                </div>

                {/* Month filter */}
                <div className="flex gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className='border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none'>
                        {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                        ].map((name, i) => (
                            <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className='border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none'>
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Days Present</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{presentDays}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Hours Worked</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{totalHours} hrs</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Overtime</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">+{totalOvertime} hrs</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Zap className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Today's Action Bar */}
            {isCurrentMonth && (
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 rounded-2xl shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">Today's Shift Status</span>
                            <h2 className="text-xl font-bold mt-1">
                                {todayAttendance?.checkIn
                                    ? todayAttendance.checkOut
                                        ? "Shift Completed for Today"
                                        : "Shift in Progress"
                                    : "You have not checked in today"}
                            </h2>
                            <p className="text-xs text-indigo-200 mt-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Geo-Fencing & Office QR Verification Enabled
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleCheckIn}
                                disabled={todayAttendance?.checkIn || actionLoading}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                                <MapPin className="w-4 h-4" /> Check In (Geo-Fence)
                            </button>

                            <button
                                onClick={() => setShowQRModal(true)}
                                disabled={todayAttendance?.checkIn || actionLoading}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 text-sm border border-white/20">
                                <QrCode className="w-4 h-4" /> Scan Office QR
                            </button>

                            <button
                                onClick={handleCheckOut}
                                disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut || actionLoading}
                                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                                Check Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Cards Grid */}
            <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Attendance Log</h3>

                {loading && (
                    <div className="py-12 flex justify-center items-center text-gray-500 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" /> Loading attendance records...
                    </div>
                )}

                {error && <p className="text-rose-500 text-center py-6">{error}</p>}

                {!loading && attendance.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                        No attendance records found for this period.
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attendance.map(a => (
                        <AttendanceCard key={a._id} attendance={a} />
                    ))}
                </div>
            </div>

            {/* QR Check-In Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-600" /> Office QR Code Check-In
                            </h3>
                            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
                        </div>

                        <p className="text-xs text-gray-500">
                            Scan or paste the active 60-second QR token displayed on your office kiosk screen:
                        </p>

                        <form onSubmit={handleQRCheckIn} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Paste QR token / Scanned code"
                                value={qrCodeInput}
                                onChange={(e) => setQrCodeInput(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                            />

                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQRModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                                    {actionLoading ? 'Verifying...' : 'Submit Check-In'}
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