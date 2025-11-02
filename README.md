# Cultiv-AI-tion

An intelligent farming assistant application built with Next.js that helps farmers make informed decisions through AI-powered insights, weather monitoring, and community knowledge sharing.

## Features

- 🤖 AI-powered farming assistant using Gemini API
  - Get crop recommendations
  - Disease identification help
  - Best practices for cultivation
  - Seasonal planning assistance
- 🌍 Real-time weather forecasting for agricultural planning
- 👨‍🌾 Farmer community platform for knowledge sharing
- 🌐 Multi-language support (English, Hindi, Marathi) for local farmers
- 📊 Agricultural analytics dashboard
- 🤝 Connect with agricultural experts
- 🔐 Secure user profiles via Supabase

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Platform account for Gemini API
- Supabase account for authentication

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI Assistant Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro  # or your preferred model

# Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Weather API (for agricultural forecasting)
WEATHER_API_KEY=your_weather_api_key
```

The AI assistant is configured with agricultural domain knowledge to provide:
- Crop recommendations based on soil and weather conditions
- Disease identification from descriptions or images
- Sustainable farming practices
- Season-specific agricultural advice

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

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js application source
  - `/api` - API routes including weather and chat endpoints
  - `/components` - Reusable UI components
  - `/lib` - Utility functions and shared logic
  - `/locales` - Internationalization files
  - `/utils` - Helper functions

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for the web application
- [Google Gemini API](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini) - AI model trained to provide agricultural insights
- [Supabase](https://supabase.com/) - Authentication and farmer community database
- [i18next](https://www.i18next.com/) - Localization for regional language support
- [Weather API](https://weatherapi.com/) - Agricultural weather forecasting
- [Tailwind CSS](https://tailwindcss.com/) - Responsive and accessible UI design
- [React](https://reactjs.org/) - Interactive user interface components

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
