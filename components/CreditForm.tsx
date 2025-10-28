
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { CreditRequest } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';

interface CreditFormProps {
  userId: number;
  onNewCreditRequest: (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => void;
  closeModal: () => void;
}

const CreditForm: React.FC<CreditFormProps> = ({ userId, onNewCreditRequest, closeModal }) => {
  const { t } = useLocalization();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) return;

    onNewCreditRequest({
      userId,
      amount: parseFloat(amount),
      reason,
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input 
          label={t('credit_amount')}
          id="credit-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5000"
          required
        />
      </div>
      <div>
        <Input 
          label={t('reason')}
          id="credit-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('credit_reason_placeholder')}
          required
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
        <Button type="submit" variant="primary">{t('submit')}</Button>
      </div>
    </form>
  );
};

export default CreditForm;
