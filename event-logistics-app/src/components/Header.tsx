'use client'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <div className="mb-6 bg-white text-black">
      {/* Main Title with Logo */}
      <div className="flex justify-between items-center mb-0">
        <h1 className="text-3xl font-bold text-black">Event Logistics Manager</h1>
        <img 
          src="/fry-goehring-logo.png" 
          alt="Fry | Goehring Logo" 
          className="h-25 w-auto"
        />
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex space-x-8">
          <button
            onClick={() => onTabChange('events')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => onTabChange('merchandising')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'merchandising'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Merchandising
          </button>
        </nav>
      </div>
    </div>
  )
}