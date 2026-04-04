import React from 'react'
import { deleteNotification, markAsRead } from '../../services/NotificationService'

function NotificationCard({notification, onUpdate, onDelete}) {

  const handleMarkasRead = async() => {
    try {
      const res = await markAsRead(notification._id)
      onUpdate(res)
    } catch (error) {
      console.error('failed to MarkAsRead the notification', error)
    }
  }

  const handleDelete = async() => {
    try {
      const res = await deleteNotification(notification._id)
      onDelete(res)
    } catch (error) {
      console.error('failed to delete notification', error)
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      leave : 'bg-blue-200 text-blue-600',
      task : 'bg-purple-200 text-purple-600',
      salary : 'bg-green-200 text-green-600'
    }
    return colors[type] || "bg-gray-200 text-gray-600"
  }

  const formatDate = (date) => {
    if(!date) return ''
    return new Date(date).toLocaleDateString("en-IN",{
      day : 'numeric',
      month : 'short',
      year : 'numeric',
      hour : 'numeric',
      minute : '2-digit'
    })
  }

  return (
    <div className='p-4 bg-white shadow rounded-lg'>
      {/* top */}
      <div className="flex justify-between items-start">

        {/* title and message */}
        <div>
          <h3 className='font-semibold'>{notification.title}</h3>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>

        {/* type badge */}
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(notification.type)}`}>{notification.type}</span>
      </div>

      {/* bottom */}
      <div className="mt-4 flex justify-between items-center">
        {/* date */}
        <p className="text-xs text-gray-500">
          {formatDate(notification.createdAt)}
        </p>

        {/* actions */}
        <div className="flex gap-2">
          {/* mark as read */}
          {!notification.isRead && (
            <button onClick={() => handleMarkasRead()} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-700">Mark As Read</button>
          )}

          {/* delete */}
          <button onClick={() => handleDelete()} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-700">Delete</button>
        </div>
      </div>
      
    </div>
  )
}

export default NotificationCard
