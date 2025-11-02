import { WeatherData } from '../components/Header';

export interface Recommendation {
  pest: {
    title: string;
    description: string;
  };
  seasonal: {
    title: string;
    description: string;
  };
}

/**
 * Determines the current agricultural season in India.
 * Kharif: June - October
 * Rabi: November - April
 * Zaid: May (considered part of Rabi for simplicity here)
 * @returns 'kharif' or 'rabi'
 */
function getCurrentSeason(): 'kharif' | 'rabi' {
  const month = new Date().getMonth(); // 0 (Jan) to 11 (Dec)
  if (month >= 5 && month <= 9) {
    // June to October
    return 'kharif';
  } else {
    // November to May
    return 'rabi';
  }
}

export function getRecommendations(
  weatherData: WeatherData | null,
): Recommendation {
  const condition = weatherData?.condition.toLowerCase() || 'default';
  const season = getCurrentSeason();

  // Determine the correct translation key suffix based on weather
  let keySuffix = 'default';
  if (condition.includes('rain')) keySuffix = 'rainy';
  else if (condition.includes('clear')) keySuffix = 'clear';
  else if (condition.includes('clouds')) keySuffix = 'cloudy';

  // Return full translation keys
  return {
    pest: {
      title: 'pest_title',
      description: `pest_desc_${season}_${keySuffix}`, // e.g., "pest_desc_rabi_cloudy"
    },
    seasonal: {
      title: 'fertilizer_title',
      description: `seasonal_task_${season}_${keySuffix}`, // e.g., "seasonal_task_rabi_cloudy"
    },
  };
}