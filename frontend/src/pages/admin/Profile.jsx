import React, {  useEffect, useState } from 'react'
import {AuthContext} from '../../context/AuthContext'
import { getUserProfile, updateUser } from '../../services/userService'
import {toast} from 'react-toastify'


function Profile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // edit 
    const [isEditMode, setIsEditmode] = useState(false)
    const [editData, setEditData] = useState({
        name : '',
        email : '',
        department : '',
    })
    const [isSaving, setIsSaving] = useState(false)

    // const {user} = useContext(AuthContext)

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            setError(null)
            try {
                const res = await getUserProfile()
                console.log('Profile response:', res)
                setProfile(res)
                setEditData({name : res.name, email : res.email, department : res.department})
            } catch (error) {
                console.error('error while profile fetching',error)
                toast.error('failed to get profile')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    },[])

    const handleChange = (e) => {
        setEditData({...editData, [e.target.name] : e.target.value})
    }

    const handleSave = async() => {
        try {
            setIsSaving(true)
            const updated = await updateUser(profile._id, editData)
            setProfile(updated)
            setIsEditmode(false)
            toast.success('profile updated successfully')
        } catch (error) {
            console.error('error while updating the profile', error)
            toast.error('failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }


  return (
    <div className='min-h-screen bg-gray-100 flex items-start justify-center p-6'>
      <div className="w-full max-w-md">

        {/* header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

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

                {!isEditMode ? (
                    <>
                    <p><span className="font-semibold text-gray-700">Name:</span>{" "}{profile.name}</p>
                    <p><span className="font-semibold text-gray-700">email:</span>{" "}{profile.email}</p>
                    <p><span className="font-semibold text-gray-700">department:</span>{" "}{profile.department}</p>
                    <p><span className="font-semibold text-gray-700">role:</span>{" "}{profile.role}</p>
                    <button onClick={() => setIsEditmode(true)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">edit profile</button>
                    </>
                ) : (
                    <>
                    <input type="text" name='name' value={editData.name} onChange={handleChange} className='w-full border p-2 rounded' placeholder='name' />
                    <input type="email" name='email' value={editData.email} onChange={handleChange} className='w-full border p-2 rounded' placeholder='email' />
                    <input type="text" name='department' value={editData.department} onChange={handleChange} className='w-full border p-2 rounded' placeholder='department' />

                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={isSaving} className={`w-full py-2 rounded text-white ${isSaving ? 'bg-green-400' : 'bg-green-700'}`}>{isSaving ? 'saving...' : 'save'}</button>
                        <button onClick={() => setIsEditmode(false)} className='w-full bg-gray-400 text-white py-2 rounded'>cancel</button>
                    </div>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  )
}

export default Profile
