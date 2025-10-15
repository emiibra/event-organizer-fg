'use client'

import { useState, useEffect, useCallback } from 'react'

interface Participant {
  id: string
  full_name: string
  email: string
  phone_number: string
  event_id: string
  signup_time: string
}

interface UseRaffleProps {
  eventId: string
  participants: Participant[]
}

export function useRaffle({ eventId, participants }: UseRaffleProps) {
  const [raffleWinners, setRaffleWinners] = useState<Participant[]>([])
  
  // Load winners from localStorage on mount
  useEffect(() => {
    const savedWinners = localStorage.getItem(`raffle-winners-${eventId}`)
    if (savedWinners) {
      try {
        setRaffleWinners(JSON.parse(savedWinners))
      } catch (error) {
        console.error('Error loading raffle winners:', error)
      }
    }
  }, [eventId])

  // Save winners to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`raffle-winners-${eventId}`, JSON.stringify(raffleWinners))
  }, [raffleWinners, eventId])

  // Get participants who haven't won yet
  const getAvailableParticipants = useCallback(() => {
    return participants.filter(p => 
      !raffleWinners.some(w => w.id === p.id)
    )
  }, [participants, raffleWinners])

  // Conduct a simple raffle (for EventDetail)
  const conductSimpleRaffle = useCallback(() => {
    if (participants.length === 0) return null
    
    const availableParticipants = getAvailableParticipants()
    
    if (availableParticipants.length === 0) {
      alert('All participants have already won!')
      return null
    }
    
    const randomIndex = Math.floor(Math.random() * availableParticipants.length)
    const winner = availableParticipants[randomIndex]
    
    setRaffleWinners(prev => [...prev, winner])
    return winner
  }, [participants, getAvailableParticipants])

  // Add a winner (for TeamView wheel)
  const addWinner = useCallback((winner: Participant) => {
    setRaffleWinners(prev => [...prev, winner])
  }, [])

  // Reset all winners
  const resetRaffle = useCallback(() => {
    setRaffleWinners([])
    localStorage.removeItem(`raffle-winners-${eventId}`)
  }, [eventId])

  return {
    raffleWinners,
    getAvailableParticipants,
    conductSimpleRaffle,
    addWinner,
    resetRaffle
  }
}