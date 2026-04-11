import React, { useEffect, useState } from 'react'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import { getMyAttendance } from '../../services/attendanceService'
import {toast} from 'react-toastify'


function MyAttendance() {
    const today = new Date()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAttendance = async() => {
            setLoading(true)
            setError(null)
            try {
                const data = await getMyAttendance(month, year)
                setAttendance(data)
            } catch (error) {
                console.error('error fetching attendance', error)
                toast.error('failed to fetch attendance')
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [month, year])


  return (
    <div className='p-6 space-y-6'>
        {/* header */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Attendance</h1>

            {/* filter */}
            <div className="flex gap-2">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className='border rounded px-3 py-2'>
                    <option name="" id="">Select Month</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => 
                        <option value={m} key={m}>{m}</option>
                    )}
                </select>

                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className='border rounded px-3 py-2'>
                    <option value="">Select year</option>
                    {[2024,2025,2026,2027].map(y =>
                        <option key={y} value={y}>{y}</option>
                    )}
                </select>
            </div>
        </div>

        {/* loading */}
        {loading && (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            </div>
        )}

        {error && (
            <div className="text-red-500 text-center py-6">{error}</div>
        )}

        {/* empty condition */}
        {!loading && !error && attendance.length === 0 && (
            <div className="text-center text-gray-500 py-10">
                No attendance records found for this period
            </div>
        )}

        {/* grid */}
        {!loading && !error && attendance.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attendance.map((record, index) => (
                    <AttendanceCard key={index} attendance={record} />
                ))}
            </div>
        )}
      
    </div>
  )
}

export default MyAttendance
