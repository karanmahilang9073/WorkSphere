import React, { useEffect, useState } from 'react'
import { getUserProfile } from '../../services/userService'
import {toast} from 'react-toastify'


function Myprofile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchProfile = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getUserProfile()
                setProfile(res)
            } catch (error) {
                console.error('error while loading profile', error)
                toast.error('failed to fetch profile')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])


  return (
    <div className='min-h-screen bg-gray-100 flex justify-center p-6'>
        <div className="w-full max-w-md">

            {/* header */}
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>

            {/* loading */}
            {loading && (
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-5/6"></div>
                </div>
            )}

            {/* error */}
            {error && (
                <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>
            )}

            {/* profile card */}
            {profile && !loading && (
                <div className="bg-white shadow-md rounded-xl p-6 space-y-3">
                    <p><span className="font-semibold text-gray-700">name:{" "}{profile.name}</span></p>
                    <p><span className="font-semibold text-gray-700">Email:{" "}{profile.email}</span></p>
                    <p><span className="font-semibold text-gray-700">Department:{" "}{profile.department}</span></p>
                    <p><span className="font-semibold text-gray-700">Role:{" "}{profile.role}</span></p>
                </div>
            )}
        </div>
      
    </div>
  )
}

export default Myprofile
