import React from 'react'

function SalaryCard({salary}) {

    if(!salary) return null;
    
    const status = {
        paid : 'bg-green-100 text-green-700',
        pending : 'bg-yellow-100 text-yellow-700',
        processing : 'bg-blue-100 text-blue-700'
    }

    const formatMonth = (month) => {

        if(!month) return 'invalid month'
        
        return new Date(month).toLocaleDateString("default",{month : 'long', year : 'numeric'})
    }

  return (
    <div className='bg-white shadow-md rounded-2xl p-5 w-full max-w-md border'>
        {/* top section */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{formatMonth(salary.month)}</h2>

            <span className={`px-3 py-1 text-sm rounded-full font-medium ${status[salary.status] || 'bg-gray-100 text-gray-700'}`}>{salary.status?.toUpperCase()}</span>
        </div>

        {/* net salary */}
        <div className="mb-5">
            <p className="text-sm text-gray-500">Net Salary</p>
            <h1 className="text-3xl font-bold text-gray-800">₹{salary.netSalary}</h1>
        </div>

        {/* breakdown */}
        <div className="flex justify-between text-sm">
            <div>
                <p className="text-gray-500">Allowance</p>
                <p className="font-medium text-green-600">{salary.allowance}</p>
            </div>

            <div>
                <p className="text-gray-500">deduction</p>
                <p className="font-medium text-red-600">{salary.deduction}</p>
            </div>
        </div>
    </div>
  )
}

export default SalaryCard
