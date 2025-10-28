import React, { useState, useEffect } from 'react';
import { User, Transfer, CreditRequest, ChatMessage, ChatMessageSender } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import TransferForm from './TransferForm';
import CreditForm from './CreditForm';
import TransferStatus from './TransferStatus';
import ChatWindow from './ChatWindow';

interface ClientDashboardProps {
  user: User;
  transfers: Transfer[];
  creditRequests: CreditRequest[];
  onNewTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt' | 'status' | 'blockedStep'>) => void;
  onNewCreditRequest: (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateTransfer: (transfer: Transfer) => void;
  onVerifyCode: (transferId: string, step: number, code: string) => Promise<boolean>;
  blockStepMessages: string[];
  chatSession: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  transfers,
  creditRequests,
  onNewTransfer,
  onNewCreditRequest,
  onUpdateTransfer,
  onVerifyCode,
  blockStepMessages,
  chatSession,
  onSendMessage,
}) => {
  const { t, language } = useLocalization();
  console.log("✅ ClientDashboard mounted");
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [isCreditModalOpen, setCreditModalOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transfers');

  // 🔍 Debug global — pour voir toutes les données reçues
  useEffect(() => {
    console.log("🔍 ClientDashboard mounted");
    console.log("User:", user);
    console.log("Transfers:", transfers);
    console.log("Credit Requests:", creditRequests);
  }, [user, transfers, creditRequests]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr: Date | string | null | undefined) => {
  console.log("🕓 [ClientDashboard] Formatting date:", dateStr);

  // 1️⃣ Si la valeur est totalement absente
  if (!dateStr) {
    console.warn("⚠️ Missing date value");
    return "—";
  }

  // 2️⃣ Si c’est une chaîne vide, "undefined", ou "Invalid Date"
  if (
    typeof dateStr === "string" &&
    (dateStr.trim() === "" || dateStr === "undefined" || dateStr === "Invalid Date")
  ) {
    console.warn("⛔ Invalid date string:", dateStr);
    return "—";
  }

  // 3️⃣ Si c’est déjà un objet Date
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) {
      console.warn("⛔ Invalid Date object:", dateStr);
      return "—";
    }
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(dateStr);
  }

  // 4️⃣ Tentative de conversion
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn("⛔ Conversion failed for date:", dateStr);
    return "—";
  }

  // 5️⃣ Formatage réussi
  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};



  const handleHelpNeeded = (initialMessage: string) => {
    setChatOpen(true);
    handleUserSendMessage(initialMessage);
  };

  const handleUserSendMessage = (text: string) => {
    const userMessage: ChatMessage = { sender: ChatMessageSender.USER, text };
    onSendMessage(userMessage);
  };

  const renderTransferItem = (transfer: Transfer) => {
    const isBlocked = transfer.status === 'blocked';
    return (
      <li key={transfer.id} className={`p-4 rounded-lg ${isBlocked ? 'bg-error/10' : 'bg-base-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-neutral">{t('transfer_to', { name: transfer.accountHolderName })}</p>
            <p className="text-sm text-neutral-500">{formatDate(transfer.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${isBlocked ? 'text-error' : 'text-neutral'}`}>
              {formatCurrency(transfer.amount)}
            </p>
            <p
              className={`text-sm font-semibold capitalize badge ${
                isBlocked
                  ? 'badge-error'
                  : transfer.status === 'completed'
                  ? 'badge-success'
                  : 'badge-ghost'
              }`}
            >
              {t(transfer.status)}
            </p>
          </div>
        </div>
        {isBlocked && (
          <div className="mt-4">
            <div className="collapse collapse-arrow border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-sm font-medium">{t('action_required')}</div>
              <div className="collapse-content">
                <TransferStatus
                  transfer={transfer}
                  onUpdateTransfer={onUpdateTransfer}
                  onHelpNeeded={handleHelpNeeded}
                  onVerifyCode={onVerifyCode}
                  blockStepMessages={blockStepMessages}
                />
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  const renderCreditRequestItem = (request: CreditRequest) => (
    <li key={request.id} className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
      <div>
        <p className="font-semibold text-neutral">{t('credit_request')}</p>
        <p className="text-sm text-neutral-500">{formatDate(request.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-neutral">{formatCurrency(request.amount)}</p>
        <p
          className={`text-sm font-semibold capitalize badge ${
            request.status === 'approved'
              ? 'badge-success'
              : request.status === 'rejected'
              ? 'badge-error'
              : 'badge-ghost'
          }`}
        >
          {t(request.status)}
        </p>
      </div>
    </li>
  );

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral">
              {t('welcome_user', { name: user.name })}
            </h1>
            <p className="text-neutral-500">{t('your_dashboard_summary')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">{t('available_balance')}</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(user.balance)}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => setTransferModalOpen(true)} className="flex-1">
          {t('new_transfer')}
        </Button>
        <Button onClick={() => setCreditModalOpen(true)} variant="secondary" className="flex-1">
          {t('request_credit')}
        </Button>
      </div>

      <Card title={t('recent_activity')}>
        <div role="tablist" className="tabs tabs-bordered mb-4">
          <a
            role="tab"
            className={`tab ${activeTab === 'transfers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            {t('transfers')}
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === 'credits' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            {t('credit_requests')}
          </a>
        </div>

        {activeTab === 'transfers' && (
          <ul className="space-y-4">
            {transfers.length > 0 ? (
              transfers.map(renderTransferItem)
            ) : (
              <p className="text-center p-4">{t('no_transfers_found')}</p>
            )}
          </ul>
        )}

        {activeTab === 'credits' && (
          <ul className="space-y-4">
            {creditRequests.length > 0 ? (
              creditRequests.map(renderCreditRequestItem)
            ) : (
              <p className="text-center p-4">{t('no_credit_requests_found')}</p>
            )}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title={t('new_transfer')}
      >
        <TransferForm
          userId={user.id}
          onNewTransfer={onNewTransfer}
          closeModal={() => setTransferModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        title={t('request_credit')}
      >
        <CreditForm
          userId={user.id}
          onNewCreditRequest={onNewCreditRequest}
          closeModal={() => setCreditModalOpen(false)}
        />
      </Modal>

      {/* Chat Window */}
      {!isChatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 btn btn-primary btn-circle btn-lg shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
          <Card className="!p-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">{t('chat_with_support')}</h3>
              <Button size="sm" variant="ghost" className="!p-1" onClick={() => setChatOpen(false)}>
                ✕
              </Button>
            </div>
            <ChatWindow messages={chatSession} onSendMessage={handleUserSendMessage} isLoading={false} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
