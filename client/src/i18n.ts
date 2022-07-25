import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import 'intl-pluralrules';
import { initReactI18next } from 'react-i18next';
import { en } from './translations';

const resources = {
  en: {
    translation: en
  }
};

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    resources,
    //language to use if translations in user language are not available
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react!!
    }
  });

export default i18n;
