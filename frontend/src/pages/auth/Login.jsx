import React, { useContext, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import {login as loginService} from '../../services/AuthService'


function Login() {
  const [formData, setFormData] = useState({
    email : '',
    password : ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const {login} = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]:e.target.value})
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    if(!formData.email || !formData.password){
      setError('all fields are required')
      toast.error('all fields are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await loginService(formData)
      login(res)
      toast.success('welcome back to AstraaHR')
      navigate(res.user.role === 'Admin' ? '/admin' : '/employee')
    } catch (error) {
      const message = error.message || 'login failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-6'>
    <div className='w-full max-w-md flex rounded-2xl overflow-hidden shadow-xl'>
      {/* left side  */}
      {/* <div className='hidden lg:flex w-1/2 bg-linear-to-r from-indigo-600 to-purple-700 text-white items-center justify-center p-10'>
          <div>
            <h1 className='text-4xl font-bold mb-4'>AstraaHR</h1>
            <p className='text-lg opacity-80'>welcome back! manage your team  efficiently</p>
          </div>
      </div> */}

      {/* right side  */}
      <div className='w-full  flex items-center justify-center p-8'>
        <form onSubmit={handleSubmit} className='w-full max-w-md bg-white p-8 rounded-xl shadow-lg'>
          <h2 className='text-2xl font-bold mb-6 text-center'>Login to your account</h2>

          {error && (
            <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>
          )}

          {/* email */}
          <div className='mb-4'>
            <label className='block mb-1 text-sm font-medium'>email</label>
            <input type="email" name='email' onChange={handleChange} placeholder='enter your email' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>

          {/* password */}
          <div className='mb-6'>
            <label className='block mb-1 text-sm font-medium'>password</label>
            <input type="password" name='password' onChange={handleChange} placeholder='enter your password' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>

          {/* button */}
          <button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200'>{loading ? 'logging in...' : 'Login'}</button>

          {/* extraa */}
          <p className='text-sm text-center mt-4'>dont have an account?{' '}
            <span className='text-indigo-600 hover:underline cursor-pointer font-bold' onClick={() => navigate('/register')}>Register</span>
          </p>
        </form>
      </div>



    </div>
    </div>
  )
}

export default Login
