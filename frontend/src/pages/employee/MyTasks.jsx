import React, { useEffect, useState } from 'react'
import { deleteTask, getTasks, updateStatus,  } from '../../services/TaskService'
import TaskCard from '../../components/task/TaskCard'

function MyTasks() {
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const load = async() => {
            const data = await getTasks()
            setTasks(data)
        }
        load()
    })

    const handleDelete = async(id) => {
        await deleteTask(id)
        setTasks((prev) => prev.filter((t) => t._id !== id))
    }

    const handleComplete  = async(id) => {
        const update = await updateStatus(id, "completed")
        setTasks((prev) => prev.map((t) => (t._id === id ? update : t)))
    }

  return (
    <div className='grid gap-4'>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onDelete={handleDelete} onComplete={handleComplete} />
      ))}
    </div>
  )
}

export default MyTasks
