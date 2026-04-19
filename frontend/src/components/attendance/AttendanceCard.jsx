import React from 'react'

function AttendanceCard({ attendance }) {

  const formatTime = (date) => {
    if (!date) return 'not recorded'
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const workHour = (checkIn, checkOut) => {
    if(!checkIn) return '0h'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = (diff / (1000 * 60 * 60)).toFixed(1)
    if(isNaN(hours)) return 'invalid'
    return `${hours}h`
  }

  if(!attendance) return null;

  const formatDate = (date) => {
    if(!date) return "invalid date"
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  const statusColor = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    leave: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className='bg-white p-4 rounded-lg shadow border border-gray-200'>
      
      {/* employee name */}
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-semibold text-gray-800">{attendance.employee?.name || 'unknown'}</span>
        <span className="text-xs text-gray-500 ml-2">({attendance.employee?.department || 'N/A'})</span>
      </div>

      {/* date and status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-lg font-semibold">{formatDate(attendance.date)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[attendance.status?.toLowerCase()] || statusColor.absent}`}>{attendance.status?.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Check-in</p>
          <p className="font-semibold text-sm">{formatTime(attendance.checkIn)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Check-out</p>
          <p className="font-semibold text-sm">{formatTime(attendance.checkOut)}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded col-span-2">
          <p className="text-xs text-gray-500 mb-1">Hours worked</p>
          <p className="font-semibold text-sm text-blue-600">{workHour(attendance.checkIn, attendance.checkOut)}</p>
        </div>
      </div>

    </div>
  )
}

export default AttendanceCard
