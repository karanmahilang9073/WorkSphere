import React from 'react'

function LeaveCard({leave}) {
    const status = {
        pending : 'bg-yellow-100 text-yellow-700',
        approved : 'bg-green-100 text-green-700',
        rejected : 'bg-red-100 text-red-700'
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('default', {day : 'numeric', month : 'short', year : 'numeric'})
    }


  return (
    <div className='bg-white shadow-md rounded-2xl p-5 w-full max-w-md border'>
        {/* top section */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold capitalize">{leave.type} Leave</h2>
            <span className={`px-3 pt-1 text-sm rounded-full font-medium ${status[leave.status] || 'bg-gray-100 text-gray-700'}`}>{leave.status}</span>
        </div>

        {/* date range */}
        <div className="mb-3 text-sm text-gray-600">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</div>

        {/* reason */}
        {leave.reason && (
            <p className="text-sm text-gray-700">{leave.reason}</p>
        )}
      
    </div>
  )
}

export default LeaveCard
