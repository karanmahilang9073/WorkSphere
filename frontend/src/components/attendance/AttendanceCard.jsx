import { memo } from 'react'
import { MapPin, QrCode, Clock, Zap } from 'lucide-react'

function AttendanceCard({ attendance, onAnalyze }) {

  if (!attendance) return null;

  const workHour = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A'

    const diff = new Date(checkOut) - new Date(checkIn)
    if (diff < 0) return 'invalid'

    const hours = (diff / (1000 * 60 * 60)).toFixed(1)
    if (isNaN(hours)) return 'invalid'

    return `${hours}h`
  }

  const formatDateTime = (date, options = {}) => {
    if (!date) return options.type === 'time' ? 'not recorded' : 'invalid date'
    if (options.type === 'time') {
      return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
    return new Date(date).toLocaleDateString('en-IN', { day: "2-digit", month: 'long', year: 'numeric' })
  }

  const statusColor = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    leave: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between'>
      
      <div>
        {/* employee name & shift */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <div>
            <span className="font-semibold text-gray-800">{attendance.employee?.name || 'Staff Member'}</span>
            <span className="text-xs text-gray-500 ml-2">({attendance.employee?.department || 'General'})</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
            {attendance.shiftType || 'General'} Shift
          </span>
        </div>

        {/* date and status */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-base font-semibold text-gray-900">{formatDateTime(attendance.date)}</p>
          </div>
          <div className="flex gap-1.5 items-center">
            {attendance.late && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Late</span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[attendance.status?.toLowerCase()] || statusColor.absent}`}>
              {attendance.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Check-in & Check-out boxes */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" /> Check-in
            </p>
            <p className="font-semibold text-xs text-gray-800">{formatDateTime(attendance.checkIn, { type: 'time' })}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" /> Check-out
            </p>
            <p className="font-semibold text-xs text-gray-800">{formatDateTime(attendance.checkOut, { type: 'time' })}</p>
          </div>
        </div>

        {/* Hours & Overtime */}
        <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 mb-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Hours worked</p>
            <p className="font-bold text-sm text-blue-700">{workHour(attendance.checkIn, attendance.checkOut)}</p>
          </div>
          {attendance.overtimeHours > 0 && (
            <div className="text-right">
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3 text-amber-500" /> Overtime
              </p>
              <p className="font-bold text-xs text-amber-700">+{attendance.overtimeHours} hrs</p>
            </div>
          )}
        </div>

        {/* Check-in Method / Location Tag */}
        {attendance.checkIn && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
            {attendance.checkInMethod === 'qr' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-200">
                <QrCode className="w-3 h-3" /> QR Check-in
              </span>
            ) : attendance.checkInMethod === 'geofence' || attendance.location?.latitude ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[11px] font-medium border border-cyan-200">
                <MapPin className="w-3 h-3" /> Geo-Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]">
                Manual Check-in
              </span>
            )}
          </div>
        )}
      </div>

      {onAnalyze && (
        <button
          onClick={() => onAnalyze(attendance.employee?._id)}
          disabled={!attendance.employee}
          className='w-full mt-1 bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors'>
          Analyze with AI
        </button>
      )}

    </div>
  )
}

export default memo(AttendanceCard)