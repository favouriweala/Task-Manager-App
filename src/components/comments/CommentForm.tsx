'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Send, 
  X, 
  User,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentFormProps {
  taskId: string;
  initialContent?: string;
  isEditing?: boolean;
  onCommentAdded?: (comment: TaskComment) => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({ 
  taskId, 
  initialContent = '', 
  isEditing = false, 
  onCommentAdded, 
  onCancel,
  className 
}: CommentFormProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getCurrentUser();
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing, content.length]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setCurrentUser({
          ...user,
          ...profile
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // For editing, we'll pass the content back to parent
        onCommentAdded?.({
          id: '',
          task_id: taskId,
          user_id: currentUser.id,
          content: content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setContent('');
      } else {
        // Create new comment
        const { data, error: insertError } = await supabase
          .from('task_comments')
          .insert({
            task_id: taskId,
            user_id: currentUser.id,
            content: content.trim()
          })
          .select()
          .single();

        if (insertError) throw insertError;

        onCommentAdded?.(data);
        setContent('');
      }
    } catch (err) {
      console.error('Error saving comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save comment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError(null);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === 'Escape' && isEditing) {
      handleCancel();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentUser) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Please log in to add comments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(isEditing && 'border-blue-200 bg-blue-50/50', className)}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-3">
            {/* User Avatar */}
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage 
                src={currentUser.avatar_url} 
                alt={currentUser.full_name || 'User'} 
              />
              <AvatarFallback className="text-xs">
                {currentUser.full_name 
                  ? getInitials(currentUser.full_name)
                  : <User className="h-4 w-4" />
                }
              </AvatarFallback>
            </Avatar>

            {/* Comment Input */}
            <div className="flex-1 space-y-2">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEditing ? "Edit your comment..." : "Add a comment..."}
                className="min-h-[80px] resize-none"
                disabled={loading}
              />
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {isEditing ? 'Press Escape to cancel' : 'Press Ctrl+Enter to submit'}
                </p>
                
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading || !content.trim()}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    {isEditing ? 'Update' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}