'use client'

import { useState, useEffect } from 'react'
import EventForm from '@/components/EventForm'
import EventDetail from '@/components/EventDetail'

interface Event {
  id: string
  title: string
  date: string
  start_time?: string
  end_time?: string
  setup_time?: string
  venue: string
  address?: string
  company_contact?: string
  capacity?: number
  status: string
  coordinator_email: string
  created_at: string
  description?: string
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleEventCreated = () => {
    fetchEvents() // Refresh the events list
    setShowForm(false) // Hide the form
  }

  if (loading) return <div className="p-8">Loading events...</div>
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Logistics Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <EventForm onEventCreated={handleEventCreated} />
        </div>
      )}

      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events yet. Create your first event to get started!
          </div>
        ) : (
          events.map((currentEvent) => (
            <div 
              key={currentEvent.id} 
              className="border p-4 rounded-lg bg-white shadow-sm transition-shadow cursor-pointer hover:shadow-md"
              onClick={() => setSelectedEvent(currentEvent)}
            > 
              <h2 className="text-black text-xl font-semibold">{currentEvent.title}</h2>
              <p className="text-gray-600">{currentEvent.date}</p>
              <span className={`px-2 py-1 rounded text-sm ${
                currentEvent.status === 'active' ? 'bg-green-100 text-green-800' : 
                currentEvent.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {currentEvent.status}
              </span>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  )
}