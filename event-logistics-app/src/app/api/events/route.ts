import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// Simple time converter
// Normalize any time string to "HH:MM" (handles "6", "6pm", "6:20 PM", "06:20:00 AM", "18:30")
const convertToTimeFormat = (timeStr: string): string | null => {
  if (!timeStr) return null
  const raw = String(timeStr).trim().toLowerCase()
  if (!raw) return null

  // Match hh[:mm][:ss][ am|pm]
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)?$/i)
  if (m) {
    let hour = parseInt(m[1], 10)
    const minute = m[2] ?? '00'
    const ampm = (m[4] ?? '').toLowerCase()
    if (ampm === 'pm' && hour !== 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    if (hour < 0 || hour > 23) return null
    return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}` // <- HH:MM only
  }

  // Allow plain 24h "hh:mm"
  if (/^\d{1,2}:\d{2}$/.test(raw)) return raw

  return null
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const eventData = await request.json()
    console.log('Received date:', eventData.date)
    const { data, error } = await getSupabaseClient()  
      .from('events')
      .insert({
        title: eventData.title,
        date: eventData.date,
        start_time: convertToTimeFormat(eventData.start_time),
        end_time: convertToTimeFormat(eventData.end_time),
        setup_time: convertToTimeFormat(eventData.setup_time),
        venue: eventData.venue,
        address: eventData.address || null,
        company_contact: eventData.company_contact || null,
        capacity: eventData.capacity || null,
        description: eventData.description || null,
        status: eventData.status,
        coordinator_email: 'emiliaabravo19@gmail.com',
        raffle_item: eventData.raffle_item || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('❌ API Error:', error)
    return NextResponse.json({  error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const eventData = await request.json()

    // Normalize to "HH:MM"
    if (typeof eventData.setup_time === 'string') {
      eventData.setup_time = convertToTimeFormat(eventData.setup_time)
    }
    if (typeof eventData.start_time === 'string') {
      eventData.start_time = convertToTimeFormat(eventData.start_time)
    }
    if (typeof eventData.end_time === 'string') {
      eventData.end_time = convertToTimeFormat(eventData.end_time)
    }

    const { data, error } = await getSupabaseClient()
      .from('events')
      .update(eventData)
      .eq('id', eventData.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

  export async function GET() {
  try {
    const { data, error } = await getSupabaseClient()
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-update status based on date
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    const updatedEvents = data.map(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      
      // Check if event is missing required info
      const hasRequiredInfo = event.address && event.start_time && event.end_time
      
      // Auto-update status
      if (eventDate < today) {
        return { ...event, status: 'completed' }
      } else if (!hasRequiredInfo) {
        return { ...event, status: 'draft' }
      } else {
        return { ...event, status: 'active' }
      }
    })

    // Update events in database if status changed
    for (const event of updatedEvents) {
      if (event.status !== data.find(e => e.id === event.id)?.status) {
        await getSupabaseClient()
          .from('events')
          .update({ status: event.status })
          .eq('id', event.id)
      }
    }

    return NextResponse.json(updatedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    console.log('Deleting event with ID:', eventId)

    const { error } = await getSupabaseClient()
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Event deleted successfully')
    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}