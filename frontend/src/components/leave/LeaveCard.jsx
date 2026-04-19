import React from 'react'

function LeaveCard({leave, onApprove, onReject}) {
    const status = {
        pending : 'bg-yellow-100 text-yellow-700',
        approved : 'bg-green-100 text-green-700',
        rejected : 'bg-red-100 text-red-700'
    }

    if(!leave) return null;

    const formatDate = (date) => {
        if(!date) return 'invalid date'
        return new Date(date).toLocaleDateString('en-IN', {day : 'numeric', month : 'short', year : 'numeric'})
    }

  return (
    <div className='bg-white shadow-md rounded-2xl p-5 w-full max-w-md border'>

        {/* applied by */}
        <p className="text-sm text-gray-500 mb-2"><span className="font-semibold text-gray-700">Applied by: {leave.employee?.name || 'Unknown'}</span></p>

        {/* top section */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold capitalize">{leave.type} Leave</h2>
            <span className={`px-3 pt-1 text-sm rounded-full font-medium ${status[leave.status] || 'bg-gray-100 text-gray-700'}`}>{leave.status?.toUpperCase()}</span>
        </div>

        {/* date range */}
        <div className="mb-3 text-sm text-gray-600">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</div>

        {/* reason */}
        {leave.reason && (
            <p className="text-sm text-gray-700">{leave.reason}</p>
        )}

        {leave.status === "pending" && onApprove && onReject &&  (
            <div className="flex gap-2 mt-4">
                <button onClick={() => onApprove(leave._id)} className='bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition'>Approve</button>
                <button onClick={() => onReject(leave._id)} className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition'>Reject</button>
                
            </div>
        )}
      
    </div>
  )
}

export default LeaveCard
