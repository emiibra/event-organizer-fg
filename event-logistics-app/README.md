# 🎯 Event Logistics Manager

A comprehensive full-stack event management platform that streamlines event planning, participant registration, and data analysis through an intuitive interface powered by AI and real-time updates.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3.0-green?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

## ✨ Features

### 🎨 Event Management
- **Create & Edit Events**: Intuitive form to add event details (title, date, venue, times, capacity, description)
- **AI-Powered Image Analysis**: Upload event flyers/posters and automatically extract details using Google Cloud Vision API
- **Smart Status Updates**: Events automatically categorize as Active, Completed, or Draft based on date and data completeness
- **Quick Actions**: Send event details via WhatsApp or copy to clipboard with one click

### 📱 Participant Registration
- **QR Code Generation**: Generate unique QR codes for each event
- **Real-time Signup**: Participants scan QR codes to register with their details
- **Participant Management**: View all registered attendees in real-time

### 🎰 Interactive Raffle System
- **Animated Wheel**: Custom SVG-based raffle wheel with smooth animations
- **Multiple Winners**: Select and track multiple winners (1st, 2nd, 3rd place, etc.)
- **Persistent Results**: Winners persist across page refreshes until manually reset

### 📊 Data Export
- **Excel Download**: Export participant data to CSV format
- **WhatsApp Sharing**: Share event summaries directly via WhatsApp (mobile & web optimized)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Custom hooks for QR codes, raffle logic, and data export

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time capabilities
- **Authentication** - Secure access control

### AI & External APIs
- **Google Cloud Vision API** - OCR and text extraction from images
- **Vertex AI (Gemini Pro Vision)** - Advanced image analysis

### Deployment & Tools
- **Vercel** - Hosting and CI/CD
- **QR Code Library** - Dynamic QR code generation
- **WhatsApp Integration** - Direct link sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud account (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/emiibra/event-organizer-fg.git
cd event-organizer-fg/event-logistics-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_ADMIN_KEY=your_admin_key
GOOGLE_CLOUD_API_KEY=your_gcp_api_key
```

4. **Run the development server**
```bash
npm rented dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
event-logistics-app/
├── src/
│ ├── app/ # Next.js pages and API routes
│ │ ├── api/ # API endpoints
│ │ │ ├── events/ # Event CRUD operations
│ │ │ ├── participants/ # Participant management
│ │ │ └── analyze-image/# AI image analysis
│ │ ├── form/[id]/ # Participant signup form
│ │ ├── team/[id]/ # Team management view
│ │ └── page.tsx # Home page
│ ├── components/ # React components
│ │ ├── EventDetail.tsx # Event detail modal
│ │ ├── EventForm.tsx # Create/edit event form
│ │ ├── QRCodeDisplay.tsx # QR code generator
│ │ ├── SVGWheel.tsx # Raffle wheel component
│ │ └── Header.tsx # Navigation header
│ ├── hooks/ # Custom React hooks
│ │ ├── useQRCode.ts # QR code logic
│ │ ├── useRaffle.ts # Raffle functionality
│ │ └── useExcelExport.ts # Data export
│ └── lib/ # Utilities
│ └── supabase.ts # Supabase client
├── public/ # Static assets
└── .env.local # Environment variables




## 🎯 Key Features Explained

### AI Image Analysis
Upload an event flyer image, and the AI automatically extracts:
- Event title
- Date and time
- Venue and address
- Estimated capacity
- Contact information

### Real-time Updates
Built on Supabase's real-time capabilities, participant lists update instantly as people register.

### Mobile-Optimized
Responsive design ensures a seamless experience on desktop, tablet, and mobile devices.

## 🔒 Security
- Environment variables for sensitive data
- Service role keys restricted to server-side operations
- Secure API authentication

## 🤝 Contributing
Contributions are welcome! Please open an issue first to discuss any changes.

## 📄 License
This project is licensed under the MIT License.

## 🌟 Live Demo
🚀 [It has private info so no available]

## 👤 Author
**Emilia Bravo**
- GitHub: [@emiibra](https://github.com/emiibra)

---


