import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json(
      { error: 'Location parameter is required' },
      { status: 400 }
    );
  }

  // Mock weather data based on location
  const mockWeatherData = {
    temperature: 25 + Math.random() * 5, // Random temperature between 25-30°C
    condition: 'Clear',
    description: 'clear sky',
    icon: '01d',
    location: location,
    humidity: 65,
    windSpeed: 3.5
  };

  return NextResponse.json(mockWeatherData);
}