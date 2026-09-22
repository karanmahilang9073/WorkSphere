import { memo } from 'react'

function AttendanceCard({ attendance, onAnalyze }) {

  if(!attendance) return null;

  const workHour = (checkIn, checkOut) => {
    if(!checkIn || !checkOut) return 'N/A'

    const diff = new Date(checkOut) - new Date(checkIn)
    if(diff < 0) return 'invalid'

    const hours = (diff / (1000 * 60 * 60)).toFixed(1)
    if(isNaN(hours)) return 'invalid'

    return `${hours}h`
  }


  const formatDateTime = (date, options  = {}) => {
    if(!date) return options.type === 'time' ? 'not recorded' : 'invalid date'
    if(options.type === 'time') {
      return new Date(date).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})
    }
    return new Date(date).toLocaleDateString('en-IN', {day: "2-digit", month: 'long', year: 'numeric'})
  }

  const statusColor = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    leave: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className='bg-white p-3 rounded-lg shadow border border-gray-200 '>
      
      {/* employee name */}
      <div className="text-sm text-gray-600 mb-1">
        <span className="font-semibold text-gray-800">{attendance.employee?.name || 'Removed users'}</span>
        <span className="text-xs text-gray-500 ml-2">({attendance.employee?.department || 'N/A'})</span>
      </div>

      {/* date and status */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-lg font-semibold">{formatDateTime(attendance.date)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[attendance.status?.toLowerCase()] || statusColor.absent}`}>{attendance.status?.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Check-in</p>
          <p className="font-semibold text-sm">{formatDateTime(attendance.checkIn, {type: 'time'})}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Check-out</p>
          <p className="font-semibold text-sm">{formatDateTime(attendance.checkOut, {type: 'time'})}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded col-span-2">
          <p className="text-xs text-gray-500 mb-1">Hours worked</p>
          <p className="font-semibold text-sm text-blue-600">{workHour(attendance.checkIn, attendance.checkOut)}</p>
        </div>
        <button onClick={() => onAnalyze(attendance.employee._id)} disabled={!attendance.employee} className='bg-blue-500 text-white px-4 py-2 w-58 rounded hover:bg-blue-600'>
          Analyze AI
        </button>
      </div>

    </div>
  )
}

export default memo(AttendanceCard)