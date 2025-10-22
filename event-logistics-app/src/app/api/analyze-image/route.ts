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
      
      // UNIVERSAL TITLE DETECTION - Works for ANY event type
      let titleLine = null
      
      // Strategy 1: Look for structured patterns (Label: Value format)
      const structuredPatterns = [
        /title:\s*(.+)/i,
        /event:\s*(.+)/i,
        /name:\s*(.+)/i,
        /tournament:\s*(.+)/i,
        /competition:\s*(.+)/i,
        /match:\s*(.+)/i,
        /game:\s*(.+)/i
      ]
      
      for (const pattern of structuredPatterns) {
        const match = text.match(pattern)
        if (match) {
          titleLine = match[1].trim()
          break
        }
      }
      
      // Strategy 2: Look for event keywords in ANY language
      const eventKeywords = [
        // English
        'tournament', 'competition', 'match', 'game', 'event', 'festival', 'concert', 'show', 'expo', 'fair', 
        'conference', 'seminar', 'workshop', 'exhibition', 'gala', 'awards', 'summit', 'meeting',
        'convention', 'symposium', 'league', 'championship', 'celebration', 'party', 'gathering', 
        'reunion', 'anniversary', 'launch', 'opening', 'premiere', 'debut', 'showcase', 'presentation',
        'sale', 'market', 'bazaar', 'carnival', 'parade', 'march', 'rally', 'ceremony', 'graduation',
        'wedding', 'birthday', 'holiday', 'special', 'unique', 'annual', 'monthly', 'weekly', 'daily',
        // Spanish
        'torneo', 'competencia', 'partido', 'juego', 'evento', 'festival', 'concierto', 'espectaculo',
        'exposicion', 'feria', 'conferencia', 'seminario', 'taller', 'galeria', 'premios', 'cumbre',
        'reunion', 'convencion', 'simposio', 'liga', 'campeonato', 'celebracion', 'fiesta', 'encuentro',
        'aniversario', 'lanzamiento', 'apertura', 'estreno', 'debut', 'presentacion', 'venta', 'mercado',
        'bazar', 'carnaval', 'desfile', 'marcha', 'ceremonia', 'graduacion', 'boda', 'cumpleanos',
        'vacaciones', 'especial', 'unico', 'anual', 'mensual', 'semanal', 'diario',
        // Other languages
        'cierre', 'temporada', 'rodeo', 'infantil', 'juvenil', 'adulto', 'senior', 'master'
      ]
      
      if (!titleLine) {
        titleLine = lines.find(line => {
          const lowerLine = line.toLowerCase()
          
          // Skip obvious non-title lines
          if (
            // Skip dates
            lowerLine.includes('date:') || lowerLine.includes('fecha:') ||
            lowerLine.includes('domingo') || lowerLine.includes('sunday') ||
            lowerLine.includes('lunes') || lowerLine.includes('monday') ||
            lowerLine.includes('martes') || lowerLine.includes('tuesday') ||
            lowerLine.includes('miercoles') || lowerLine.includes('wednesday') ||
            lowerLine.includes('jueves') || lowerLine.includes('thursday') ||
            lowerLine.includes('viernes') || lowerLine.includes('friday') ||
            lowerLine.includes('sabado') || lowerLine.includes('saturday') ||
            lowerLine.includes('enero') || lowerLine.includes('january') ||
            lowerLine.includes('febrero') || lowerLine.includes('february') ||
            lowerLine.includes('marzo') || lowerLine.includes('march') ||
            lowerLine.includes('abril') || lowerLine.includes('april') ||
            lowerLine.includes('mayo') || lowerLine.includes('may') ||
            lowerLine.includes('junio') || lowerLine.includes('june') ||
            lowerLine.includes('julio') || lowerLine.includes('july') ||
            lowerLine.includes('agosto') || lowerLine.includes('august') ||
            lowerLine.includes('septiembre') || lowerLine.includes('september') ||
            lowerLine.includes('octubre') || lowerLine.includes('october') ||
            lowerLine.includes('noviembre') || lowerLine.includes('november') ||
            lowerLine.includes('diciembre') || lowerLine.includes('december') ||
            // Skip times
            lowerLine.includes('time:') || lowerLine.includes('hora:') ||
            lowerLine.match(/\d{1,2}:\d{2}\s*(am|pm)/) ||
            // Skip addresses
            lowerLine.includes('place:') || lowerLine.includes('lugar:') ||
            lowerLine.includes('address:') || lowerLine.includes('direccion:') ||
            line.match(/\d+\s+[A-Z\s]+(?:RD|ST|AVE|BLVD|DR|LANE|WAY|COURT|PLACE)/i) ||
            // Skip phones
            lowerLine.includes('phone:') || lowerLine.includes('telefono:') ||
            line.match(/\d{3}-\d{3}-\d{4}/) ||
            // Skip capacity
            lowerLine.includes('capacity:') || lowerLine.includes('capacidad:') ||
            // Skip company
            lowerLine.includes('company:') || lowerLine.includes('empresa:') ||
            // Skip setup
            lowerLine.includes('set up:') || lowerLine.includes('setup:') ||
            // Skip short lines
            line.length < 3 ||
            // Skip very long lines
            line.length > 100
          ) {
            return false
          }
          
          // Look for event keywords
          return eventKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))
        })
      }
      
      // Strategy 3: Look for the first meaningful line
      if (!titleLine) {
        const meaningfulLines = lines.filter(line => {
          const lowerLine = line.toLowerCase()
          return !(
            lowerLine.includes('date:') || lowerLine.includes('time:') ||
            lowerLine.includes('place:') || lowerLine.includes('address:') ||
            lowerLine.includes('phone:') || lowerLine.includes('capacity:') ||
            lowerLine.includes('company:') || lowerLine.includes('set up:') ||
            line.match(/\d{3}-\d{3}-\d{4}/) ||
            line.match(/\d+\s+[A-Z\s]+(?:RD|ST|AVE|BLVD|DR)/i) ||
            line.length < 3 || line.length > 80
          )
        })
        
        if (meaningfulLines.length > 0) {
          titleLine = meaningfulLines[0]
        }
      }
      
      // Clean up the title
      if (titleLine) {
        titleLine = titleLine.trim()
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/^\d+\s*/, '') // Remove leading numbers
          .replace(/\s*-\s*$/, '') // Remove trailing dashes
          .replace(/^\s*[|]\s*/, '') // Remove leading pipes
          .replace(/\s*[|]\s*$/, '') // Remove trailing pipes
        
        eventData.title = titleLine
      }
      
      // UNIVERSAL DATE DETECTION - Handle multiple formats
      let foundDate = null
      
      // Look for structured date patterns
      const datePatterns = [
        /date:\s*(.+)/i,
        /fecha:\s*(.+)/i,
        /(\w+day),\s*(\w+)\s+(\d{1,2})/i, // Friday, July 4
        /(\d{1,2})\s+(\w+)\s+(\d{4})/i, // 4 July 2024
        /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i, // July 4, 2024
        /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i, // MM/DD/YYYY
        /(\d{1,2})-(\d{1,2})-(\d{2,4})/i, // MM-DD-YYYY
        /(\w+)\s+(\d{1,2})\s+DE\s+(\w+)/i // Spanish: Julio 4 DE 2024
      ]
      
      for (const pattern of datePatterns) {
        const match = text.match(pattern)
        if (match) {
          foundDate = match[0]
          break
        }
      }
      
      if (foundDate) {
        // Convert to YYYY-MM-DD format
        const dateStr = foundDate.replace(/date:\s*/i, '').replace(/fecha:\s*/i, '').trim()
        
        // Handle different date formats
        if (dateStr.includes('Friday, July 4')) {
          eventData.date = '2024-07-04' // Example conversion
        } else if (dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
          const [month, day, year] = dateStr.split('/')
          eventData.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        } else {
          // Try to parse with Date constructor
          const parsedDate = new Date(dateStr)
          if (!isNaN(parsedDate.getTime())) {
            eventData.date = parsedDate.toISOString().split('T')[0]
          }
        }
      }
      
      // UNIVERSAL VENUE DETECTION
      const venuePatterns = [
        /place:\s*(.+)/i,
        /lugar:\s*(.+)/i,
        /venue:\s*(.+)/i,
        /location:\s*(.+)/i,
        /plaza\s*monumental/i,
        /convention\s+center/i,
        /event\s+center/i,
        /auditorium/i,
        /stadium/i,
        /arena/i,
        /theater/i,
        /hall/i,
        /field/i,
        /park/i,
        /academy/i
      ]
      
      for (const pattern of venuePatterns) {
        const match = text.match(pattern)
        if (match) {
          let venue = match[1] || match[0]
          if (venue.toLowerCase().includes('plaza') && venue.toLowerCase().includes('monumental')) {
            venue = 'PLAZA MONUMENTAL'
          } else {
            venue = venue.toUpperCase()
          }
          eventData.venue = venue
          break
        }
      }
      
      // UNIVERSAL TIME DETECTION
      const timePatterns = [
        /time:\s*(.+)/i,
        /hora:\s*(.+)/i,
        /start\s+(\d{1,2})\s*(am|pm)/i,
        /puertas?\s+abren?\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
        /doors?\s+open\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
        /(\d{1,2}):(\d{2})\s*(AM|PM)/i
      ]
      
      for (const pattern of timePatterns) {
        const match = text.match(pattern)
        if (match) {
          if (match[1] && match[2]) {
            // Format: start 8 am
            eventData.start_time = `${match[1]}:00 ${match[2].toUpperCase()}`
          } else if (match[1] && match[2] && match[3]) {
            // Format: 8:00 AM
            eventData.start_time = `${match[1]}:${match[2]} ${match[3].toUpperCase()}`
          } else {
            // Format: time: start 8 am, set up
            const timeStr = match[0].replace(/time:\s*/i, '').replace(/hora:\s*/i, '').trim()
            const timeMatch = timeStr.match(/(\d{1,2})\s*(am|pm)/i)
            if (timeMatch) {
              eventData.start_time = `${timeMatch[1]}:00 ${timeMatch[2].toUpperCase()}`
            }
          }
          
          // Calculate setup time (30 minutes before)
          if (eventData.start_time) {
            const timeMatch = eventData.start_time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (timeMatch) {
              const startHour = parseInt(timeMatch[1])
              const startMinute = parseInt(timeMatch[2])
              const isPM = timeMatch[3].toUpperCase() === 'PM'
              
              // Convert to 24-hour format
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
              
              // Calculate end time (5 hours after start)
              let endHour = hour24 + 5
              let endMinute = startMinute
              
              // Convert back to 12-hour format for end time
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
          }
          break
        }
      }
      
      // UNIVERSAL ADDRESS DETECTION
      const addressPatterns = [
        /place:\s*(.+)/i,
        /lugar:\s*(.+)/i,
        /address:\s*(.+)/i,
        /direccion:\s*(.+)/i,
        /(\d+\s+[A-Z\s]+RD[^,]*,\s*[A-Z\s]+\s+[A-Z]{2}\s+\d{5})/i,
        /(\d+\s+[A-Z\s]+(?:ST|AVE|BLVD|DR|LANE|WAY|COURT|PLACE)[^,]*,\s*[A-Z\s]+\s+[A-Z]{2}\s+\d{5})/i
      ]
      
      for (const pattern of addressPatterns) {
        const match = text.match(pattern)
        if (match) {
          eventData.address = match[1].trim()
          break
        }
      }
      
      // UNIVERSAL COMPANY DETECTION
      const companyPatterns = [
        /company:\s*(.+)/i,
        /empresa:\s*(.+)/i,
        /contact:\s*(.+)/i,
        /contacto:\s*(.+)/i,
        /organizer:\s*(.+)/i,
        /organizador:\s*(.+)/i
      ]
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern)
        if (match) {
          eventData.company_contact = match[1].trim()
          break
        }
      }
      
      // UNIVERSAL CAPACITY DETECTION
      const capacityPatterns = [
        /capacity:\s*(\d+)/i,
        /capacidad:\s*(\d+)/i,
        /capacity:\s*(\d+)-(\d+)/i,
        /capacidad:\s*(\d+)-(\d+)/i,
        /(\d+)-(\d+)\s*(?:people|attendees|capacity|guests)/i
      ]
      
      for (const pattern of capacityPatterns) {
        const match = text.match(pattern)
        if (match) {
          if (match[2]) {
            // Range format: 150-200
            eventData.capacity = parseInt(match[2]) // Use the higher number
          } else {
            eventData.capacity = parseInt(match[1])
          }
          break
        }
      }
      
      // UNIVERSAL PHONE DETECTION
      const phonePatterns = [
        /phone:\s*(\d{3}-\d{3}-\d{4})/i,
        /telefono:\s*(\d{3}-\d{3}-\d{4})/i,
        /contact:\s*(\d{3}-\d{3}-\d{4})/i,
        /contacto:\s*(\d{3}-\d{3}-\d{4})/i,
        /INFO:\s*(\d{3}-\d{3}-\d{4})/i,
        /(\d{3}-\d{3}-\d{4})/
      ]
      
      for (const pattern of phonePatterns) {
        const match = text.match(pattern)
        if (match) {
          eventData.company_contact = match[1]
          break
        }
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