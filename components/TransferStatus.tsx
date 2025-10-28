import React, { useState } from 'react';
import { Transfer } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Button from './ui/Button';
import Input from './ui/Input';

interface TransferStatusProps {
  transfer: Transfer;
  onUpdateTransfer: (transfer: Transfer) => void;
  onHelpNeeded: (initialMessage: string) => void;
  onVerifyCode: (transferId: string, step: number, code: string) => Promise<boolean>;
  blockStepMessages: string[];
}

const TransferStatus: React.FC<TransferStatusProps> = ({ 
  transfer, 
  onUpdateTransfer, 
  onHelpNeeded, 
  onVerifyCode,
  blockStepMessages
}) => {
  const { t, language } = useLocalization();
  const [unlockCode, setUnlockCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const getProgressPercentage = (): number => {
    if (transfer.status === 'completed') return 100;
    if (transfer.status !== 'blocked' || transfer.blockedStep === 0) return 0;
    switch (transfer.blockedStep) {
      case 1: return 25;
      case 2: return 60;
      case 3: return 95;
      case 4: return 95;
      default: return 0;
    }
  };

  const percentage = getProgressPercentage();
  const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(amount);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isSuccess = await onVerifyCode(transfer.id, transfer.blockedStep, unlockCode);
    if (isSuccess) {
        setUnlockCode('');
    } else {
        setError(t('invalid_unlock_code'));
    }
    setIsLoading(false);
  };
  
  const handleGetCodeClick = () => {
    const message = t('initial_chat_message_for_code', {
        recipient: transfer.accountHolderName,
        amount: formatCurrency(transfer.amount)
    });
    onHelpNeeded(message);
  }

  return (
    <div className="space-y-4">
      <p className="text-lg">{t('transfer_to', { name: transfer.accountHolderName })} for <span className="font-bold">{formatCurrency(transfer.amount)}</span> {t('is_blocked')}</p>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-neutral">{t('processing')}</span>
          <span className="text-sm font-bold text-primary">{percentage}%</span>
        </div>
        <progress className="progress progress-primary w-full" value={percentage} max="100"></progress>
      </div>

      <div className="text-center p-3 bg-error/10 rounded-box border border-error/20">
        <p className="font-bold text-error">{blockStepMessages[transfer.blockedStep - 1] || `Step ${transfer.blockedStep}`}</p>
        {transfer.blockReason && (
             <div className="mt-2 text-left">
                <p className="font-bold text-sm text-neutral">{t('admin_custom_reason')}:</p>
                <p className="text-sm text-neutral-600 italic">"{transfer.blockReason}"</p>
            </div>
        )}
      </div>
      
      <div className="p-4 bg-base-200 rounded-box space-y-3">
        <p className="text-sm text-center">{t('unlock_code_prompt')}</p>
         <div className="flex justify-center">
            <Button variant="ghost" onClick={handleGetCodeClick}>{t('get_unlock_code')}</Button>
        </div>
        <form onSubmit={handleSubmitCode} className="flex items-start space-x-2">
            <div className="flex-grow">
                 <Input 
                    label={t('enter_unlock_code')}
                    id="unlock-code"
                    type="text"
                    value={unlockCode}
                    onChange={(e) => {
                      setUnlockCode(e.target.value);
                      setError('');
                    }}
                    required
                />
            </div>
            <Button type="submit" isLoading={isLoading} className="mt-9">{t('unlock_transfer')}</Button>
        </form>
        {error && <p className="text-error text-sm text-center">{error}</p>}
      </div>
    </div>
  );
};

export default TransferStatus;
