# Cultiv-AI-tion

An intelligent farming assistant application built with Next.js that helps farmers make informed decisions through AI-powered insights, weather monitoring, community knowledge sharing, and interactive educational content.

## Features

- 🤖 AI-powered farming assistant using Gemini 2.5 Flash API
  - Get crop recommendations
  - Disease identification help
  - Best practices for cultivation
  - Seasonal planning assistance
  - Real-time chatbot support with agricultural expertise

- 🌍 Real-time weather forecasting for agricultural planning
  - Location-based weather updates
  - Humidity and wind speed monitoring
  - Weather-aware farming insights

- 📚 Interactive learning path with 31 educational videos and AI-powered quizzes
  - Comprehensive video library covering irrigation, soil health, pest control, and more
  - 3 MCQ questions per video with instant AI-generated feedback
  - One-question-per-screen quiz interface for better focus
  - Track quiz attempts and view progress statistics
  - Intelligent feedback explaining correct/incorrect answers

- 📊 Advanced Agricultural Analytics Dashboard
  - Comprehensive business analytics with revenue, expenses, and profit tracking
  - AI-powered insights using Gemini API for actionable recommendations
  - Health status indicators (Good/Warning/Critical)
  - Business recommendations for profitability improvement
  - Concerns and opportunities analysis
  - Multiple time range filters (All Time, This Month, Last Month, Quarterly, Financial Year)
  - Inventory, sales, and expense management
  - Data export functionality (CSV)
  - Supabase-backed secure data storage

- 👨‍🌾 Farmer community platform for knowledge sharing
  - Connect with other farmers
  - Share farming experiences and best practices
  - Ask questions and get community support

- 🌐 Multi-language support (English, Hindi, Marathi) for local farmers
  - Seamless localization across the application
  - Regional language support for better accessibility

- 🤝 Connect with agricultural experts
  - Direct expert consultation through chatbot
  - Personalized guidance based on your farm situation

- 🔐 Secure user profiles via Supabase
  - Authentication and authorization
  - User profile management
  - Email verification
  - Secure data storage

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Platform account for Gemini API
- Supabase account for authentication and database

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI Assistant Configuration
GOOGLE_API_KEY=your_gemini_api_key

# Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Weather API (for agricultural forecasting)
OPENWEATHER_API_KEY=your_weather_api_key
```

The AI assistant is configured with agricultural domain knowledge to provide:
- Crop recommendations based on soil and weather conditions
- Disease identification from descriptions or images
- Sustainable farming practices
- Season-specific agricultural advice
- Quiz feedback and educational explanations

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up Supabase database for quiz feature:
   - Go to your Supabase dashboard
   - Run the SQL from `supabase/migrations/quiz_schema.sql` in the SQL editor
   - This creates the `quiz_attempts` table for tracking quiz progress
5. Set up Storage Buckets:
   - Go to the SQL editor in Supabase
   - Run the SQL from `supabase/migrations/storage_setup.sql`
   - This creates the `avatars` and `analytics-data` buckets with correct permissions

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features Guide

### Dashboard Home
Navigate to `/dashboard` to see:
- **Weather Overview**: Real-time weather conditions for your farm location with humidity and wind speed
- **Business Analytics Chart**: Quick view of your sales, expenses, and profit trends
- **Learning Resources**: Featured educational videos to expand your farming knowledge
- **Farm Insights**: Quick tips on weather awareness, pest management, and soil health
- **Expert Connection**: Direct access to agricultural experts via chatbot

### Learning Path & Quizzes
Navigate to `/learning_path` to access:
- **31 educational videos** on farming topics:
  - Irrigation systems (drip, sprinkler, moisture sensors)
  - Soil health (cover crops, composting, crop rotation)
  - Pest management (IPM, beneficial insects, neem oil)
  - Crop selection and seasonal planning
  - And more...
  
- **Interactive quizzes** for each video:
  - 3 multiple-choice questions per video
  - Get instant feedback powered by Gemini AI
  - View explanations for incorrect answers
  - Track your progress across all videos
  - Quiz attempts securely stored in Supabase

### Quiz System
- Click the green "Quiz" button on any video card
- Answer questions one per screen for focused learning
- Get AI-powered feedback explaining why answers are correct or incorrect
- View your score and detailed results
- Quiz attempts are securely stored in Supabase
- Review your quiz history and progress

### Agricultural Analytics Dashboard
Navigate to `/analytics` for comprehensive business management:
- **Data Management**:
  - Track inventory (crops, quantities, units)
  - Record sales transactions (crop, quantity, price, total)
  - Log expenses (category, amount, date)
  - Edit or delete any records
  
- **Financial Insights**:
  - Real-time calculations of total revenue, expenses, and net profit
  - Profit margin percentage analysis
  - Business health status indicators (Good/Warning/Critical)
  
- **AI-Powered Business Analysis**:
  - Click "Generate Insights" to get AI recommendations using Gemini API
  - Get actionable recommendations for improving profitability
  - Identify potential concerns and opportunities
  - Understand top-performing crops and major expense categories
  
- **Time Range Filters**:
  - View data for: All Time, This Month, Last Month, Current Quarter, Last Quarter, Current Financial Year
  - Dynamic chart updates based on selected time range
  
- **Data Operations**:
  - Export data to CSV for record-keeping
  - Reset all data with confirmation
  - Automatic data persistence to Supabase

### Chatbot
Navigate to `/chatbot` to:
- Chat with AI agricultural expert
- Get instant answers to farming questions
- Receive personalized recommendations
- Learn about best practices in real-time

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js application source
  - `/api` - API routes:
    - `/weather` - Real-time weather data endpoint
    - `/chat` - Chatbot API with Gemini integration
    - `/evaluate-quiz` - Quiz evaluation with AI feedback
    - `/analytics-insights` - AI business analytics endpoint
  - `/components` - Reusable UI components:
    - `QuizModal.tsx` - Interactive quiz component
    - `Header.tsx` - Navigation header
    - `Sidebar.tsx` - Navigation sidebar
    - `ProfilePictureUpload.tsx` - Profile image uploader with preview
    - `/ui` - Base UI components (button, input, select, textarea)
  - `/lib` - Utility functions and database operations
    - `supabase-quiz.ts` - Quiz-related database functions
    - `utils.ts` - General utilities
  - `/locales` - Internationalization files (EN, HI, MR)
  - `/utils` - Helper functions and Supabase client
  - `/dashboard` - Home dashboard page
  - `/analytics` - Business analytics and insights page
  - `/learning_path` - Learning path with video and quiz integration
    - `page.tsx` - Main learning path page
    - `quizzes.json` - 48 pre-defined quiz questions (3 per video)
  - `/chatbot` - AI chatbot page
  - `/community` - Community knowledge sharing
  - `/profile` - User profile management
  - `/signin`, `/signup`, `/forgot-password`, `/reset-password` - Authentication pages

## Technologies Used

- **Frontend Framework**:
  - [Next.js 16](https://nextjs.org/) - React framework with App Router
  - [React 19](https://reactjs.org/) - UI component library
  - [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

- **AI & LLM**:
  - [Google Gemini 2.5 Flash API](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini) - Advanced AI for chatbot, quiz feedback, and analytics insights

- **Backend & Database**:
  - [Supabase](https://supabase.com/) - PostgreSQL database, authentication, and storage
  - [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - Server-side endpoints

- **Styling & UI**:
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Lucide React](https://lucide.dev/) - Icon library for beautiful UI icons
  - [Recharts](https://recharts.org/) - React charting library for analytics visualization

- **Internationalization**:
  - [i18next](https://www.i18next.com/) - Multi-language support (English, Hindi, Marathi)

- **External APIs**:
  - [OpenWeather API](https://openweathermap.org/) - Real-time weather data

- **Database & ORM**:
  - [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) - Supabase client library

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is proprietary software.

## Support

For support, please open an issue in the repository.
