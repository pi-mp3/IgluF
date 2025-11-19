import React from 'react'
export default function MeetingExplore(){
  return (
    <div className="max-w-4xl mx-auto p-6 border rounded bg-gray-50">
      <h3 className="text-lg font-medium">Explorar Sala</h3>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="h-48 bg-black/5 rounded flex items-center justify-center">Video Player (mock)</div>
        <div className="h-48 bg-white rounded border overflow-auto">Chat (mock)</div>
      </div>
    </div>
  )
}
