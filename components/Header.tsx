import React from 'react';
import { User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import LanguageSelector from './LanguageSelector';
import Button from './ui/Button';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { t } = useLocalization();

  return (
    <header className="navbar bg-base-100 shadow-sm px-4 md:px-8">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl text-primary font-bold">USALLI BANK</a>
      </div>
      <div className="flex-none gap-4">
        <LanguageSelector />
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-neutral">{t('welcome_user', { name: user.name })}</span>
            <Button onClick={onLogout} size="sm" variant="primary" className="btn-outline">{t('logout')}</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
