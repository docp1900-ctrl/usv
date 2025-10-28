
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ChatMessage, ChatMessageSender } from '../types';
import Button from './ui/Button';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const { t } = useLocalization();
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSendMessage(`File attached: ${file.name}`);
    }
  };

  const handleMicClick = () => {
    alert("Voice message functionality is not implemented in this demo.");
  };

  return (
    <div className="flex flex-col h-[60vh] bg-base-200 rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === ChatMessageSender.USER ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === ChatMessageSender.MODEL && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">AI</div>}
              {msg.sender === ChatMessageSender.ADMIN && <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">A</div>}
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                msg.sender === ChatMessageSender.USER ? 'bg-primary text-white' : 
                msg.sender === ChatMessageSender.SYSTEM ? 'bg-red-100 text-red-800' : 
                msg.sender === ChatMessageSender.ADMIN ? 'bg-secondary text-white' : 'bg-base-100 text-neutral'
              }`}>
                {msg.isTyping && !msg.text ? 
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                  </div> : 
                  <p className="text-sm" style={{ whiteSpace: "pre-wrap" }}>{msg.text}{msg.isTyping && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1"></span>}</p>
                }
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-base-300 bg-base-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <Button type="button" variant="ghost" className="!p-2" onClick={() => fileInputRef.current?.click()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </Button>
          <Button type="button" variant="ghost" className="!p-2" onClick={handleMicClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('type_message')}
            className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
            disabled={isLoading}
          />
          <Button type="submit" isLoading={isLoading} disabled={!input.trim()}>
            {t('send')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
