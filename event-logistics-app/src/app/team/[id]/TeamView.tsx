'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import SVGWheel from '@/components/SVGWheel'
import { useRaffle } from '@/hooks/useRaffle'
import { useExcelExport } from '@/hooks/useExcelExport'

interface Event {
  id: string
  title: string
  date: string
  venue: string
  start_time?: string
  end_time?: string
}

interface Participant {
  id: string
  full_name: string
  email: string
  phone_number: string
  event_id: string
  signup_time: string
}

interface TeamViewProps {
  eventId: string
}

export default function TeamView({ eventId }: TeamViewProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  // Wheel state
  const [showWheel, setShowWheel] = useState(false)
  const [wheelData, setWheelData] = useState<{ option: string; id: string }[]>([])
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [wheelSpinning, setWheelSpinning] = useState(false)
  const [lastWinner, setLastWinner] = useState<Participant | null>(null)
  const { raffleWinners, getAvailableParticipants, addWinner, resetRaffle } = useRaffle({
    eventId,
    participants
  })
  const { shareViaWhatsApp } = useExcelExport({ 
    participants, 
    eventTitle: event?.title || 'Event' 
  })


  // Fetch event data
  const fetchEventData = useCallback(async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const events = await response.json()
        const currentEvent = events.find((e: Event) => e.id === eventId)
        setEvent(currentEvent || null)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch(`/api/participants?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      } else {
        console.error('Failed to fetch participants:', response.status)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }, [eventId])

  useEffect(() => {
    fetchEventData()
    fetchParticipants()
  }, [fetchEventData, fetchParticipants]) 

  const buildWheelData = (participantPool: Participant[]) => {
    console.log('🔍 === BUILDING WHEEL DATA START ===')
    console.log('🔍 Input participantPool:', participantPool)
    console.log('🔍 Total participants:', participantPool.length)
    
    const wheelData = participantPool.map((p, index) => {
      console.log(`🔍 Processing participant ${index + 1}:`, p)
      
      // Step 1: Get the raw name
      const rawName = p.full_name || p.email || 'Unknown'
      console.log(`🔍 Raw name for ${index + 1}:`, rawName)
      
      // Step 2: Clean the name
      const cleanName = rawName.trim()
      console.log(`🔍 Clean name for ${index + 1}:`, cleanName)
      
      // Step 3: Ensure it's not empty after cleaning
      let finalName = cleanName
      if (!finalName || finalName === '') {
        finalName = `Participant ${index + 1}`
        console.log(`🔍 Name was empty, using fallback:`, finalName)
      }
      
      // Step 4: Limit length
      const truncatedName = finalName.slice(0, 25)
      console.log(`🔍 Final truncated name for ${index + 1}:`, truncatedName)
      
      const result = { 
        option: truncatedName, 
        id: p.id 
      }
      
      console.log(`🔍 Final result for ${index + 1}:`, result)
      return result
    })
  
  console.log('🔍 === FINAL WHEEL DATA ===')
  console.log('🔍 Complete wheel data:', wheelData)
  console.log('🔍 All options:', wheelData.map(d => d.option))
  console.log('🔍 All IDs:', wheelData.map(d => d.id))
  console.log('🔍 === BUILDING WHEEL DATA END ===')
  
  return wheelData
}

  // Helper: Start spinning with animation
  const startSpin = (participantPool: Participant[]) => {
    const data = buildWheelData(participantPool)
    if (data.length === 0) {
      alert('No participants left to raffle!')
      return
    }
    
    console.log('🎯 Starting spin with data:', data)
    setWheelData(data)
    setPrizeNumber(Math.floor(Math.random() * data.length))
    console.log('🎯 Participants in wheel:', data.map(d => d.option))
    
    // Reset spinning state first
    setWheelSpinning(false)
    
    // Use setTimeout to ensure DOM updates before starting animation
    setTimeout(() => {
      console.log('🎯 Setting wheelSpinning to true')
      setWheelSpinning(true)
    }, 50)
  }

  // Main raffle function
  const openRaffleWheel = () => {
    if (participants.length === 0) {
      alert('No participants to raffle!')
      return
    }
    
    setLastWinner(null)
    setShowWheel(true)
    startSpin(participants) // Use ALL participants, not just available ones
  }

  // Reset all winners
  const resetRaffleLocal = () => {
    resetRaffle() // Use shared function
    setLastWinner(null)
    setShowWheel(false)
  }

  // Handle wheel spin completion
  const handleWheelStop = (winnerIndex: number) => {
    const winner = wheelData[winnerIndex]
    if (winner) {
      const participant = participants.find(p => p.id === winner.id)
      if (participant) {
        addWinner(participant) // Use shared function
        setLastWinner(participant)
      }
    }
    setWheelSpinning(false)
  }
  const finishEvent = () => {
    if (participants.length === 0) {
      alert('No participants to send.')
      return
    }
    
    // Show confirmation
    const confirmed = confirm(`Finish event and send Excel to WhatsApp?\n\nParticipants: ${participants.length}`)
    if (confirmed) {
      shareViaWhatsApp()
    }
  }

  // Close modal
  const closeModal = () => {
    setWheelSpinning(false)
    setShowWheel(false)
    setLastWinner(null)
  }

  // Spin again for next winner
  const spinAgain = () => {
    const available = getAvailableParticipants()
    if (available.length === 0) {
      alert('No more participants left to raffle!')
      return
    }
    setLastWinner(null)
    startSpin(available)
  }

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWheel) {
        closeModal()
      }
    }
    
    if (showWheel) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showWheel])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Calculate wheel spin angle
  const validPrize = Math.min(Math.max(prizeNumber, 0), Math.max(wheelData.length - 1, 0))
  const sliceAngle = wheelData.length > 0 ? 360 / wheelData.length : 0
  const spins = 5                    // full rotations for animation
  const pointerDeg = 270             // 12 o'clock in CSS/SVG coordinates
  const centerOfPrizeDeg = (validPrize + 0.5) * sliceAngle

  // Optional fine-tune if you see a tiny visual offset (keep 0 unless needed)
  const epsilon = 0  
  const targetAngle =   wheelData.length > 0
  ? (spins * 360) + (pointerDeg - centerOfPrizeDeg) + epsilon
  : 0

  const availableCount = getAvailableParticipants().length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString()} at {event.venue}
                {event.start_time && ` • ${event.start_time}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <QRCodeDisplay
            eventId={eventId}
            eventTitle={event?.title || 'Event'}
            showTitle={true}
          />
        </div>

        {/* Participants & Raffle Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Participants ({participants.length})
            </h2>
            <div className="space-x-2">
              <button
                onClick={openRaffleWheel}
                disabled={participants.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400"
              >
                Make Raffle
              </button>
              {raffleWinners.length > 0 && (
                <button
                  onClick={resetRaffleLocal}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Reset Raffle
                </button>
              )}
              <button
                onClick={finishEvent}
                disabled={participants.length === 0}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-400"
              >
                Finish Event
              </button>
            </div>
            </div>
          </div>

          {/* Winners Display */}
          {raffleWinners.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Raffle Winners ({raffleWinners.length}):
              </h3>
              {raffleWinners.map((winner, index) => (
                <div key={winner.id} className="text-sm text-yellow-700 mb-1">
                  {index + 1}. {winner.full_name} - {winner.email} - {winner.phone_number}
                </div>
              ))}
            </div>
          )}

          {/* Participants List */}
          <div className="max-h-96 overflow-y-auto">
            {participants.length > 0 ? (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{participant.full_name}</h4>
                        <p className="text-sm text-gray-600">{participant.email}</p>
                        <p className="text-sm text-gray-600">{participant.phone_number}</p>
                      </div>
                      {raffleWinners.some(w => w.id === participant.id) && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Winner!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No participants yet. Share the QR code to get signups!
              </div>
            )}
          </div>

          {/* Raffle Wheel Modal */}
          {showWheel && wheelData.length > 0 && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-lg p-6 w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4 text-center">Raffle Wheel</h3>
                
                {/* Winner Display */}
                {!wheelSpinning && lastWinner && (
                  <div className="text-center mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">🎉 Winner!</p>
                    <p className="text-sm text-green-700">
                      {lastWinner.full_name} - {lastWinner.email} - {lastWinner.phone_number}
                    </p>
                  </div>
                )}

                <div className="flex justify-center">
                  <SVGWheel
                    data={wheelData}
                    spinning={wheelSpinning}
                    stopAngle={targetAngle}
                    onStop={() => handleWheelStop(validPrize)}
                  />
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Close
                  </button>
                  
                  {!wheelSpinning && availableCount > 0 && (
                    <button
                      type="button"
                      onClick={spinAgain}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Spin Again ({availableCount} left)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}