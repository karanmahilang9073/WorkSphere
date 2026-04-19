import React from 'react'

// eslint-disable-next-line no-unused-vars
function StatsCard({title, icon: Icon, value, color, bgGradient,children}) {
  return (
    <div className={`${bgGradient} rounded-xl p-6 text-white relative overflow-hidden`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm-start opacity-90">{title}</p>
                <h3 className='text-4xl font-bold mt-2'>{value}</h3>
            </div>
            <Icon size={48} className='opacity-40' />
        </div>
        {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default StatsCard
