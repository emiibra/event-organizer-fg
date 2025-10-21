'use client'

import { useState, useEffect, useCallback} from 'react'
import QRCodeDisplay from './QRCodeDisplay'
import { useRaffle } from '@/hooks/useRaffle'
import { useExcelExport } from '@/hooks/useExcelExport'

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
interface Participant {
  id: string
  full_name: string
  email: string
  phone_number: string
  event_id: string
  signup_time: string
}
interface EventDetailProps {
    event: Event
    onClose: () => void
    onEventDeleted?: () => void 
  }

  export default function EventDetail({ event, onClose, onEventDeleted }: EventDetailProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [participants, setParticipants] = useState<Participant[]>([])
    const [showRaffle, setShowRaffle] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentEvent, setCurrentEvent] = useState<Event>(event)
    const [editedEvent, setEditedEvent] = useState<Event>(event)
    
    const { raffleWinners, conductSimpleRaffle, resetRaffle } = useRaffle({
      eventId: event.id,
      participants
    })

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'team', label: 'Team' },
        { id: 'logistics', label: 'Logistics' },
        { id: 'participants', label: 'Participants' },
        { id: 'qr-code', label: 'QR Code' },
        { id: 'payments', label: 'Payments' }
    ]
  // Fetch participants when participants tab is active
  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch(`/api/participants?eventId=${event.id}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }, [event.id]) 
  
  const handleEdit = () => {
    setEditedEvent(currentEvent) 
    setIsEditing(true)
  }
  
  const handleSave = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedEvent), // includes id
      })
      if (response.ok) {
        const updated = await response.json()
        setCurrentEvent(updated)   // <- Use the server’s truth after save
        setIsEditing(false)
        alert('Event updated successfully!')
      } else {
        const err = await response.json().catch(() => ({}))
        alert(`Failed to update event${err?.error ? `: ${err.error}` : ''}`)
      }
    } catch (e) {
      console.error('Error updating event:', e)
      alert('Error updating event')
    }
  }
  
  const handleCancel = () => {
    setEditedEvent(event)
    setIsEditing(false)
  }

  const handleDeleteEvent = async () => {
    // Show confirmation popup
    const confirmed = confirm(`Are you sure you want to delete "${currentEvent.title}"?\n\nThis action cannot be undone.`)
    
    if (!confirmed) {
      return // User cancelled
    }
  
    console.log('=== DELETE DEBUG ===')
    console.log('Event to delete:', currentEvent)
    console.log('Event ID:', currentEvent.id)
  
    try {
      const response = await fetch(`/api/events?id=${currentEvent.id}`, {
        method: 'DELETE',
      })
  
      console.log('Delete response status:', response.status)
  
      if (response.ok) {
        alert('Event deleted successfully!')
        onClose()
        onEventDeleted?.() // Close the EventDetail modal
      } else {
        const errorData = await response.json()
        console.error('Delete error response:', errorData)
        alert(`Failed to delete event: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event. Please try again.')
    }
  }
  
  const handleInputChange = (field: keyof Event, value: string) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  useEffect(() => {
    if (activeTab === 'participants') {
      fetchParticipants()
    }
  }, [activeTab, fetchParticipants])

    const conductRaffle = () => {
      const winner = conductSimpleRaffle()
      if (winner) {
        setShowRaffle(true)
      }
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
                <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-blue-100">
                    {new Date(event.date).toLocaleDateString()} at {event.venue}
                </p>
                </div>
                <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                    Close
                </button>
            </div>
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </nav>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'overview' && <OverviewTab 
              event={currentEvent}
              isEditing={isEditing}
              editedEvent={editedEvent}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onInputChange={handleInputChange}
              onDelete={handleDeleteEvent}
            />}
            {activeTab === 'team' && <TeamTab event={event} />}
            {activeTab === 'logistics' && <LogisticsTab event={event} />}
            {activeTab === 'participants' && <ParticipantsTab 
              participants={participants}
              raffleWinners={raffleWinners}
              showRaffle={showRaffle}
              onConductRaffle={conductRaffle}
              onCloseRaffle={() => setShowRaffle(false)}
              onResetRaffle={resetRaffle}
              eventTitle={event.title}
            />}
            {activeTab === 'qr-code' && <QRCodeTab event={event} />}
            {activeTab === 'payments' && <PaymentsTab event={event} />}
            </div>
        </div>
        </div>
    )
    }
    // Overview Tab
