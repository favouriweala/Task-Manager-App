'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  Eye, 
  ExternalLink,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    full_name: string;
    email: string;
  };
}

interface AttachmentListProps {
  taskId: string;
  onAttachmentDeleted?: (attachmentId: string) => void;
  className?: string;
}

const FILE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  text: FileText,
  application: Archive,
  default: File
};

const FILE_COLORS = {
  image: 'text-green-600 bg-green-50',
  video: 'text-purple-600 bg-purple-50',
  audio: 'text-blue-600 bg-blue-50',
  text: 'text-orange-600 bg-orange-50',
  application: 'text-gray-600 bg-gray-50',
  default: 'text-gray-600 bg-gray-50'
};

export function AttachmentList({ taskId, onAttachmentDeleted, className }: AttachmentListProps) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
    getCurrentUser();
  }, [taskId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('task_attachments')
        .select(`
          *,
          uploader:uploaded_by (
            full_name,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAttachments(data || []);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    const type = mimeType.split('/')[0];
    return FILE_ICONS[type as keyof typeof FILE_ICONS] || FILE_ICONS.default;
  };

  const getFileColor = (mimeType: string) => {
    const type = mimeType.split('/')[0];
    return FILE_COLORS[type as keyof typeof FILE_COLORS] || FILE_COLORS.default;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = attachment.file_url;
      link.download = attachment.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const handlePreview = (attachment: TaskAttachment) => {
    // Open file in new tab for preview
    window.open(attachment.file_url, '_blank');
  };

  const handleDelete = async (attachment: TaskAttachment) => {
    if (!window.confirm(`Are you sure you want to delete "${attachment.file_name}"?`)) {
      return;
    }

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) {
        throw dbError;
      }

      // Delete from storage
      const filePath = new URL(attachment.file_url).pathname.split('/').slice(-3).join('/');
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }

      // Update local state
      setAttachments(prev => prev.filter(a => a.id !== attachment.id));
      onAttachmentDeleted?.(attachment.id);

    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
    }
  };

  const canDelete = (attachment: TaskAttachment) => {
    return currentUser === attachment.uploaded_by;
  };

  const isPreviewable = (mimeType: string) => {
    return mimeType.startsWith('image/') || 
           mimeType === 'application/pdf' || 
           mimeType.startsWith('text/');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading attachments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading attachments: {error}</p>
            <Button 
              variant="outline" 
              onClick={fetchAttachments}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <File className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No attachments yet</p>
            <p className="text-sm">Upload files to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <File className="h-5 w-5" />
          <span>Attachments ({attachments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {attachments.map((attachment) => {
            const IconComponent = getFileIcon(attachment.mime_type);
            const colorClass = getFileColor(attachment.mime_type);
            
            return (
              <div key={attachment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className={cn('p-2 rounded-lg', colorClass)}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {attachment.file_name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{formatFileSize(attachment.file_size)}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(attachment.created_at)}</span>
                          </div>
                          {attachment.uploader && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{attachment.uploader.full_name || attachment.uploader.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {isPreviewable(attachment.mime_type) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(attachment)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        {canDelete(attachment) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attachment)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* File Type Badge */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {attachment.mime_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}