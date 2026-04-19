import React, {useState, useEffect} from 'react'
import { getLeaves, updateLeaveStatus } from '../../services/LeaveService'
import LeaveCard from '../../components/leave/LeaveCard'
import {toast} from 'react-toastify'
import { analyzeLeave } from '../../services/AiService'


function Leaves() {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [aiLeave, setAiLeave] = useState('')

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getLeaves()
                setLeaves(res)
            } catch (error) {
                console.error('error while loading leaves', error)
                toast.error('failed to fetch leaves')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleApprove = async(leaveId) => {
        setError(null)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "approved")
            setLeaves(prev => prev.map(l => l._id === leaveId ? updatedLeave : l))
            toast.success('leave approved successfully')
        } catch (error) {
            console.error('error while approving', error)
            toast.error('failed to approve leave')
        } 
    }

    const handleReject = async(leaveId) => {
        setError(null)
        try {
            const updatedLeave = await updateLeaveStatus(leaveId, "rejected")
            setLeaves(leave => leave.map(l => l._id === leaveId ? updatedLeave : l))
            toast.success('leave rejected!')
        } catch (error) {
            console.error('error while rejecting', error)
            toast.error('failed to reject leave')
        } 
    }

    const analyze = async(leave) => {
        setLoading(true)
        try {
            const res = await analyzeLeave({
                employeeId : leave.employee._id,
                startDate : leave.startDate,
                endDate : leave.endDate,
                reason : leave.reason
            })
            setAiLeave(res)
            toast.success('leave analyzed successfully')
        } catch (error) {
            console.error('error while analyzing leave',error)
            toast.error('failed to analyze leave')
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
                    <div key={l._id} className='flex flex-col gap-2'>
                    <LeaveCard leave={l} onApprove={handleApprove} onReject={handleReject} />
                    <button onClick={() => analyze(l)} className='bg-indigo-500 text-white py-1 rounded'>Analyze AI</button>
                    </div>
                ))}
            </div>
        )}

        {/* AI response */}
        {aiLeave && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">AI leave analysis</h3>
                <p className="text-sm whitespace-pre-wrap">{aiLeave}</p>
            </div>
        )}

    </div>
  )
}

export default Leaves
