import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import axiosClient from '../../api/axiosClient.js'
import { toast } from 'react-toastify'
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
    const { login } = useContext(Authcontext)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validate = () => {
        if (!formData.name || !formData.email || !formData.password) {
            return 'all fields are required'
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
            const res = await axiosClient.post('/auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            department: formData.department
            })

            login(res.data)

            toast.success('user registered successfully')

            if (res.data.user.role === 'Admin') {
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
      <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
        <form onSubmit={handleSubmit} className='w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-5'>
            <div className='text-center'>
                <h2 className='text-xl font-semibold text-gray-800'>AstraaHR Registratin</h2>
                <p className='text-sm text-gray-500'>Create your employee account</p>
            </div>

            {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2'>{error}</div>
            )}

            <div>
                <label className='text-sm text-gray-700'>Full Name</label>
                <input name='name' type='text' onChange={handleChange} className='w-full bporder p-2 rounded mt-1' />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Email</label>
                <input name='email' type='email' onChange={handleChange} className='w-full border p-2 rounded mt-1' />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Password</label>
                <input name='password' type='password' onChange={handleChange} className='w-full border p-2 rounded mt-1' />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Confirm Password</label>
                <input name='confirmPassword' type='password' onChange={handleChange} className='w-full border p-2 rounded mt-1' />
            </div>

            <div>
                <label className='text-sm text-gray-700'>Role</label>
                <select name='role' onChange={handleChange} className='w-full border p-2 rounded mt-1'>
                    <option value="Employee">Employee</option>
                    <option value="Hr">HR</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div>
                <label className='text-sm text-gray-700'>Department</label>
                <input name='department' type='text' onChange={handleChange} className='w-full border p-2 rounded mt-1' />
            </div>

            <button type='submit' className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'>{loading ? 'Registering...' : 'Register'}</button>

            <p className='text-sm text-center text-gray-500'>already have an account?
                <Link to='/' className='text-blue-600 hover:underline'>login</Link>
            </p>
        </form>
      </div>
    )
}

export default Register