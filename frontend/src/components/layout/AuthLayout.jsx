import React from 'react'

function AuthLayout({children}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-r from-indigo-600 to-purple-700'>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
