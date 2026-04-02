import {useEffect, useState} from 'react'
import LeaveCard from '../../components/leave/LeaveCard'
import { getLeaves } from '../../services/LeaveService'
import {toast} from 'react-toastify'

function MyLeaves() {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaves = async() => {
            setLoading(true)
            try {
                const res = await getLeaves()
                setLeaves(res)
            } catch (error) {
                console.error('error fetching leaves', error)
                toast.error('failed to fetch leaves')
            } finally {
                setLoading(false)
            }
        }
        fetchLeaves()
    }, [])


  return (
    <div className='p-4'>

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            </div>
        )}

        {/* leave grid */}
        {leaves.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {leaves.map((leave) => (
                    <LeaveCard key={leave._id} leave={leave} />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">No leave request found.</p>
        )}
      
    </div>
  )
}

export default MyLeaves
