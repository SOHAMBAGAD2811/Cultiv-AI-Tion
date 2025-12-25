# Cultiv-AI-tion

An intelligent farming assistant application built with Next.js that helps farmers make informed decisions through AI-powered insights, weather monitoring, community knowledge sharing, and interactive educational content.

## Features

- 🤖 AI-powered farming assistant using Gemini API
  - Get crop recommendations
  - Disease identification help
  - Best practices for cultivation
  - Seasonal planning assistance
- 🌍 Real-time weather forecasting for agricultural planning
- 📚 Interactive learning path with videos and AI-powered quizzes
  - 31 educational videos covering irrigation, soil health, pest control, and more
  - 3 MCQ questions per video with AI-generated feedback
  - Track quiz attempts and view progress statistics
- 👨‍🌾 Farmer community platform for knowledge sharing
- 🌐 Multi-language support (English, Hindi, Marathi) for local farmers
- 📊 Agricultural analytics dashboard
- 🤝 Connect with agricultural experts
- 🔐 Secure user profiles via Supabase

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

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features Guide

### Learning Path & Quizzes
Navigate to `/learning-path` to access:
- **31 educational videos** on farming topics:
  - Irrigation systems (drip, sprinkler, moisture sensors)
  - Soil health (cover crops, composting, crop rotation)
  - Pest management (IPM, beneficial insects, neem oil)
  - And more...
  
- **Interactive quizzes** for each video:
  - 3 multiple-choice questions per video
  - Get instant feedback powered by Gemini AI
  - View explanations for incorrect answers
  - Track your progress across all videos

### Quiz System
- Click the green "Quiz" button on any video card
- Answer questions one per screen
- Get AI-powered feedback explaining why answers are correct or incorrect
- View your score and detailed results
- Quiz attempts are securely stored in Supabase

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js application source
  - `/api` - API routes including weather, chat, and quiz evaluation endpoints
  - `/components` - Reusable UI components including QuizModal
  - `/lib` - Utility functions including Supabase quiz functions
  - `/locales` - Internationalization files
  - `/utils` - Helper functions
  - `/learning_path` - Learning path page with quiz integration
    - `page.tsx` - Main learning path page
    - `quizzes.json` - Pre-defined quiz questions (48 total questions)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for the web application
- [Google Gemini API](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini) - AI for crop insights and quiz feedback
- [Supabase](https://supabase.com/) - Authentication, database for quiz attempts, and community features
- [i18next](https://www.i18next.com/) - Localization for regional language support
- [OpenWeather API](https://openweathermap.org/) - Agricultural weather forecasting
- [Tailwind CSS](https://tailwindcss.com/) - Responsive and accessible UI design
- [React](https://reactjs.org/) - Interactive user interface components
- [Lucide React](https://lucide.dev/) - Icon library

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
