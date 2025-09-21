'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  Share2,
  Eye,
  Edit3,
  MousePointer,
  Wifi,
  WifiOff,
  Bell,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  isTyping?: boolean;
  lastSeen: Date;
}

interface CollaborativeSession {
  id: string;
  name: string;
  users: User[];
  isActive: boolean;
  startTime: Date;
}

interface Message {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file';
}

export function RealTimeCollaboration() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeUsers, setActiveUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: '/avatars/alice.jpg',
      color: '#3B82F6',
      cursor: { x: 150, y: 200 },
      isTyping: false,
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Bob Smith',
      color: '#10B981',
      cursor: { x: 300, y: 150 },
      isTyping: true,
      lastSeen: new Date()
    },
    {
      id: '3',
      name: 'Carol Davis',
      color: '#F59E0B',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: activeUsers[0],
      content: 'Hey everyone! I just updated the design mockups.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'text'
    },
    {
      id: '2',
      user: activeUsers[1],
      content: 'Great! I can see the changes in real-time. Love the new color scheme.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [collaborativeText, setCollaborativeText] = useState('This is a collaborative document that multiple users can edit simultaneously...');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursors, setCursors] = useState<{ [key: string]: { x: number; y: number } }>({});

  useEffect(() => {
    // Simulate cursor movement
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        cursor: user.cursor ? {
          x: user.cursor.x + (Math.random() - 0.5) * 20,
          y: user.cursor.y + (Math.random() - 0.5) * 20
        } : undefined
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: activeUsers[0], // Current user
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getPresenceStatus = (user: User) => {
    const now = new Date();
    const timeDiff = now.getTime() - user.lastSeen.getTime();
    
    if (timeDiff < 30000) return 'online'; // Less than 30 seconds
    if (timeDiff < 300000) return 'away'; // Less than 5 minutes
    return 'offline';
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Real-Time Collaboration</h1>
                <p className="text-blue-100 mt-1">Work together in real-time with live presence and editing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-300" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-300" />
                )}
                <span className="text-white text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Collaboration Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Users */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                <CardTitle className="flex items-center text-green-900">
                  <Eye className="w-5 h-5 mr-2" />
                  Active Collaborators ({activeUsers.filter(u => getPresenceStatus(u) === 'online').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {activeUsers.map((user) => {
                    const status = getPresenceStatus(user);
                    return (
                      <div key={user.id} className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback style={{ backgroundColor: user.color + '20', color: user.color }}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getPresenceColor(status)}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {status}
                            </Badge>
                            {user.isTyping && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                                typing...
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Collaborative Document */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-purple-900">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Collaborative Document
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative" ref={containerRef}>
                  <Textarea
                    value={collaborativeText}
                    onChange={(e) => setCollaborativeText(e.target.value)}
                    className="min-h-[300px] resize-none border-2 border-dashed border-gray-200 focus:border-blue-400 bg-white/50"
                    placeholder="Start typing to collaborate in real-time..."
                  />
                  
                  {/* Live Cursors */}
                  {activeUsers.map((user) => 
                    user.cursor && user.id !== '1' ? (
                      <div
                        key={user.id}
                        className="absolute pointer-events-none z-10 transition-all duration-200"
                        style={{
                          left: user.cursor.x,
                          top: user.cursor.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <MousePointer 
                            className="w-4 h-4" 
                            style={{ color: user.color }}
                          />
                          <div 
                            className="px-2 py-1 rounded text-xs text-white font-medium"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.name}
                          </div>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Auto-saved • Last edit 2 seconds ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {collaborativeText.length} characters
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Version 1.2.3
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Call Controls */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-xl">
                <CardTitle className="flex items-center text-red-900">
                  <Video className="w-5 h-5 mr-2" />
                  Video Call
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={!isVideoEnabled ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    >
                      {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={isVideoCall ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setIsVideoCall(!isVideoCall)}
                    >
                      {isVideoCall ? 'End Call' : 'Start Call'}
                    </Button>
                  </div>
                  
                  {isVideoCall && (
                    <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                      <p className="text-white text-sm">Video call active</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <CardTitle className="flex items-center text-blue-900">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={message.user.avatar} />
                          <AvatarFallback 
                            className="text-xs"
                            style={{ backgroundColor: message.user.color + '20', color: message.user.color }}
                          >
                            {message.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-medium text-gray-900">{message.user.name}</p>
                            <p className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      Send
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-xl">
                <CardTitle className="flex items-center text-yellow-900">
                  <Bell className="w-5 h-5 mr-2" />
                  Live Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Alice joined the session</p>
                      <p className="text-xs text-blue-600">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Document auto-saved</p>
                      <p className="text-xs text-green-600">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">New comment added</p>
                      <p className="text-xs text-purple-600">8 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}