function OverviewTab({ event, isEditing, editedEvent, onEdit, onSave, onCancel, onInputChange, onDelete }: { 
  event: Event
  isEditing: boolean
  editedEvent: Event
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onInputChange: (field: keyof Event, value: string) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Event Details</h3>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Edit Event
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={onSave}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Delete Event
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Event Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.title}
                  onChange={(e) => onInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.title}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedEvent.date}
                  onChange={(e) => onInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.date}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.venue}
                  onChange={(e) => onInputChange('venue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.venue}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.address || ''}
                  onChange={(e) => onInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.address || 'Not specified'}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.company_contact || ''}
                  onChange={(e) => onInputChange('company_contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.company_contact || 'Not specified'}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedEvent.capacity || ''}
                  onChange={(e) => onInputChange('capacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-sm">{event.capacity || 'Not specified'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Timing</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setup Time</label>
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editedEvent.setup_time || ''}
                    onChange={(e) => onInputChange('setup_time', e.target.value)}
                    placeholder="e.g., 2:00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    onChange={(e) => {
                      const time = editedEvent.setup_time?.replace(/AM|PM/i, '').trim() || ''
                      onInputChange('setup_time', `${time} ${e.target.value}`)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              ) : (
                <div className="text-sm">{event.setup_time || 'Not specified'}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editedEvent.start_time || ''}
                    onChange={(e) => onInputChange('start_time', e.target.value)}
                    placeholder="e.g., 3:00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    onChange={(e) => {
                      const time = editedEvent.start_time?.replace(/AM|PM/i, '').trim() || ''
                      onInputChange('start_time', `${time} ${e.target.value}`)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              ) : (
                <div className="text-sm">{event.start_time || 'Not specified'}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editedEvent.end_time || ''}
                    onChange={(e) => onInputChange('end_time', e.target.value)}
                    placeholder="e.g., 6:00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    onChange={(e) => {
                      const time = editedEvent.end_time?.replace(/AM|PM/i, '').trim() || ''
                      onInputChange('end_time', `${time} ${e.target.value}`)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              ) : (
                <div className="text-sm">{event.end_time || 'Not specified'}</div>
              )}
            </div>
          </div>
        </div>

      {/* Description */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
        {isEditing ? (
          <textarea
            value={editedEvent.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event description..."
          />
        ) : (
          <div className="text-sm text-gray-700">{event.description || 'No description provided'}</div>
        )}
      </div>
      </div>
    </div>
  )
}
// Team Tab
function TeamTab({ event }: { event: Event }) {
  const setupTeam = [
    { name: "Emilia Bravo", role: "set up team coordinator", phone: "6783604682" },
    { name: "Maria Garcia", role: "Equipment Manager", phone: "+1 (555) 234-5678" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team </h3>
        <button 
          onClick={() => window.open(`/team/${event.id}`, '_blank')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Team View
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {setupTeam.map((member, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{member.name}</h4>
            <p className="text-sm text-gray-600">{member.role}</p>
            <p className="text-sm text-blue-600">{member.phone}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
// Logistics Tab
//to add event param later
function LogisticsTab({}: { event: Event }) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold ">Event Logistics</h3>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">Logistics management coming soon!</p>
          <p className="text-sm text-yellow-600 mt-2">This will include your checklist items, setup requirements, and task assignments.</p>
        </div>
      </div>
    )
  }
  // Participants Tab
  //to add event param later
  function ParticipantsTab({ 
    participants, 
    raffleWinners, 
    showRaffle, 
    onConductRaffle, 
    onCloseRaffle,
    onResetRaffle,
    eventTitle
  }: { 
    participants: Participant[]
    raffleWinners: Participant[]
    showRaffle: boolean
    onConductRaffle: () => void
    onCloseRaffle: () => void
    onResetRaffle: () => void
    eventTitle: string
  }) {
    const { downloadExcel } = useExcelExport({ participants, eventTitle })
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Event Participants ({participants.length})
          </h3>
          <div className="space-x-2">
            <button
              onClick={onConductRaffle}
              disabled={participants.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              Make Raffle
            </button>
            {raffleWinners.length > 0 && (
              <button
                onClick={onResetRaffle}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Reset Raffle
              </button>
            )}
            <button
            onClick={downloadExcel}
            disabled={participants.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            Download Excel
          </button>
          </div>
        </div>
        {showRaffle && raffleWinners.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Raffle Winners:</h4>
          {raffleWinners.map((winner, index) => (
            <div key={winner.id} className="text-sm text-yellow-700 mb-1">
              {index + 1}. {winner.full_name} - {winner.email} - {winner.phone_number}
            </div>
          ))}
          <button
            onClick={onCloseRaffle}
            className="mt-2 text-xs text-yellow-600 underline"
          >
            Close Raffle Results
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <div key={participant.id} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{participant.full_name}</h4>
            <p className="text-sm text-gray-600">{participant.email}</p>
            <p className="text-sm text-gray-600">{participant.phone_number}</p>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No participants yet. Share the QR code to get signups!
        </div>
      )}
    </div>
  )
}
  // QR Code Tab
function QRCodeTab({ event }: { event: Event }) {
    return (
      <QRCodeDisplay
        eventId={event.id}
        eventTitle={event.title}
        showTitle={true}
      />
    )
  }

// Payments Tab
function PaymentsTab({}: { event: Event }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Post-Event Payments</h3>
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-green-800">Payment management coming soon!</p>
        <p className="text-sm text-green-600 mt-2">This will handle hours, miles, expenses, and CPA integration.</p>
      </div>
    </div>
  )
}

