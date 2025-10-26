'use client'

import { useCallback } from 'react'

interface Participant {
  id: string
  full_name: string
  email: string
  phone_number: string
  event_id: string
  signup_time: string
}

interface UseExcelExportProps {
  participants: Participant[]
  eventTitle: string
}

export function useExcelExport({ participants, eventTitle }: UseExcelExportProps) {
  
  // Generate CSV content
  const generateCSV = useCallback(() => {
    const headers = ['signup_time', 'full_name', 'email', 'phone_number']
    
    const csvContent = [
      headers.join(','),
      ...participants.map(p => [
        `"${p.signup_time || ''}"`,
        `"${p.full_name || ''}"`,
        `"${p.email || ''}"`,
        `"${p.phone_number || ''}"`
      ].join(','))
    ].join('\n')
    
    return csvContent
  }, [participants])

  // Download Excel file (for Participants tab)
  const downloadExcel = useCallback(() => {
    if (participants.length === 0) {
      alert('No participants to export.')
      return
    }

    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `participants_${eventTitle.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [participants, eventTitle, generateCSV])

  // Share via WhatsApp (for Team View)
  const shareViaWhatsApp = useCallback(() => {
    if (participants.length === 0) {
      alert('No participants to share.')
      return
    }

    // Generate CSV content
    const csvContent = generateCSV()
    
    // Create a data URL for the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Create WhatsApp message with instructions
    const text = `📊 Participants Excel for "${eventTitle}"\n\nHere's the Excel file with ${participants.length} participants.`
    
    
    // Open WhatsApp
    const wa = `https://wa.me/16783604682?text=${encodeURIComponent(text)}`
    window.open(wa, '_blank')
  // Also trigger download as backup
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `participants_${eventTitle.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    }, [participants, eventTitle, generateCSV])

  return {
    downloadExcel,
    shareViaWhatsApp
  }
}