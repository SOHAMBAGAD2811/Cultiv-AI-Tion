"use client";

import { useState }from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase';
import Link from 'next/link';
import { Loader2, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmBbox, setFarmBbox] = useState<number[] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationMessage, setLocationMessage] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationMessage('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const radius = 0.01; // Approx. 1.1km radius to create a bounding box
        const bbox = [
          longitude - radius,
          latitude - radius,
          longitude + radius,
          latitude + radius,
        ];
        setFarmBbox(bbox);
        setLocationStatus('success');
        setLocationMessage('Location captured successfully! You can now sign up.');
      },
      (error) => {
        setLocationStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. Please enable it in your browser settings to use this feature.');
        } else {
          setLocationMessage('Could not get your location. Please try again or enter it manually.');
        }
      }
    );
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningUp(true);
    setSignupError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          farm_location: farmLocation,
          farm_bbox: farmBbox,         // The coordinates
        },
      },
    });

    if (error) {
      setSignupError(error.message);
    } else {
      // Redirect user to check their email for confirmation
      router.push('/confirm-email');
    }
    setIsSigningUp(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create an Account</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Farm City/Region (e.g., Pune)"
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="border-t pt-4 space-y-3">
             <p className="text-sm text-center text-gray-600">For satellite imagery, please provide your farm's location.</p>
             <button
              type="button"
              onClick={handleGetLocation}
              disabled={locationStatus === 'loading'}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {locationStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
              Use My Current Location
            </button>
            {locationMessage && <div className={`text-xs p-2 rounded-md flex items-center gap-2 ${locationStatus === 'success' ? 'bg-green-100 text-green-800' : ''} ${locationStatus === 'error' ? 'bg-red-100 text-red-800' : ''} ${locationStatus === 'loading' ? 'bg-blue-100 text-blue-800' : ''}`}>
              {locationStatus === 'success' && <CheckCircle className="h-4 w-4" />}
              {locationStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
              {locationMessage}
            </div>}
          </div>

          <button
            type="submit"
            disabled={isSigningUp || locationStatus === 'loading'}
            className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            {isSigningUp ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Sign Up'}
          </button>
          {signupError && <p className="text-sm text-center text-red-600">{signupError}</p>}
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-green-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}