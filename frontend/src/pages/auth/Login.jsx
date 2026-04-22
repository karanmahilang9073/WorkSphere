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
      const message = error?.message || error || 'login failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    
  <div className=" flex items-center justify-center  from-indigo-600 via-purple-600 to-pink-500 px-6">

    <div className=" w-150 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl flex overflow-hidde">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center text-white p-10">
        <h1 className="text-4xl font-extrabold mb-4 tracking-wide">
          WorkSphere
        </h1>
        <p className="text-lg opacity-80 text-center leading-relaxed">
          Manage your team <br /> and stay productive 🚀
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 bg-white p-10 rounded-2xl">
        <form onSubmit={handleSubmit} className="w-60">

          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Welcome Back 👋
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              autoFocus
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* REGISTER */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <span
              className="text-indigo-600 hover:underline cursor-pointer font-semibold"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>

        </form>
      </div>
    </div>
  </div>

  )
}

export default Login
