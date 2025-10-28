
import { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Transfer,
  CreditRequest,
  ChatMessage,
} from './types';
import Header from './components/Header';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useLocalization } from './hooks/useLocalization';
import { config } from './config';

type Page = 'login' | 'createAccount' | 'dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  
  // Data state will now be fetched from the backend
  const [users, setUsers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [blockStepMessages, setBlockStepMessages] = useState<string[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<number, ChatMessage[]>>({});

  useLocalization();

  const fetchDataForUser = useCallback(async (user: User) => {
    try {
      if (user.role === UserRole.ADMIN) {
        const [usersRes, transfersRes, creditsRes, chatRes, settingsRes] = await Promise.all([
          fetch(`${config.apiUrl}/users`),
          fetch(`${config.apiUrl}/transfers`),
          fetch(`${config.apiUrl}/credit-requests`),
          fetch(`${config.apiUrl}/chats`),
          fetch(`${config.apiUrl}/settings/block-messages`)
        ]);
        setUsers(await usersRes.json());
        setTransfers(await transfersRes.json());
        setCreditRequests(await creditsRes.json());
        setChatSessions(await chatRes.json());
        setBlockStepMessages(await settingsRes.json());
      } else {
        const [transfersRes, creditsRes, chatRes, settingsRes] = await Promise.all([
            fetch(`${config.apiUrl}/transfers/user/${user.id}`),
            fetch(`${config.apiUrl}/credit-requests/user/${user.id}`),
            fetch(`${config.apiUrl}/chats/user/${user.id}`),
            fetch(`${config.apiUrl}/settings/block-messages`)
        ]);
        setTransfers(await transfersRes.json());
        setCreditRequests(await creditsRes.json());
        // FIX: 'await' expressions are not allowed inside synchronous functions like the one provided to setChatSessions.
        // We must first await the promise to resolve, and then call the state setter with the result.
        const chatData = await chatRes.json();
        setChatSessions(prev => ({ ...prev, [user.id]: chatData }));
        setBlockStepMessages(await settingsRes.json());
      }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDataForUser(currentUser);
    }
  }, [currentUser, fetchDataForUser]);


  const handleLogin = async (email: string, pass: string): Promise<User | null> => {
    try {
      const response = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!response.ok) return null;
      const user = await response.json();
      setCurrentUser(user);
      setCurrentPage('dashboard');
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    // Clear all fetched data
    setUsers([]);
    setTransfers([]);
    setCreditRequests([]);
    setChatSessions({});
  };

  const handleCreateAccount = async (name: string, email: string, pass: string) => {
    try {
        const response = await fetch(`${config.apiUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass }),
        });
        const newUser = await response.json();
        setCurrentUser(newUser);
        setCurrentPage('dashboard');
    } catch (error) {
        console.error('Account creation failed:', error);
    }
  };

  const handleNewTransfer = async (transfer: Omit<Transfer, 'id' | 'createdAt' | 'status' | 'blockedStep'>) => {
    const response = await fetch(`${config.apiUrl}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer),
    });
    const result = await response.json();
    // Refetch data to get the latest state
    if (currentUser) {
      setCurrentUser(result.updatedUser);
      fetchDataForUser(currentUser);
    }
  };
  
  const handleUpdateTransfer = async (updatedTransfer: Transfer) => {
    await fetch(`${config.apiUrl}/transfers/${updatedTransfer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTransfer),
    });
    fetchDataForUser(currentUser!);
  };
  
  const handleNewCreditRequest = async (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => {
     await fetch(`${config.apiUrl}/credit-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
    fetchDataForUser(currentUser!);
  };

  const handleUpdateCreditRequest = async (updatedRequest: CreditRequest) => {
     const response = await fetch(`${config.apiUrl}/credit-requests/${updatedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest),
    });
    const result = await response.json();
    fetchDataForUser(currentUser!);
    if (currentUser?.role === UserRole.CLIENT) {
        setCurrentUser(result.updatedUser);
    }
  };

  const handleVerifyCode = async (transferId: string, step: number, code: string): Promise<boolean> => {
    const response = await fetch(`${config.apiUrl}/transfers/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, step, code }),
    });
    const result = await response.json();
    if(result.success) {
        setCurrentUser(result.updatedUser);
        fetchDataForUser(currentUser!);
    }
    return result.success;
  };

  const handleGenerateCode = async (transferId: string, step: number): Promise<string> => {
    const response = await fetch(`${config.apiUrl}/transfers/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, step }),
    });
    const { code } = await response.json();
    return code;
  };

  const handleSendMessage = async (userId: number, message: ChatMessage) => {
    await fetch(`${config.apiUrl}/chats/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
    });
    fetchDataForUser(currentUser!);
  };
  
  const clientSideSendMessage = (message: ChatMessage) => {
    if (!currentUser) return;
    handleSendMessage(currentUser.id, message);
  };
  
  const handleUpdateBlockStepMessages = async (messages: string[]) => {
      await fetch(`${config.apiUrl}/settings/block-messages`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
      });
      setBlockStepMessages(messages);
  };


  const renderContent = () => {
    if (currentPage === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onNavigateToCreateAccount={() => setCurrentPage('createAccount')}
        />
      );
    }
    if (currentPage === 'createAccount') {
      return (
        <CreateAccount
          onCreateAccount={handleCreateAccount}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      );
    }
    if (currentUser?.role === UserRole.CLIENT) {
      return (
        <ClientDashboard
          user={currentUser}
          transfers={transfers}
          creditRequests={creditRequests}
          onNewTransfer={handleNewTransfer}
          onNewCreditRequest={handleNewCreditRequest}
          onUpdateTransfer={handleUpdateTransfer}
          onVerifyCode={handleVerifyCode}
          blockStepMessages={blockStepMessages}
          chatSession={chatSessions[currentUser.id] || []}
          onSendMessage={clientSideSendMessage}
        />
      );
    }
    if (currentUser?.role === UserRole.ADMIN) {
      return (
        <AdminDashboard
          users={users.filter((u) => u.role === UserRole.CLIENT)}
          transfers={transfers}
          creditRequests={creditRequests}
          onUpdateTransfer={handleUpdateTransfer}
          onUpdateCreditRequest={handleUpdateCreditRequest}
          onGenerateCode={handleGenerateCode}
          blockStepMessages={blockStepMessages}
          onUpdateBlockStepMessages={handleUpdateBlockStepMessages}
          chatSessions={chatSessions}
          onSendMessage={handleSendMessage}
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
