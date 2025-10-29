import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PhotoIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { Message, User } from '../../types';
import { Button } from '../ui/Button';

interface ChatInterfaceProps {
  messages: Message[];
  currentUser: User;
  recipient: User;
  onSendMessage: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentUser,
  recipient,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      const mockUrl = URL.createObjectURL(file);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      onSendMessage(`Shared a ${mediaType}`, mockUrl, mediaType);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <img
          src={recipient.avatar || `https://ui-avatars.com/api/?name=${recipient.name}&background=3b82f6&color=ffffff`}
          alt={recipient.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">{recipient.name}</h3>
          <p className="text-sm text-gray-500">
            {recipient.verified ? '✓ Verified' : 'Not verified'} • {recipient.location}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === currentUser.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.mediaUrl && (
                <div className="mb-2">
                  {message.mediaType === 'image' ? (
                    <img
                      src={message.mediaUrl}
                      alt="Shared image"
                      className="max-w-full h-auto rounded"
                    />
                  ) : (
                    <video
                      src={message.mediaUrl}
                      controls
                      className="max-w-full h-auto rounded"
                    />
                  )}
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <Button type="submit" disabled={!newMessage.trim()} className="px-3">
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </form>
    </div>
  );
};