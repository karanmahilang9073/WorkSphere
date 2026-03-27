import React from 'react'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />

      </Routes>
    </div>
  )
}

export default App
