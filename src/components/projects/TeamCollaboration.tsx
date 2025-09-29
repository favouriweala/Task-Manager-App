'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Calendar, 
  Clock,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  UserPlus,
  Settings,
  Bell,
  Search,
  Filter,
  Star,
  Pin,
  Archive,
  Edit3,
  Trash2,
  Reply,
  Heart,
  Share,
  Eye,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Activity
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
  timezone: string;
  skills: string[];
}

interface Message {
  id: string;
  author: TeamMember;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system' | 'task' | 'meeting';
  reactions?: { emoji: string; users: string[]; }[];
  replies?: Message[];
  attachments?: { name: string; type: string; size: string; }[];
  isEdited?: boolean;
  isPinned?: boolean;
}

interface Activity {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  timestamp: Date;
  type: 'task' | 'project' | 'meeting' | 'file' | 'comment';
}

export function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isTyping, setIsTyping] = useState<string[]>([]);

  // Mock data initialization
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        role: 'Lead Developer',
        status: 'online',
        timezone: 'PST',
        skills: ['React', 'TypeScript', 'Node.js']
      },
      {
        id: '2',
        name: 'Mike Johnson',
        avatar: '/avatars/mike.jpg',
        role: 'AI Specialist',
        status: 'online',
        timezone: 'EST',
        skills: ['Python', 'TensorFlow', 'ML']
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar: '/avatars/emma.jpg',
        role: 'UX Designer',
        status: 'away',
        lastSeen: '5 minutes ago',
        timezone: 'GMT',
        skills: ['Figma', 'Design Systems', 'User Research']
      },
      {
        id: '4',
        name: 'Alex Rodriguez',
        avatar: '/avatars/alex.jpg',
        role: 'Mobile Lead',
        status: 'busy',
        timezone: 'PST',
        skills: ['Flutter', 'iOS', 'Android']
      },
      {
        id: '5',
        name: 'Lisa Wang',
        avatar: '/avatars/lisa.jpg',
        role: 'Flutter Developer',
        status: 'offline',
        lastSeen: '2 hours ago',
        timezone: 'CST',
        skills: ['Flutter', 'Dart', 'Firebase']
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        author: mockTeamMembers[0],
        content: 'Great progress on the AI integration! The new features are looking fantastic.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        reactions: [
          { emoji: '👍', users: ['2', '3'] },
          { emoji: '🚀', users: ['4'] }
        ]
      },
      {
        id: '2',
        author: mockTeamMembers[1],
        content: 'Thanks! I\'ve just pushed the latest ML model updates. Performance improved by 23%.',
        timestamp: new Date(Date.now() - 3300000),
        type: 'text',
        attachments: [
          { name: 'performance-report.pdf', type: 'pdf', size: '2.3 MB' }
        ]
      },
      {
        id: '3',
        author: mockTeamMembers[2],
        content: 'The new dashboard designs are ready for review. I\'ve incorporated all the feedback from last week.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        isPinned: true
      },
      {
        id: '4',
        author: mockTeamMembers[3],
        content: 'Mobile app testing is complete. Found a few minor issues that I\'ll fix today.',
        timestamp: new Date(Date.now() - 900000),
        type: 'task'
      }
    ];

    const mockActivities: Activity[] = [
      {
        id: '1',
        user: mockTeamMembers[0],
        action: 'completed task',
        target: 'AI Model Integration',
        timestamp: new Date(Date.now() - 1800000),
        type: 'task'
      },
      {
        id: '2',
        user: mockTeamMembers[1],
        action: 'updated project',
        target: 'Zyra AI Enhancement',
        timestamp: new Date(Date.now() - 2700000),
        type: 'project'
      },
      {
        id: '3',
        user: mockTeamMembers[2],
        action: 'uploaded file',
        target: 'design-mockups-v2.fig',
        timestamp: new Date(Date.now() - 3600000),
        type: 'file'
      },
      {
        id: '4',
        user: mockTeamMembers[3],
        action: 'scheduled meeting',
        target: 'Sprint Planning',
        timestamp: new Date(Date.now() - 5400000),
        type: 'meeting'
      }
    ];

    setTeamMembers(mockTeamMembers);
    setMessages(mockMessages);
    setActivities(mockActivities);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      author: teamMembers[0], // Current user
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Collaboration</h3>
          <p className="text-gray-600 dark:text-gray-400">Real-time communication and activity tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Start Meeting
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Meetings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Project Chat</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 px-6">
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.author.avatar} />
                            <AvatarFallback>{message.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {message.author.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {message.author.role}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.isPinned && (
                                <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                              )}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <p className="text-sm text-gray-900 dark:text-gray-100">{message.content}</p>
                              
                              {message.attachments && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                                      <Paperclip className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium">{attachment.name}</span>
                                      <span className="text-xs text-gray-500">({attachment.size})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {message.reactions && (
                                <div className="flex items-center space-x-2 mt-2">
                                  {message.reactions.map((reaction, index) => (
                                    <Button key={index} variant="ghost" size="sm" className="h-6 px-2">
                                      <span className="text-sm">{reaction.emoji}</span>
                                      <span className="text-xs ml-1">{reaction.users.length}</span>
                                    </Button>
                                  ))}
                                  <Button variant="ghost" size="sm" className="h-6 px-2">
                                    <Smile className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Typing Indicator */}
                  {isTyping.length > 0 && (
                    <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="pr-20"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Paperclip className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Smile className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Online Team Members */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span>Online Now</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.filter(member => member.status === 'online').map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {member.status === 'online' ? 'Online' : member.lastSeen || 'Offline'} • {member.timezone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Video className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{activity.user.name}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Upcoming Meetings</span>
                </CardTitle>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Sprint Planning</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today at 2:00 PM PST</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        with Sarah Chen, Mike Johnson, Emma Davis
                      </p>
                    </div>
                    <Button size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Design Review</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tomorrow at 10:00 AM PST</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        with Emma Davis, Alex Rodriguez
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Remind Me
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Weekly Standup</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Friday at 9:00 AM PST</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Recurring • All team members
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}