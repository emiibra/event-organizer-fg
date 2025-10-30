'use client'
import { useQRCode } from '@/hooks/useQRCode'
import Image from 'next/image' 

interface QRCodeDisplayProps {
  eventId: string
  eventTitle: string
  showTitle?: boolean
  className?: string
  raffleItem?: string
}

export default function QRCodeDisplay({
  eventId,
  eventTitle,
  showTitle = true,
  className = '',
  raffleItem = ''
}: QRCodeDisplayProps) {
  const {
    qrCodeUrl,
    isGenerating,
    showQRCode,
    generateQRCode,
    hideQRCode,
    downloadQRCode,
    copyURL
  } = useQRCode(eventId)

  const formUrl =
    `${typeof window !== 'undefined' ? window.location.origin : ''}/form/${eventId}`

    // generate a PDF poster similar to your screenshot
    const downloadPrintPoster = async () => {
      try {
        if (!qrCodeUrl) {
          await generateQRCode()
          await new Promise(r => setTimeout(r, 50))
          if (!qrCodeUrl) return
        }
    
        const { jsPDF } = await import('jspdf')
    
        // Helper: fit text to width without stretching
        const fitFontSize = (doc: InstanceType<typeof jsPDF>, text: string, base: number, maxWidth: number) => {
          doc.setFontSize(base)
          const w = doc.getTextWidth(text)
          return w > maxWidth ? Math.max(40, Math.floor((base * maxWidth) / w)) : base
        }
    
        const doc = new jsPDF({ unit: 'pt', format: 'letter' })
        const pageW = doc.internal.pageSize.getWidth()
        const pageH = doc.internal.pageSize.getHeight()
    
        // Solid blue background (no lines)
        doc.setFillColor(58, 121, 190) // softer blue (or try even lighter)
        doc.rect(0, 0, pageW, pageH, 'F')

        //EVENT NAME
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)             // very small
        const titleMaxW = pageW - 100
        doc.text(eventTitle || '', pageW / 2, 10, { align: 'center', maxWidth: titleMaxW })
        
        // Optional thin border
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(2)
        doc.rect(24, 24, pageW - 48, pageH - 48)
    
        // Text styling
        doc.setTextColor(210, 235, 255)
        doc.setFont('helvetica', 'bold')
    
        const marginX = 70
        const maxTextW = pageW - marginX * 2
    
        // PARTICIPATE IN A
        const topY = 120
        const line1 = 'PARTICIPATE IN A'
        doc.setFontSize(fitFontSize(doc, line1, 40, maxTextW))
        doc.text(line1, pageW / 2, topY, { align: 'center', maxWidth: maxTextW })
    
        // Raffle item
        const item = (raffleItem || 'GIVEAWAY').trim().toUpperCase()
        const itemY = topY + 110
        doc.setFontSize(fitFontSize(doc, item, 110, maxTextW))
        doc.text(item, pageW / 2, itemY, { align: 'center', maxWidth: maxTextW })
    
        // GIVEAWAY
        const gY = itemY + 95
        const gw = 'GIVEAWAY'
        doc.setFontSize(fitFontSize(doc, gw, 110, maxTextW))
        doc.text(gw, pageW / 2, gY, { align: 'center', maxWidth: maxTextW })
    
        // QR frame (larger))

        const qrBox = 320
        const qx = (pageW - qrBox) / 2
        const qy = gY + 60
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(qx - 18, qy - 18, qrBox + 36, qrBox + 36, 14, 14, 'F')
    
        // QR image
        doc.addImage(qrCodeUrl, 'PNG', qx, qy, qrBox, qrBox)
    

        const safeTitle = eventTitle.replace(/\s+/g, '_')
        const safeItem = item.replace(/\s+/g, '_')
        doc.save(`poster_${safeTitle}_${safeItem}.pdf`)
      } catch {
        alert('Failed to generate PDF. Please try again.')
      }
    }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        {showTitle && <h3 className="text-lg font-semibold">QR Code for Event Signup</h3>}
        <div className="flex gap-2">
        <button
          onClick={showQRCode ? hideQRCode : generateQRCode}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
          {/* Download Print PDF */}
        <button
            onClick={downloadPrintPoster}
            disabled={isGenerating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400"
            title="Download printable poster PDF"
          >
            Download Print
        </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Form URL:</h4>
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-mono bg-white p-2 rounded border break-all text-blue-600 hover:text-blue-700 underline"
        >
          {formUrl}
        </a>
        <p className="text-xs text-gray-500 mt-1">
          This URL will be encoded in the QR code. People can scan it to access the signup form.
        </p>
      </div>

      {showQRCode && qrCodeUrl && (
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-4">QR Code for {eventTitle}</h4>
          <Image
            src={qrCodeUrl}
            alt={`QR code for ${eventTitle}`}
            width={256}
            height={256}
            className="mx-auto w-64 h-64 rounded border"
          />
          <p className="text-sm text-gray-600 mt-4">
            Print this QR code or display it on a screen at your event
          </p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => downloadQRCode(eventTitle)}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Download QR Code
            </button>
            <button
              onClick={copyURL}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}