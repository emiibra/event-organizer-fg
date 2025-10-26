import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// GET method - para obtener participantes
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const eventId = searchParams.get('eventId')
      
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
      }
  
      const { data, error } = await getSupabaseClient()
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('signup_time', { ascending: false })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      return NextResponse.json(data)
    } catch (error: unknown) {
      console.error('❌ API Error:', error)
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 })
    }
  }
  // POST method - para crear participantes
export async function POST(request: NextRequest) {
  try {
    const participantData = await request.json()
    
    const { data, error } = await getSupabaseClient()  
      .from('participants')
      .insert({
        full_name: participantData.fullName,
        email: participantData.email,
        phone_number: participantData.phoneNumber,
        event_id: participantData.eventId, 
        signup_time: new Date().toISOString() 
      })
      .select()
      .single()
    
    if (error) {
      console.error(' Supabase error:', error)
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}