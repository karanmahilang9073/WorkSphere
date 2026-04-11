import React, {useState, useEffect} from 'react'
import { getLeaves, updateLeaveStatus } from '../../services/LeaveService'
import LeaveCard from '../../components/leave/LeaveCard'
import {toast} from 'react-toastify'


function Leaves() {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getLeaves()
                setLeaves(res)
            } catch (error) {
                console.error('error while loading leaves', error)
                toast.error('failed to fetch leavess')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleApprove = async(leaveId) => {
        setLoading(true)
        setError(null)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "approved")
            setLeaves(leave => leave.map(l => l._id === leaveId ? updatedLeave : l))
            toast.success('leave approved successfully')
        } catch (error) {
            console.error('error while approving', error)
            toast.error('failed to approve leave')
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async(leaveId) => {
        setLoading(true)
        setError(null)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "rejected")
            setLeaves(leave => leave.map(l => l._id === leaveId ? updatedLeave : l))
            toast.success('leave rejected!')
        } catch (error) {
            console.error('error while rejecting', error)
            toast.error('failed to reject leave')
        } finally {
            setLoading(false)
        }
    }


  return (
    <div className='p-4 bg-white shadow rounded-lg'>
        {/* header */}
        <h2 className='text-xl font-semibold mb-4'>Leave requests</h2>

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
        {!loading && !error && leaves.length === 0 && (
            <div className="text-gray-500 text-center py-4">
                No leave requests found
            </div>
        )}

        {/* leave grid */}
        {!loading && !error && leaves.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {leaves.map((l) => (
                    <>
                    <LeaveCard key={l._id} leave={l} />
                    <button onClick={() => handleApprove(l._id)} className='bg-green-500 text-white rounded-md hover:bg-green-700'>Approve</button>
                    <button onClick={() => handleReject(l._id)} className='bg-red-500 text-white rounded-md hover:bg-red-700'>Reject</button>
                    </>
                    
                ))}
                
            </div>
        )}


    </div>
  )
}

export default Leaves
