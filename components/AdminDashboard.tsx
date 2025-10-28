import React, { useState } from 'react';
import { Transfer, CreditRequest, User, ChatMessage, ChatMessageSender } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import ChatWindow from './ChatWindow';

interface AdminDashboardProps {
  users: User[];
  transfers: Transfer[];
  creditRequests: CreditRequest[];
  onUpdateTransfer: (transfer: Transfer) => void;
  onUpdateCreditRequest: (request: CreditRequest) => void;
  onGenerateCode: (transferId: string, step: number) => Promise<string>;
  blockStepMessages: string[];
  onUpdateBlockStepMessages: (messages: string[]) => void;
  chatSessions: Record<number, ChatMessage[]>;
  onSendMessage: (userId: number, message: ChatMessage) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users,
  transfers, 
  creditRequests,
  onUpdateTransfer,
  onUpdateCreditRequest,
  onGenerateCode,
  blockStepMessages,
  onUpdateBlockStepMessages,
  chatSessions,
  onSendMessage
}) => {
  console.log("✅ AdminDashboard loaded");
  console.log("📦 Props:", { users, transfers, creditRequests, chatSessions });

  const { t, language } = useLocalization();
  console.log("✅ AdminDashboard mounted");
  const [activeTab, setActiveTab] = useState('transfers');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentBlockMessages, setCurrentBlockMessages] = useState(blockStepMessages);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isChatLoading, setChatLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '—';
    return new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: Date | string | null | undefined) => {
  try {
    console.log("🕒 Formatting date:", dateStr);

    // si la valeur est nulle, vide ou non définie
    if (!dateStr || dateStr === "Invalid Date") return "—";

    const date = new Date(dateStr);

    // si la date est invalide (ex: NaN, string vide, etc)
    if (isNaN(date.getTime())) {
      console.warn("⛔ Invalid date detected:", dateStr);
      return "—";
    }

    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    console.error("💥 Error while formatting date:", dateStr, error);
    return "—";
  }
};


  const getUserName = (userId: number) => users.find(u => u.id === userId)?.name || 'Unknown User';
  
  const handleOpenTransferModal = (transfer: Transfer) => {
    console.log("📂 Opening transfer modal for:", transfer);
    setSelectedTransfer(transfer);
    setCustomReason(transfer.blockReason || '');
    setGeneratedCode('');
  };

  const handleCloseTransferModal = () => {
    console.log("❌ Closing transfer modal");
    setSelectedTransfer(null);
  };
  
  const handleSaveReason = () => {
    if(selectedTransfer) {
      console.log("💾 Saving block reason:", customReason);
      onUpdateTransfer({...selectedTransfer, blockReason: customReason });
      handleCloseTransferModal();
    }
  };
  
  const handleGenerateCodeClick = async () => {
    if(selectedTransfer) {
      console.log("🔐 Generating code for:", selectedTransfer.id);
      const code = await onGenerateCode(selectedTransfer.id, selectedTransfer.blockedStep);
      console.log("✅ Code generated:", code);
      setGeneratedCode(code);
    }
  };

  const handleSaveSettings = () => {
    console.log("⚙️ Saving settings:", currentBlockMessages);
    onUpdateBlockStepMessages(currentBlockMessages);
    alert('Settings saved!');
  };
  
  const handleAdminSendMessage = (text: string) => {
    if(activeChatUser) {
      console.log("💬 Sending message to user:", activeChatUser.id, text);
      onSendMessage(activeChatUser.id, { sender: ChatMessageSender.ADMIN, text });
    }
  };

  const renderTable = (data: any[], columns: any[]) => {
    console.log("📊 Rendering table with", data.length, "items");
    return (
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="hover">
                {columns.map(col => (
                  <td key={`${item.id}-${col.key}`}>{col.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
         {data.length === 0 && <p className="text-center p-4">{t('no_transfers_found')}</p>}
      </div>
    );
  };

  console.log("✅ Ready to render AdminDashboard");
  console.log("Transfers data:", transfers);
  console.log("Credit requests data:", creditRequests);
  console.log("Users data:", users);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-neutral">{t('admin_dashboard')}</h1>
      
      <div role="tablist" className="tabs tabs-bordered">
        <a role="tab" className={`tab ${activeTab === 'transfers' ? 'tab-active' : ''}`} onClick={() => setActiveTab('transfers')}>{t('all_transfers')}</a>
        <a role="tab" className={`tab ${activeTab === 'credits' ? 'tab-active' : ''}`} onClick={() => setActiveTab('credits')}>{t('all_credit_requests')}</a>
        <a role="tab" className={`tab ${activeTab === 'support' ? 'tab-active' : ''}`} onClick={() => setActiveTab('support')}>{t('support')}</a>
        <a role="tab" className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>{t('settings')}</a>
      </div>

      <Card>
        {activeTab === 'transfers' && renderTable(transfers, [
            { key: 'user', header: t('user'), render: (item: Transfer) => getUserName(item.userId) },
            { key: 'amount', header: t('transfer_amount'), render: (item: Transfer) => formatCurrency(item.amount) },
            { key: 'recipient', header: t('account_holder_name'), render: (item: Transfer) => item.accountHolderName },
            { key: 'status', header: t('status'), render: (item: Transfer) => <span className={`badge ${item.status === 'blocked' ? 'badge-error' : 'badge-ghost'}`}>{t(item.status)}</span> },
            { key: 'date', header: t('date'), render: (item: Transfer) => formatDate(item.createdAt) },
            { key: 'action', header: t('action'), render: (item: Transfer) => item.status === 'blocked' ? <Button size="sm" onClick={() => handleOpenTransferModal(item)}>{t('manage_transfer')}</Button> : null }
        ])}

        {activeTab === 'credits' && renderTable(creditRequests, [
             { key: 'user', header: t('user'), render: (item: CreditRequest) => getUserName(item.userId) },
             { key: 'amount', header: t('credit_amount'), render: (item: CreditRequest) => formatCurrency(item.amount) },
             { key: 'reason', header: t('reason'), render: (item: CreditRequest) => item.reason },
             { key: 'status', header: t('status'), render: (item: CreditRequest) => <span className="badge badge-ghost">{t(item.status)}</span> },
             { key: 'date', header: t('date'), render: (item: CreditRequest) => formatDate(item.createdAt) },
             { key: 'action', header: t('action'), render: (item: CreditRequest) => item.status === 'pending' ? <div className="flex gap-2"><Button size="sm" onClick={() => onUpdateCreditRequest({...item, status: 'approved'})}>{t('approve')}</Button><Button size="sm" variant="secondary" onClick={() => onUpdateCreditRequest({...item, status: 'rejected'})}>{t('reject')}</Button></div> : null }
        ])}
        
        {activeTab === 'settings' && (
            <div className="space-y-4 max-w-lg mx-auto">
                <h3 className="text-xl font-bold">{t('customize_block_messages')}</h3>
                {currentBlockMessages.map((msg, index) => (
                     <Input 
                        key={index}
                        label={t(`step_${index + 1}_message`)}
                        id={`step-msg-${index}`}
                        value={msg}
                        onChange={(e) => {
                            const newMessages = [...currentBlockMessages];
                            newMessages[index] = e.target.value;
                            setCurrentBlockMessages(newMessages);
                        }}
                    />
                ))}
                <Button onClick={handleSaveSettings}>{t('save_settings')}</Button>
            </div>
        )}
        
        {activeTab === 'support' && (
            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-base-200 rounded-box">
                        <p className="font-semibold">{user.name} ({user.email})</p>
                        <Button size="sm" onClick={() => setActiveChatUser(user)}>{t('open_chat')}</Button>
                    </div>
                ))}
            </div>
        )}

      </Card>
      
      <Modal isOpen={!!selectedTransfer} onClose={handleCloseTransferModal} title={t('manage_transfer')}>
        {selectedTransfer && (
            <div className="space-y-4">
                <p><strong>{t('user')}:</strong> {getUserName(selectedTransfer.userId)}</p>
                <p><strong>{t('status')}:</strong> {t('blocked')} at step {selectedTransfer.blockedStep}</p>
                
                <Input 
                    label={t('custom_block_reason')}
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                />
                <Button onClick={handleSaveReason}>{t('save_reason')}</Button>

                <div className="divider"></div>

                <div className="flex items-center gap-4">
                    <Button onClick={handleGenerateCodeClick}>{t('generate_code')}</Button>
                    {generatedCode && <p className="font-mono text-lg p-2 bg-base-200 rounded-md"><strong>{t('unlock_code_generated')}:</strong> {generatedCode}</p>}
                </div>
            </div>
        )}
      </Modal>

      {activeChatUser && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
           <Card className="!p-0">
             <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold">{t('initiate_chat_with', { name: activeChatUser.name })}</h3>
                <Button size="sm" variant="ghost" className="!p-1" onClick={() => setActiveChatUser(null)}>✕</Button>
             </div>
             <ChatWindow messages={chatSessions[activeChatUser.id] || []} onSendMessage={handleAdminSendMessage} isLoading={isChatLoading} />
           </Card>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
