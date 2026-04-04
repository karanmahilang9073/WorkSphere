import React from 'react'
import ChatBox from '../../components/ai/ChatBox'

function Helpdesk() {
  return (
    <div className='p-4 bg-white shadow rounded-lg'>
      {/* header */}
      <h2 className="text-xl font-semibold mb-4">Helpdesk Support</h2>

      <ChatBox/>
    </div>
  )
}

export default Helpdesk
