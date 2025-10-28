
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language } from '../types';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: Language.FR, name: 'Français', flag: '🇫🇷' },
    { code: Language.EN, name: 'English', flag: '🇬🇧' },
    { code: Language.ES, name: 'Español', flag: '🇪🇸' },
  ];

  const selectedLanguage = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-base-100 border border-base-300 rounded-md hover:bg-base-200"
        aria-label={t('select_language')}
      >
        <span>{selectedLanguage.flag}</span>
        <span className="hidden sm:inline text-sm font-medium text-neutral">{selectedLanguage.name}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-base-100 border border-base-300 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-neutral hover:bg-base-200"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
