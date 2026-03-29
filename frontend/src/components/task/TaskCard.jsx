import React, { useMemo } from 'react'

function TaskCard({task,  onDelete, onComplete}) {
    const isOverdue = useMemo(() => {
        return new Date(task.deadline < new Date() && task.status !== 'completed')
    }, [task.deadline, task.status]) 

    const statusColor = {
        pending : "bg-yellow-100 text-yellow-700",
        inProgress : "bg-blue-100 text-blue-700",
        completed : "bg-green-100 text-green-700" ,
    }

    const priorityColour = {
        low : 'text-green-500',
        medium : 'text-yellow-500',
        high : 'text-red-500',
    }

  return (
    <div className='bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border'>

        {/* header */}
        <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold'>{task.title}</h3>
            <span className={`px-2 py-1 text-xs rounded ${statusColor[task.status]}`}>{task.status}</span>
        </div>

        {/* description */}
        <p className="text-gray-600 text-sm mt-2">{task.description}</p>

        {/* meta */}
        <div>
            <span className={priorityColour[task.priority]}>{task.priorityColour.tpUpperCase}</span>
            <span className={isOverdue ? 'text-red-500' : 'text-gray-500'}>{new Date(task.deadline).toLocaleDateString()}</span>
        </div>

        {/* assigned */}
        <div className='mt-2 text-xs text-gray-500'>
            Assigned to : {task.assignedTo?.name || "N/A"}
        </div>

        {/* actions */}
        <div className="flex gap-2 mt-4">
            <button onClick={() => onDelete(task._id)} className='px-3 py-1 text-sm bg-blue-500 text-white rounded'>Delete</button>

            {task.status !== "completed" && (
                <button onClick={() => onComplete(task._id)}>Complete</button>
            )}
        </div>
      
    </div>
  )
}

export default TaskCard
