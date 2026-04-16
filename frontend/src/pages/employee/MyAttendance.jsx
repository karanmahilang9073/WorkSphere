import React, { useEffect, useState } from 'react'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import { getMyAttendance, checkIn, checkOut } from '../../services/attendanceService'
import { toast } from 'react-toastify'

function MyAttendance() {
    const today = new Date()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [todayAttendance, setTodayAttendance] = useState(null)

    // ✅ Fetch monthly attendance
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getMyAttendance(month, year)
                setAttendance(data)
            } catch (error) {
                console.error(error)
                toast.error('Failed to fetch attendance')
                setError('Failed to fetch attendance')
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [month, year])

    // ✅ Always calculate todayAttendance from list
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

    // ✅ Check if current month selected
    const isCurrentMonth =
        month === today.getMonth() + 1 &&
        year === today.getFullYear()

    // ✅ Check In
    const handleCheckIn = async () => {
        if (todayAttendance?.checkIn) {
            toast.error("Already checked in today")
            return
        }

        try {
            const res = await checkIn()
            toast.success('Check-in successful')
            setTodayAttendance(res.attendance)
            setAttendance(prev => [res.attendance, ...prev])
            
        } catch (error) {
            toast.error(error?.message || 'Check-in failed')
        } 
    }

    // ✅ Check Out
    const handleCheckOut = async () => {
        if (!todayAttendance) {
            toast.error("Check-in not found")
            return
        }

        try {
            const res = await checkOut()
            setTodayAttendance(res.attendance)
            setAttendance(prev => prev.map(a => a._id === res.attendance._id ? res.attendance : a))
            toast.success('Check-out successful')
        } catch (error) {
            toast.error(error?.message || 'Check-out failed')
        } 
    }

    return (
        <div className='p-6 space-y-6'>

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Attendance</h1>

                {/* Month filter */}
                <div className="flex gap-2">
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                        className='border rounded px-3 py-2'>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
                            <option key={m} value={m}>{m}</option>
                        )}
                    </select>

                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                        className='border rounded px-3 py-2'>
                        {[2024,2025,2026,2027].map(y =>
                            <option key={y} value={y}>{y}</option>
                        )}
                    </select>
                </div>
            </div>

            {/* ✅ Today's Attendance */}
            {isCurrentMonth && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h2 className="font-semibold mb-3">Today's attendance</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={todayAttendance?.checkIn || loading}
                            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-green-300">
                            Check In
                        </button>

                        <button
                            onClick={handleCheckOut}
                            disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut || loading}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:bg-red-300">
                            Check Out
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && <p className="text-center">Loading...</p>}

            {/* Error */}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Empty */}
            {!loading && attendance.length === 0 && (
                <p className="text-center text-gray-500">No records found</p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attendance.map(a => (
                    <AttendanceCard key={a._id} attendance={a} />
                ))}
            </div>
        </div>
    )
}

export default MyAttendance