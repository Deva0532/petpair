import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChatInterface } from '../components/messages/ChatInterface';
import { mockChatRooms, mockMessages, mockUsers } from '../data/mockData';
import { Message, ChatRoom } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(mockChatRooms[0] || null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
          <p className="text-gray-600">Please sign in to access your messages.</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!selectedChatRoom) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: selectedChatRoom.participants.find(p => p.id !== user.id)?.id || '',
      content,
      timestamp: new Date().toISOString(),
      read: false,
      mediaUrl,
      mediaType
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const filteredChatRooms = mockChatRooms.filter(room =>
    room.participants.some(participant =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Chat Rooms List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChatRooms.length > 0 ? (
                filteredChatRooms.map((room) => {
                  const otherParticipant = room.participants.find(p => p.id !== user.id);
                  if (!otherParticipant) return null;

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedChatRoom(room)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChatRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.name}&background=3b82f6&color=ffffff`}
                            alt={otherParticipant.name}
                            className="w-12 h-12 rounded-full"
                          />
                          {room.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {room.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant.name}
                            </h3>
                            {room.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {new Date(room.lastMessage.timestamp).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {room.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {room.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {selectedChatRoom ? (
              <ChatInterface
                messages={messages.filter(m => 
                  (m.senderId === user.id && m.receiverId === selectedChatRoom.participants.find(p => p.id !== user.id)?.id) ||
                  (m.receiverId === user.id && m.senderId === selectedChatRoom.participants.find(p => p.id !== user.id)?.id)
                )}
                currentUser={user}
                recipient={selectedChatRoom.participants.find(p => p.id !== user.id) || mockUsers[0]}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};