import React, { useState, useEffect } from 'react'
import { getMyNotifications } from '../../services/NotificationService'
import NotificationCard from '../../components/notification/NotificationCard'
import {toast} from 'react-toastify'


function Notification() {
    const [notification, setNotification] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetch = async() => {
            setLoading(true)
            try {
                const res = await getMyNotifications()
                setNotification(res)
            } catch (error) {
                console.error('error while loading notifications', error)
                toast.error('failed to fetch notifications')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    },[])

    const handleUpdate = (updateNotification) => {
        setNotification(prev => prev.map(n => n._id === updateNotification._id ? updateNotification : n))
    }
    const handleDelete = (deleteId) => {
        setNotification(prev => prev.filter((n => n._id !== deleteId)))
    }

  return (
    <div className='p-4 bg-white shadow rounded-lg'>
        {/* title */}
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>

        {/* loading */}
        {loading && (
            <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {/* empty state */}
        {!loading && notification.length === 0 && (
            <div className="text-gray-500 text-center py-4">
                No notifications found
            </div>
        )}

        {/* notification list */}
        {!loading && notification.length > 0 && (
            <div className="space-y-3">
                {notification.map((n) => (
                    <NotificationCard
                    key={n._id}
                    notification={n}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    />

                ))}
            </div>
        )}

    </div>
  )
}

export default Notification
