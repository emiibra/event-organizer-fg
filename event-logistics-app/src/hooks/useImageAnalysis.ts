import { useState } from 'react'

interface ExtractedEventData {
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

interface UseImageAnalysisReturn {
  isAnalyzing: boolean
  analyzeImage: (file: File) => Promise<ExtractedEventData>
  clearAnalysis: () => void
}

export function useImageAnalysis(): UseImageAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeImage = async (file: File): Promise<ExtractedEventData> => {
    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }
      
      const extractedData = await response.json()
      return extractedData
    } catch (error) {
      console.error('Error analyzing image:', error)
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAnalysis = () => {
    setIsAnalyzing(false)
  }

  return {
    isAnalyzing,
    analyzeImage,
    clearAnalysis
  }
}