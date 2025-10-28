import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Transfer } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';

interface TransferFormProps {
  userId: number;
  onNewTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt' | 'status' | 'blockedStep'>) => void;
  closeModal: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ userId, onNewTransfer, closeModal }) => {
  const { t } = useLocalization();
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountHolderName || !accountNumber || !routingNumber || !reason) return;

    onNewTransfer({
      userId,
      amount: parseFloat(amount),
      accountHolderName,
      accountNumber,
      routingNumber,
      reason,
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('transfer_amount')}
        id="transfer-amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="100.00"
        required
      />
      <Input
        label={t('recipient_name')}
        id="recipient-name"
        type="text"
        value={accountHolderName}
        onChange={(e) => setAccountHolderName(e.target.value)}
        required
      />
      <Input
        label={t('account_number')}
        id="account-number"
        type="text"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        required
      />
      <Input
        label={t('routing_number')}
        id="routing-number"
        type="text"
        value={routingNumber}
        onChange={(e) => setRoutingNumber(e.target.value)}
        required
      />
      <Input
        label={t('reason')}
        id="transfer-reason"
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('transfer_reason_placeholder')}
        required
      />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
        <Button type="submit" variant="primary">{t('submit')}</Button>
      </div>
    </form>
  );
};

export default TransferForm;
