import React, {useState, useEffect} from 'react'
import { getAllAttendance } from '../../services/attendanceService'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import { toast } from 'react-toastify'


function Attendance() {
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    useEffect(() => {
        const fetchAttendance = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getAllAttendance()
                setAttendance(res || [])
            } catch (error) {
                console.error('error while loading attendance', error)
                setError('failed to load attendances')
                toast.error('failed to fetch attendance')
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [])

  return (
    <div className='p-4 bg-white shadow rounded-lg'>
        {/* header */}
        <h2 className='text-xl font-semibold'>All attendance</h2>

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {/* error */}
        {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
        )}

        {/* empty state */}
        {!loading && !error && attendance.length === 0 && (
            <div className="text-gray-500 text-center py-4">
                No attendance records found
            </div>
        )}

        {/* attendance grid */}
        {!loading && !error && attendance.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {attendance.map((a) => (
                    <AttendanceCard key={a._id} attendance={a} />
                ))}
            </div>
        )}
    </div>
  )
}

export default Attendance
