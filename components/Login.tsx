import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<User | null>;
  onNavigateToCreateAccount: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToCreateAccount }) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const user = await onLogin(email, password);
    if (!user) {
      setError(t('login_error_invalid_credentials'));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md" title={t('login_to_your_account')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <Input 
            label={t('email_address')}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email_placeholder')}
            required
          />
          <Input 
            label={t('password')}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" isLoading={isLoading} disabled={!email || !password}>
            {t('login')}
          </Button>
          <div className="text-center text-sm">
            <p className="text-neutral-500">
              {t('dont_have_account')}{' '}
              <button 
                type="button" 
                onClick={onNavigateToCreateAccount} 
                className="font-medium text-primary hover:underline focus:outline-none"
              >
                {t('create_account')}
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
