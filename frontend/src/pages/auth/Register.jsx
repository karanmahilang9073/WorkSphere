import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient.js'
import { useAuth } from '../../context/AuthContext'

const Register = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: ''
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const validate = () => {
        if (!form.name || !form.email || !form.password) {
            return 'all fields are required'
        }
        if (form.password.length < 6) {
            return 'password must be at least 6 characters'
        }
        if (form.password !== form.confirmPassword) {
            return 'password do not match'
        }
        return null
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (error) {
            alert(error)
            return
        }

        try {
            const res = await axiosClient.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                department: form.department
            })

            login(res.data)

            if (res.data.user.role === 'Admin') {
                navigate('/admin')
            } else {
                navigate('/employee')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'registration failed')
        }
    }
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <form
              onSubmit ={handleSubmit}
              className='w-[400px] border border-gray-300 p-6 bg-white'
            >
                <h2 className='text-xl font-semibold mb-4 text-center'>
                    Employee Registration
                </h2>

                <label className='block mb-1 text-sm'>
                    Full Name
                </label>
                <input
                    type='text'
                    name='name'
                    classname='w-full border p-2 mb-3'
                    onChange={handleChange}
                />

                <label className='block mb-1 text-sm'>
                    Email
                </label>
                <input
                    type='email'
                    name='email'
                    className='w-full border p-2 mb-3'
                    onChange={handleChange}
                />

                <label className='block mb-1 text-sm'>
                    Password
                </label>
                <input
                    type='password'
                    name='password'
                    className='w-full border p-2 mb-3'
                    onChange={handleChange}
                />

                <label className='block mb-1 text-sm'>
                    Role
                </label>
                <select
                    name='role'
                    className='w-full border p-2 mb-3'
                    onChange={handleChange}
                >
                    <option value="Employee">Employee</option>
                    <option value="Hr">HR</option>
                    <option value="Admin">Admin</option>
                </select>

                <label className='block mb-1 text-sm'>
                    Department
                </label>
                <input
                type='text'
                name='department'
                className='w-full border p-2 mb-4'
                onChange={handleChange}
                />

                <button className='w-full border p-2 bg-gray-800 text-white hover:bg-black'>
                    Register
                </button>

                <p className='text-sm text-center mt-3'>
                    Already have an account?{" "}
                <span
                className='underline curser-pointer'
                onClick={() => navigate('/')}
                >
                    Login
                </span>
                </p>
            </form>
        </div>
    )
}