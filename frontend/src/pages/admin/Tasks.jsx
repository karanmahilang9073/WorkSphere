import React, { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateStatus } from '../../services/TaskService'
import {toast} from 'react-toastify'
import TaskCard from '../../components/task/TaskCard'

function Tasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const [form, setForm] = useState({
        title : '',
        description : '',
        deadline : '',
        priority : ''
    })

    //fetch task
    useEffect(() => {
      const load = async() => {
        try {
          const res = await getTasks()
          setTasks(res)
        } catch (error) {
          toast.error(error.response?.data?.message || 'failed to fetch tasks')
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [])

    //form change
    const handleChange = (e) => {
      setForm({...form, [e.target.name]: e.target.value})
    }

    //create task
    const handleCreate  = async(e) => {
      e.preventDefault()
      try {
        const newTask = await createTask(form)
        setTasks((prev) => [newTask, ...prev])
        toast.success('new task created successfully')
        setForm({title : '', description : '', deadline : '', priority : ''})
        setShowForm(false)
      } catch (error) {
        toast.error(error.response?.data?.message || 'failed to create task')
      }
    }

    // delete task
    const handleDelete = async(id) => {
      try {
        await deleteTask(id)
        setTasks((prev) => prev.filter((t)  => t._id !== id))
        toast.success('task deleted')
      } catch (error) {
        toast.error(error.response?.data?.message || 'failed to delete task')
      }
    }

    // complete task
    const handleComplete = async(id) => {
      try {
        const res = await updateStatus(id, 'completed')
        setTasks((prev) => prev.map((t) => (t._id === id ? res : t)))
        toast.success('task completed')
      } catch (error) {
        toast.error(error.response?.data?.message ||'failed to update task')
      }
    }

    if(loading) return <p className='text-center mt-10'>Loading...</p>

  return (
    <div className='p-6'>
      {/* header */}
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Task</h1>
        <button onClick={() => setShowForm(!showForm)} className='bg-blue-500 text-white px-4 py-2 rounded'>create task</button>
      </div>

      {/* create task form */}
      {showForm && (
        <form onSubmit={handleCreate} className='bg-white p-4 rounded shadow mb-6 space-y-3'>

          <input type="text" name='title' placeholder='Title' value={form.title} onChange={handleChange} className='w-full border p-2 rounded' required />

          <textarea name="description" placeholder='Description' value={form.description} onChange={handleChange} className='w-full border p-2 rounded' required />

          <input type="date" name='deadline' value={form.deadline} onChange={handleChange} className='w-full border p-2 rounded' required />

          <select name="priority" value={form.priority} onChange={handleChange} className='w-full border p-2 rounded'>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>

          <button className='bg-green-500 text-white px-4 py-2 rounded'>create</button>
        </form>
      )}

      {/* task list */}
      {tasks.length === 0 ? (
        <p>no tasks found</p>
      ) : (
        <div className='grid gap-4'>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={handleDelete} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Tasks
