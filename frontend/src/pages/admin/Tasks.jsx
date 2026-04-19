import React, { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateStatus, updateTask } from '../../services/TaskService'
import {toast} from 'react-toastify'
import TaskCard from '../../components/task/TaskCard'
import {getUsers} from '../../services/userService.js'
import { recommendTask } from '../../services/AiService.js'



function Tasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [users, setUser] = useState([])
    const [editTask, setEditTask] = useState(null)

    const [aiTask, setAiTask] = useState("")

    const [form, setForm] = useState({
        title : '',
        description : '',
        deadline : '',
        priority : '',
        assignedTo : ''
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

    //get users
    useEffect(() => {
      const fetchUsers = async() => {
        try {
          const res = await getUsers()
          setUser(res)
        } catch (error) {
          console.error('failed to fetch users', error)
          toast.error('failed to fetch users')
        }
      }
      fetchUsers()
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
        setForm({title : '', description : '', deadline : '', priority : 'low', assignedTo : ''})
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

    //update task
    const handleUpdate = async() => {
      if(!editTask?.title || !editTask?.assignedTo){
        toast.error('title and assigned user required')
        return
      }
      try {
        const updated = await updateTask(editTask._id, editTask)
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
        toast.success('task updated')
        setEditTask(null)
        setForm({title : '', description : '', deadline : '', priority : 'low', assignedTo : '' })
      } catch (error) {
        toast.error(error.response?.data?.message || "failed to update task")
      }
    }

    const handleRecommend = async(departmentId) => {
      setLoading(true)
      try {
        const res = await recommendTask(departmentId)
        setAiTask(res)
        toast.success('task recommended successfully')
      } catch (error) {
        console.error('error while recommend task', error)
        toast.error('failed to recomment task')
      } finally {
        setLoading(false)
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

      {/* ai task recommen button */}
      <button onClick={() => handleRecommend()} className='bg-purple-500 text-white px-4 py-2 rounded mb-4'>Recommend Task</button>

      {/* create task form */}
      {showForm && (
        <form onSubmit={handleCreate} className='bg-white p-4 rounded shadow mb-6 space-y-3'>

          <input type="text" name='title' placeholder='Title' value={form.title} onChange={handleChange} className='w-full border p-2 rounded' required />

          <textarea name="description" placeholder='Description' value={form.description} onChange={handleChange} className='w-full border p-2 rounded' required />

          <input type="date" name='deadline' value={form.deadline} onChange={handleChange} className='w-full border p-2 rounded' required />

          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className='w-full border p-2 rounded'>
            <option value="">Select employee</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>

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

      {/* recommended task */}
      {aiTask && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">AI recommendation</h3>
          <p className="text-sm whitespace-pre-wrap">{aiTask}</p>
        </div>
      )}

      {/* edit task */}
      {editTask && (
        <div className='fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center'>
          <div className="bg-white p-6 rounded w-100">
            <h2 className='text-lg font-bold mb-4'>edit task</h2>

            <input type="text" value={editTask.title} onChange={(e) => setEditTask({...editTask, title : e.target.value})} className='w-full border p-2 mb-2 rounded' />

            <textarea value={editTask.description} onChange={(e) => setEditTask({...editTask, description : e.target.value})} className='w-full border p-2 mb-2 rounded'/>

            <input type="date" value={editTask.deadline ? editTask.deadline.split("T")[0] : ""} onChange={(e) => setEditTask({...editTask, deadline : e.target.value})} className='w-full border p-2 mb-2 rounded' />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTask(null)} className='px-3 py-1 bg-gray-400 text-white rounded'>cancel</button>
              <button onClick={handleUpdate} className='px-3 py-1 bg-blue-500 text-white rounded'>save</button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
