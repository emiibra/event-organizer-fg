'use client'

import { useState, useEffect } from 'react'
import EventForm from '@/components/EventForm'
import EventDetail from '@/components/EventDetail'
import Header from '@/components/Header'

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
  raffle_item?: string
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  useEffect(() => {
    fetchEvents()
  }, [])
  const [activeTab, setActiveTab] = useState('events')

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      
      // Check if response is ok
      if (!response.ok) {
        console.error('Failed to fetch events:', response.status)
        setEvents([]) // Set empty array on error
        return
      }
      
      const data = await response.json()
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data)
        setEvents([]) // Set empty array if not an array
        return
      }
      
      // Auto-update event status based on date
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      
      const updatedEvents = data.map((event: Event)  => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0) // Reset time to start of day
        
        // Calculate the day after the event
        const dayAfterEvent = new Date(eventDate)
        dayAfterEvent.setDate(dayAfterEvent.getDate() + 1)
        
        // Check if event is missing required info
        const hasRequiredInfo = event.address && event.start_time && event.end_time
        
        // Auto-update status
        if (today >= dayAfterEvent) {
          return { ...event, status: 'completed' }
        } else if (!hasRequiredInfo) {
          return { ...event, status: 'draft' }
        } else {
          return { ...event, status: 'active' }
        }
      })
      
      // Sort events chronologically (NEWER first, OLDER last)
      const sortedEvents = updatedEvents.sort((a: Event, b: Event) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime() // Reversed: newer first
      })
      
      setEvents(sortedEvents)
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

  const formatEventDetails = (event: Event) => {
    // Format the date
    const eventDate = new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  
    // Format times
    const setupTime = event.setup_time ? new Date(`2000-01-01T${event.setup_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'TBD'
  
    const startTime = event.start_time ? new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'TBD'
  
    const endTime = event.end_time ? new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'TBD'
  
    // Create the formatted message
    const teamViewLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/team/${event.id}`
    return `*EVENT DETAILS*

    *Event:* ${event.title}
    *Date:* ${eventDate}
    *Location:* ${event.venue}${event.address ? `, ${event.address}` : ''}
    *Time:* ${startTime} - ${endTime}
    *Setup:* ${setupTime}
    *Contact:* ${event.company_contact || 'TBD'}
    *Capacity:* ${event.capacity || 'TBD'} estimated
    *Description:*
    ${event.description || 'No description provided'}
    *Raffle Item:* ${event.raffle_item || 'No raffle item provided'}
    ---
    
Team View: ${teamViewLink}
    `
  }

  const sendEventDetails = (event: Event) => {
    console.log('sendEventDetails called with:', event) 
    const message = formatEventDetails(event)
  
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    // Create WhatsApp link
    const whatsappMessage = encodeURIComponent(message)
    const whatsappAppUrl = `https://wa.me/?text=${whatsappMessage}`
    const whatsappWebUrl = `https://web.whatsapp.com/send?text=${whatsappMessage}`
    
    if (isMobile) {
      console.log('📱 Mobile detected - using WhatsApp App')
      window.open(whatsappAppUrl, '_blank')
    } else {
      console.log('💻 Desktop/Tablet detected - using WhatsApp Web')
      window.open(whatsappWebUrl, '_blank')
    }
  }

  const copyEventDetails = (event: Event) => {
    console.log('copyEventDetails called with:', event) 
    const message = formatEventDetails(event)
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      alert('Event details copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy to clipboard')
    })
  }

  if (loading) return <div className="p-8">Loading events...</div>
  return (
    <div className="p-8 bg-white text-black min-h-screen">
    {/* Header Component */}
    <Header activeTab={activeTab} onTabChange={setActiveTab} />

    {/* Tab Content */}
    {activeTab === 'events' && (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Event Logistics Manager</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3 min-w-[200px]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
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
          events.map((currentEvent) => {
            // Check for missing required info
            const missingInfo = []
            if (!currentEvent.address) missingInfo.push('Address')
            if (!currentEvent.start_time) missingInfo.push('Start Time')
            if (!currentEvent.end_time) missingInfo.push('End Time')
            
            const hasMissingInfo = missingInfo.length > 0
          
            return (
              <div 
                key={currentEvent.id} 
                className={`border p-4 rounded-lg bg-blue-50 shadow-sm transition-shadow cursor-pointer hover:shadow-md hover:bg-blue-100 ${
                  hasMissingInfo ? 'border-red-200 bg-red-50' : 'border-blue-200'
                }`}
                onClick={() => setSelectedEvent(currentEvent)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-black text-xl font-semibold">{currentEvent.title}</h2>
                      {hasMissingInfo && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Missing: {missingInfo.join(', ')}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{currentEvent.date}</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      currentEvent.status === 'active' ? 'bg-green-100 text-green-800' : 
                      currentEvent.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentEvent.status}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent opening event detail
                        sendEventDetails(currentEvent)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Send Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent opening event detail
                        copyEventDetails(currentEvent)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Copy Details
                    </button>
                  </div>
                </div>  
                </div>
              )
            })
          )}
        </div>
      </>
    )}

      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onEventDeleted={() => {
            setSelectedEvent(null) // Close the modal
            fetchEvents() // Refresh the events list
          }}
          onEventUpdated={(updated) => {
            // patch list in memory so UI updates immediately
            setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
            // also update the modal’s selectedEvent so it reflects the new data
            setSelectedEvent(updated)
          }}
        />
      )}
    </div>
  )
}