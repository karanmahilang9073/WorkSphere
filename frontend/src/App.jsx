import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import { Route, Routes } from 'react-router-dom'
import TaskCard from './components/task/TaskCard'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />

      </Routes>
      <TaskCard />
    </div>
  )
}

export default App
