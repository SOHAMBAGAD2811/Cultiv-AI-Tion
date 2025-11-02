import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// This 'assert' syntax is the key to helping Turbopack
import en from './locales/en/translation.json' assert { type: 'json' };
import mr from './locales/mr/translation.json' assert { type: 'json' };
import hi from './locales/hi/translation.json' assert { type: 'json' };

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mr: { translation: mr },
      hi: { translation: hi },
    },
    lng: 'mr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;