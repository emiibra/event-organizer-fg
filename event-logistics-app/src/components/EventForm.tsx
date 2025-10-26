'use client'

import { useState } from 'react'
import ImageUpload from './ImageUpload'

interface EventFormData {
  title: string
  date: string
  start_time?: string
  end_time?: string
  setup_time?: string
  venue: string
  address?: string
  company_contact?: string
  capacity?: number
  description?: string
  status: string
  coordinator_email: string
}

interface EventFormProps {
  onEventCreated: () => void
}

export default function EventForm({ onEventCreated }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    setup_time: '',
    venue: '',
    address: '',
    company_contact: '',
    capacity: 0,
    description: `BOOTH:
    • Banner 
    • Table + FG tablecloth
    • Business cards
    • QR codes (raffle + social media)
    • Merch (hats, tote bags(blue and transparent), backpacks, bottles, thermo cups, sanitizer, lunch box.)
    • Raffle Item if applicable`,
    status: 'draft',
    coordinator_email: 'emiliaabravo19@gmail.com'
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    console.log('Form data being sent:', formData)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage('Event created successfully! 🎉')
        setFormData({
          title: '',
          date: '',
          start_time: '',
          end_time: '',
          setup_time: '',
          venue: '',
          address: '',
          company_contact: '',
          capacity: 0,
          description: '',
          status: 'draft',
          coordinator_email: 'emiliaabravo19@gmail.com'
        })
        onEventCreated() // Refresh the events list
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch {
      setMessage('Error creating event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  interface ExtractedData {
    title?: string
    date?: string
    start_time?: string
    end_time?: string
    setup_time?: string
    venue?: string
    address?: string
    company_contact?: string
    capacity?: number
    description?: string
  }

  const handleDataExtracted = (data: ExtractedData) => {
    // Auto-fill form with extracted data (remove setExtractedData(data))
    setFormData(prev => ({
      ...prev,
      title: data.title || prev.title,
      date: data.date || prev.date,
      start_time: data.start_time || prev.start_time,
      end_time: data.end_time || prev.end_time,
      setup_time: data.setup_time || prev.setup_time,
      venue: data.venue || prev.venue,
      address: data.address || prev.address,
      company_contact: data.company_contact || prev.company_contact,
      capacity: data.capacity || prev.capacity,
      description: data.description || prev.description
    }))
  }
    

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold mb-6 custom-blue">Create New Event</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      <ImageUpload 
        onDataExtracted={handleDataExtracted}
        disabled={loading}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              placeholder="e.g., 3:00"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              onChange={(e) => {
                const time = formData.start_time?.replace(/AM|PM/i, '').trim() || ''
                setFormData(prev => ({ ...prev, start_time: `${time} ${e.target.value}` }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              placeholder="e.g., 6:00"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              onChange={(e) => {
                const time = formData.end_time?.replace(/AM|PM/i, '').trim() || ''
                setFormData(prev => ({ ...prev, end_time: `${time} ${e.target.value}` }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Setup Time */}
        <div>
          <label htmlFor="setup_time" className="block text-sm font-medium text-gray-700 mb-1">
            Setup Time
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="setup_time"
              name="setup_time"
              value={formData.setup_time}
              onChange={handleInputChange}
              placeholder="e.g., 2:00"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              onChange={(e) => {
                const time = formData.setup_time?.replace(/AM|PM/i, '').trim() || ''
                setFormData(prev => ({ ...prev, setup_time: `${time} ${e.target.value}` }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
            Venue *
          </label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter venue name"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event address"
          />
        </div>

        <div>
          <label htmlFor="company_contact" className="block text-sm font-medium text-gray-700 mb-1">
            Company/Contact
          </label>
          <input
            type="text"
            id="company_contact"
            name="company_contact"
            value={formData.company_contact}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter company or contact name"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter maximum capacity"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event description"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  )
}

