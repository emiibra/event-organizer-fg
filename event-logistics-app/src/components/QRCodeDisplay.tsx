'use client'
import { useQRCode } from '@/hooks/useQRCode'

interface QRCodeDisplayProps {
  eventId: string
  eventTitle: string
  showTitle?: boolean
  className?: string
}

export default function QRCodeDisplay({
  eventId,
  eventTitle,
  showTitle = true,
  className = ''
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

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        {showTitle && <h3 className="text-lg font-semibold">QR Code for Event Signup</h3>}
        <button
          onClick={showQRCode ? hideQRCode : generateQRCode}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Form URL:</h4>
        <p className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">{formUrl}</p>
        <p className="text-xs text-gray-500 mt-1">
          This URL will be encoded in the QR code. People can scan it to access the signup form.
        </p>
      </div>

      {showQRCode && qrCodeUrl && (
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-4">QR Code for {eventTitle}</h4>
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