import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import { toast } from 'react-toastify'
import { register } from '../../services/AuthService.js'
import 'react-toastify/dist/ReactToastify.css'

function Register () {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Employee',
        department: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validate = () => {
        if (!formData.name || !formData.email || !formData.password) {
            return 'all fields are required'
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(formData.email)) {
            return 'please enter a valid email'
        }
        if (formData.password.length < 6) {
            return 'password must be at least 6 characters'
        }
        if (formData.password !== formData.confirmPassword) {
            return 'passwords do not match'
        }
        return null
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        const validationError = validate()
        if (validationError) {
            setError(validationError)
            toast.error(validationError)
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await register(formData)
            login(res)
            toast.success('user registered successfully')
            if (res.user.role === 'Admin') {
                navigate('/admin')
            } else {
                navigate('/employee')
            }
        } catch (err) {
            const message =
              err.response?.data?.message || 'registration failed'
            
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
      <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 px-4 '>
        {/* form  */}
        <form onSubmit={handleSubmit} className='w-full max-w-md bg-white rounded-2xl border-2xl shadow-xl p-8 space-y-6 border border-gray-100'>
            <div className='text-center'>
                <h2 className='text-xl font-semibold text-gray-800'>AstraaHR Registration</h2>
                <p className='text-sm text-gray-500'>Create your employee account</p>
            </div>

            {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2'>{error}</div>
            )}

            <div>
                <label className='text-sm text-gray-700'>Full Name</label>
                <input name='name' type='text' value={formData.name} onChange={handleChange} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 focus:bg-white' required />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Email</label>
                <input name='email' type='email' placeholder='abc@gmail.com' onChange={handleChange} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 focus:bg-white' required />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Password</label>
                <input name='password' type='password' onChange={handleChange} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 focus:bg-white' placeholder='********' required />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Confirm Password</label>
                <input name='confirmPassword' type='password' value={formData.confirmPassword} onChange={handleChange} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 focus:bg-white' placeholder='********' required />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Role</label>
                <select name='role' value={formData.role} onChange={handleChange} className='w-full border p-2 rounded mt-1' required>
                    <option value="Employee">Employee</option>
                    <option value="Hr">HR</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div>
                <label className='text-sm text-gray-700'>Department</label>
                <input name='department' type='text' value={formData.department} onChange={handleChange} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-gray-50 focus:bg-white' required />
            </div>

            <button type='submit' className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'>{loading ? 'Registering...' : 'Register'}</button>

            <p className='text-sm text-center text-gray-500'>already have an account?
                <Link to='/login' className='text-blue-600 hover:underline'>login</Link>
            </p>
        </form>
      </div>
    )
}
export default Register
