import  { useEffect, useState } from 'react'
import { deleteTask, getTasks, updateStatus,  } from '../../services/TaskService'
import TaskCard from '../../components/task/TaskCard'
import { toast } from 'react-toastify'

function MyTasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const load = async() => {
            setLoading(true)
            setError(null)
            try {
              const data = await getTasks()
              setTasks(data)
            } catch (error) {
                console.error('error while fetching task', error)
                toast.error('failed to fetch tasks')
            } finally {
                setLoading(false)
            }
        }
        load()
    },[])

    const handleDelete = async(id) => {
        await deleteTask(id)
        setTasks((prev) => prev.filter((t) => t._id !== id))
    }

    const handleComplete  = async(id) => {
        const update = await updateStatus(id, "completed")
        setTasks((prev) => prev.map((t) => (t._id === id ? update : t)))
    }

  return (
    <div className='p-6 space-y-6'>
        <h1 className="text-2xl font-bold">My tasks</h1>

        {/* loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full"></div>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="text-red-500 text-center py-6">{error}</div>
        )}

        {/* emply */}
        {!loading && tasks.length === 0 && (
          <div className="text-center text-gray-500 py-10">No tasks assigned</div>
        )}

        {/* task grid */}
        {!loading && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onDelete={handleDelete} onComplete={handleComplete} />
            ))}
          </div>
        )}
    </div>
  )
}

export default MyTasks
