import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import { Route, Routes } from 'react-router-dom'
import TaskCard from './components/task/TaskCard'
import MyTasks from './pages/employee/MyTasks'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/my-tasks' element={<MyTasks/>} />
      </Routes>
      <TaskCard />
    </div>
  )
}

export default App
