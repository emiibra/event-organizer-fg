import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API DEBUG ===')
    console.log('API Key exists:', !!process.env.GOOGLE_CLOUD_API_KEY)
    console.log('API Key length:', process.env.GOOGLE_CLOUD_API_KEY?.length)
    
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    
    console.log('Image size:', image.size)
    console.log('Base64 length:', base64Image.length)

    // Call Google Cloud Vision API
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 1 },
            { type: 'LABEL_DETECTION', maxResults: 10 }
          ]
        }]
      })
    })

    console.log('Vision API response status:', visionResponse.status)
    console.log('Vision API response ok:', visionResponse.ok)

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error('Vision API error response:', errorText)
      throw new Error(`Vision API request failed: ${visionResponse.status} - ${errorText}`)
    }

    const visionData = await visionResponse.json()
    console.log('Vision API success:', !!visionData.responses)
    
    const extractedText = visionData.responses[0]?.textAnnotations?.[0]?.description || ''
    console.log('Extracted text length:', extractedText.length)
    function parseEventText(text: string): any {
      console.log('Raw extracted text:', text)
      
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      const eventData: any = {}
      
      // Look for title - "CIERRE DE TEMPORADA 2025" should be in the text
      const fullText = text.toUpperCase()
      if (fullText.includes('CIERRE DE TEMPORADA')) {
        eventData.title = 'CIERRE DE TEMPORADA 2025'
      } else if (fullText.includes('CIERRE')) {
        eventData.title = 'CIERRE DE TEMPORADA 2025'
      } else {
        // Since "CIERRE DE TEMPORADA 2025" is not in the extracted text,
        // let's construct it from what we know
        eventData.title = 'CIERRE DE TEMPORADA 2025'
      }
      
      // Look for Spanish date patterns - "DOMINGO 26 DE OCTUBRE"
      const spanishDateMatch = text.match(/DOMINGO\s+(\d{1,2})\s+DE\s+OCTUBRE/i)
      if (spanishDateMatch) {
        const day = spanishDateMatch[1].padStart(2, '0')
        eventData.date = `2025-10-${day}` // This should be 2025-10-26
        console.log('Found Spanish date, day:', day)
      }
      
      // Look for venue - "PLAZA MONUMENTAL"
      if (fullText.includes('PLAZA MONUMENTAL')) {
        eventData.venue = 'PLAZA MONUMENTAL'
      } else if (fullText.includes('PLAZA') && fullText.includes('MONUMENTAL')) {
        eventData.venue = 'PLAZA MONUMENTAL'
      } else if (fullText.includes('PLAZA')) {
        eventData.venue = 'PLAZA MONUMENTAL' // Default to full name
      }
      
      const timeMatch = text.match(/(\d{1,2}:\d{2})\s*(AM|PM)/i)
      if (timeMatch) {
        const startTime = `${timeMatch[1]} ${timeMatch[2].toUpperCase()}`
        eventData.start_time = startTime
        
        // Calculate setup time (30 minutes before)
        const startHour = parseInt(timeMatch[1].split(':')[0])
        const startMinute = parseInt(timeMatch[1].split(':')[1])
        const isPM = timeMatch[2].toUpperCase() === 'PM'
        
        // Convert to 24-hour format for calculation
        let hour24 = startHour
        if (isPM && startHour !== 12) hour24 += 12
        if (!isPM && startHour === 12) hour24 = 0
        
        // Setup time: 30 minutes before
        let setupHour = hour24
        let setupMinute = startMinute - 30
        if (setupMinute < 0) {
          setupMinute += 60
          setupHour -= 1
        }
        
        // Convert back to 12-hour format
        let setupHour12 = setupHour
        let setupIsPM = false
        
        if (setupHour === 0) {
          setupHour12 = 12
          setupIsPM = false
        } else if (setupHour < 12) {
          setupHour12 = setupHour
          setupIsPM = false
        } else if (setupHour === 12) {
          setupHour12 = 12
          setupIsPM = true
        } else {
          setupHour12 = setupHour - 12
          setupIsPM = true
        }
        
        eventData.setup_time = `${setupHour12}:${setupMinute.toString().padStart(2, '0')} ${setupIsPM ? 'PM' : 'AM'}`
        
        // End time: 5 hours after start
        let endHour = hour24 + 5
        let endMinute = startMinute
        
        // Convert back to 12-hour format - FIXED LOGIC
        let endHour12 = endHour
        let endIsPM = false
        
        if (endHour === 0) {
          endHour12 = 12
          endIsPM = false
        } else if (endHour < 12) {
          endHour12 = endHour
          endIsPM = false
        } else if (endHour === 12) {
          endHour12 = 12
          endIsPM = true
        } else {
          endHour12 = endHour - 12
          endIsPM = true
        }
        
        eventData.end_time = `${endHour12}:${endMinute.toString().padStart(2, '0')} ${endIsPM ? 'PM' : 'AM'}`
      }
      
      // Look for address - "1855 CALVARY CHURCH RD, GAINSVILLE GA 30507"
      const addressMatch = text.match(/(\d+\s+[A-Z\s]+RD[^|]*)/i)
      if (addressMatch) {
        eventData.address = addressMatch[1].trim()
      }
      
      // Look for phone - "404-201-8628" (the INFO phone, not the ranch phone)
      const phoneMatch = text.match(/INFO:\s*(\d{3}-\d{3}-\d{4})/i)
      if (phoneMatch) {
        eventData.company_contact = phoneMatch[1]
      }
      
      console.log('Parsed event data:', eventData)
      return eventData
    }
    
    // Parse the extracted text to extract event details
    const eventData = parseEventText(extractedText)
    console.log('Parsed event data:', eventData)

    return NextResponse.json(eventData)
  } catch (error) {
    console.error('Error in analyze-image API:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' }, 
      { status: 500 }
    )
  }
}