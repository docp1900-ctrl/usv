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

  const [users, setUsers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [blockStepMessages, setBlockStepMessages] = useState<string[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<number, ChatMessage[]>>({});

  useLocalization();

  // 🛰️ Fetch all necessary data depending on user role
  const fetchDataForUser = useCallback(async (user: User) => {
    console.log("🛰️ Fetching data for user:", user);

    try {
      if (user.role === UserRole.ADMIN) {
        const [usersRes, transfersRes, creditsRes, chatRes, settingsRes] = await Promise.all([
          fetch(`${config.apiUrl}/users`),
          fetch(`${config.apiUrl}/transfers`),
          fetch(`${config.apiUrl}/credit-requests`),
          fetch(`${config.apiUrl}/chats`),
          fetch(`${config.apiUrl}/settings/block-messages`)
        ]);

        if (!usersRes.ok || !transfersRes.ok || !creditsRes.ok) {
          console.error("❌ API error (admin):", { usersRes, transfersRes, creditsRes });
          return;
        }

        const [usersData, transfersData, creditsData, chatData, settingsData] = await Promise.all([
          usersRes.json(),
          transfersRes.json(),
          creditsRes.json(),
          chatRes.json(),
          settingsRes.json()
        ]);

        console.log("✅ Admin data fetched:", {
          usersData,
          transfersData,
          creditsData,
          chatData,
          settingsData
        });

        setUsers(usersData);
        setTransfers(transfersData);
        setCreditRequests(creditsData);
        setChatSessions(chatData);
        setBlockStepMessages(settingsData);

      } else {
        const [transfersRes, creditsRes, chatRes, settingsRes] = await Promise.all([
          fetch(`${config.apiUrl}/transfers/user/${user.id}`),
          fetch(`${config.apiUrl}/credit-requests/user/${user.id}`),
          fetch(`${config.apiUrl}/chats/user/${user.id}`),
          fetch(`${config.apiUrl}/settings/block-messages`)
        ]);

        if (!transfersRes.ok) {
          console.error("❌ Transfers fetch failed:", transfersRes.statusText);
          return;
        }

        const transfersData = await transfersRes.json();
        const creditsData = creditsRes.ok ? await creditsRes.json() : [];
        const chatData = chatRes.ok ? await chatRes.json() : [];
        const settingsData = settingsRes.ok ? await settingsRes.json() : [];

        console.log("✅ Client data fetched:", {
          transfersData,
          creditsData,
          chatData,
          settingsData
        });

        setTransfers(transfersData);
        setCreditRequests(creditsData);
        setChatSessions(prev => ({ ...prev, [user.id]: chatData }));
        setBlockStepMessages(settingsData);
      }
    } catch (error) {
      console.error("❌ fetchDataForUser error:", error);
    }
  }, []);

  // 🧩 Fetch when user changes
  useEffect(() => {
    if (currentUser) {
      fetchDataForUser(currentUser);
    }
  }, [currentUser, fetchDataForUser]);

  // 🧠 LOGIN
  const handleLogin = async (email: string, pass: string): Promise<User | null> => {
    console.log("🔐 Attempting login for:", email);
    try {
      const response = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!response.ok) {
        console.warn("⚠️ Login failed with status:", response.status);
        return null;
      }
      const user = await response.json();
      console.log("✅ Login successful:", user);
      setCurrentUser(user);
      setCurrentPage('dashboard');
      return user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return null;
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    console.log("👋 Logging out...");
    setCurrentUser(null);
    setCurrentPage('login');
    setUsers([]);
    setTransfers([]);
    setCreditRequests([]);
    setChatSessions({});
  };

  // 🧾 CREATE ACCOUNT
  const handleCreateAccount = async (name: string, email: string, pass: string) => {
    console.log("👤 Creating account:", name, email);
    try {
      const response = await fetch(`${config.apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      if (!response.ok) throw new Error(`Create account failed: ${response.status}`);
      const newUser = await response.json();
      console.log("✅ Account created:", newUser);
      setCurrentUser(newUser);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('❌ Account creation failed:', error);
    }
  };

  // 💸 NEW TRANSFER
  const handleNewTransfer = async (transfer: Omit<Transfer, 'id' | 'createdAt' | 'status' | 'blockedStep'>) => {
    console.log("💸 Creating new transfer:", transfer);
    try {
      const response = await fetch(`${config.apiUrl}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer),
      });
      if (!response.ok) throw new Error(`Transfer failed: ${response.status}`);
      const result = await response.json();
      console.log("✅ Transfer created:", result);
      if (currentUser) {
        setCurrentUser(result.updatedUser);
        fetchDataForUser(currentUser);
      }
    } catch (error) {
      console.error("❌ handleNewTransfer error:", error);
    }
  };

  // ✏️ UPDATE TRANSFER
  const handleUpdateTransfer = async (updatedTransfer: Transfer) => {
    console.log("✏️ Updating transfer:", updatedTransfer);
    await fetch(`${config.apiUrl}/transfers/${updatedTransfer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTransfer),
    });
    if (currentUser) fetchDataForUser(currentUser);
  };

  // 💰 CREDIT REQUEST
  const handleNewCreditRequest = async (request: Omit<CreditRequest, 'id' | 'createdAt' | 'status'>) => {
    console.log("💰 New credit request:", request);
    await fetch(`${config.apiUrl}/credit-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (currentUser) fetchDataForUser(currentUser);
  };

  // 🔄 UPDATE CREDIT REQUEST
  const handleUpdateCreditRequest = async (updatedRequest: CreditRequest) => {
    console.log("🔄 Updating credit request:", updatedRequest);
    const response = await fetch(`${config.apiUrl}/credit-requests/${updatedRequest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRequest),
    });
    const result = await response.json();
    if (currentUser) fetchDataForUser(currentUser);
    if (currentUser?.role === UserRole.CLIENT) setCurrentUser(result.updatedUser);
  };

  // 🔢 VERIFY CODE
  const handleVerifyCode = async (transferId: string, step: number, code: string): Promise<boolean> => {
    console.log("🔍 Verifying code:", { transferId, step, code });
    const response = await fetch(`${config.apiUrl}/transfers/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, step, code }),
    });
    const result = await response.json();
    if (result.success && currentUser) {
      setCurrentUser(result.updatedUser);
      fetchDataForUser(currentUser);
    }
    return result.success;
  };

  // 🔐 GENERATE CODE
  const handleGenerateCode = async (transferId: string, step: number): Promise<string> => {
    console.log("🔐 Generating code for:", transferId, "step:", step);
    const response = await fetch(`${config.apiUrl}/transfers/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, step }),
    });
    const { code } = await response.json();
    return code;
  };

  // 💬 CHAT
  const handleSendMessage = async (userId: number, message: ChatMessage) => {
    console.log("💬 Sending message for user:", userId, message);
    await fetch(`${config.apiUrl}/chats/user/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (currentUser) fetchDataForUser(currentUser);
  };

  const clientSideSendMessage = (message: ChatMessage) => {
    if (!currentUser) return;
    handleSendMessage(currentUser.id, message);
  };

  // ⚙️ SETTINGS
  const handleUpdateBlockStepMessages = async (messages: string[]) => {
    console.log("⚙️ Updating block step messages:", messages);
    await fetch(`${config.apiUrl}/settings/block-messages`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    setBlockStepMessages(messages);
  };

  // 🖥️ MAIN RENDER LOGIC
  const renderContent = () => {
    if (currentPage === 'login')
      return <Login onLogin={handleLogin} onNavigateToCreateAccount={() => setCurrentPage('createAccount')} />;
    if (currentPage === 'createAccount')
      return <CreateAccount onCreateAccount={handleCreateAccount} onNavigateToLogin={() => setCurrentPage('login')} />;
    if (!currentUser) return <p className="text-center p-4">Loading...</p>;

    console.log("🎨 Rendering dashboard for:", currentUser.role);

    if (currentUser.role === UserRole.CLIENT)
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

    if (currentUser.role === UserRole.ADMIN)
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

    return <p className="text-center text-error">⚠️ Unknown user role</p>;
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
