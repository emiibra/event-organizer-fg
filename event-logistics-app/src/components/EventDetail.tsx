'use client'

import { useState, useEffect, useCallback} from 'react'
import QRCodeDisplay from './QRCodeDisplay'
import { useRaffle } from '@/hooks/useRaffle'

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
  }

export default function EventDetail({ event, onClose }: EventDetailProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [participants, setParticipants] = useState<Participant[]>([])
    const [showRaffle, setShowRaffle] = useState(false)
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
    const closeRaffle = () => setShowRaffle(false)
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
            {activeTab === 'overview' && <OverviewTab event={event} />}
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
function OverviewTab({ event }: { event: Event }) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Title:</span> {event.title}</div>
              <div><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</div>
              <div><span className="font-medium">Venue:</span> {event.venue}</div>
              {event.address && <div><span className="font-medium">Address:</span> {event.address}</div>}
              {event.company_contact && <div><span className="font-medium">Contact:</span> {event.company_contact}</div>}
              {event.capacity && <div><span className="font-medium">Capacity:</span> {event.capacity}</div>}
              <div><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  event.status === 'active' ? 'bg-green-100 text-green-800' : 
                  event.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Timing</h3>
          <div className="space-y-2 text-sm">
            {event.setup_time && <div><span className="font-medium">Setup Time:</span> {event.setup_time}</div>}
            {event.start_time && <div><span className="font-medium">Start Time:</span> {event.start_time}</div>}
            {event.end_time && <div><span className="font-medium">End Time:</span> {event.end_time}</div>}
            <div><span className="font-medium">Created:</span> {new Date(event.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      {event.description && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-sm text-gray-700">{event.description}</p>
        </div>
      )}
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

