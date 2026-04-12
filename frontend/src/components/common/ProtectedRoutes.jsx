import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import {Navigate} from 'react-router-dom'

function ProtectedRoutes({children, role}) {
    const {user, loading} = useContext(AuthContext)

    if(loading){
        return <div className='text-center py-10'>Loading...</div>
    }
    if(!user){
        return <Navigate to='/login' replace />
    }
    if(role && user?.role !== role) {
        return <Navigate to='/login' replace />
    }
  return children
}

export default ProtectedRoutes
