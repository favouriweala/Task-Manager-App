import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { Database, EmailQueue, InsertEmailQueue, UpdateEmailQueue } from '../database/types';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
}

interface QueuedEmail {
  id: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  templateData: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  scheduledFor: Date;
  sentAt?: Date;
  createdAt: Date;
}

class EmailService {
  private resend: Resend | null;
  private supabase: any; // Temporarily using any to fix typing issues

  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not found. Email functionality will be disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    this.initializeTemplates();
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates() {
    this.templates.set('task_assigned', {
      id: 'task_assigned',
      name: 'Task Assigned',
      subject: 'New Task Assigned: {{taskTitle}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>Task Assigned</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2>{{taskTitle}}</h2>
            <p>You have been assigned a new task:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Task:</strong> {{taskTitle}}</p>
              <p><strong>Project:</strong> {{projectName}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Priority:</strong> {{priority}}</p>
              {{#description}}<p><strong>Description:</strong> {{description}}</p>{{/description}}
            </div>
            <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
              View Task
            </a>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>Task Manager - Stay organized, stay productive</p>
          </div>
        </div>
      `,
      textTemplate: `
Task Assigned: {{taskTitle}}

You have been assigned a new task:

Task: {{taskTitle}}
Project: {{projectName}}
Due Date: {{dueDate}}
Priority: {{priority}}
{{#description}}Description: {{description}}{{/description}}

View task: {{actionUrl}}

---
Task Manager - Stay organized, stay productive
      `
    });

    this.templates.set('task_due_soon', {
      id: 'task_due_soon',
      name: 'Task Due Soon',
      subject: 'Task Due Soon: {{taskTitle}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
            <h1>⏰ Task Due Soon</h1>
          </div>
          <div style="padding: 20px; background: #fef3c7;">
            <h2>{{taskTitle}}</h2>
            <p>This task is due soon and needs your attention:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
              <p><strong>Task:</strong> {{taskTitle}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Time Remaining:</strong> {{timeRemaining}}</p>
              <p><strong>Priority:</strong> {{priority}}</p>
            </div>
            <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
              Complete Task
            </a>
          </div>
        </div>
      `
    });

    this.templates.set('ai_merge_recommendation', {
      id: 'ai_merge_recommendation',
      name: 'AI Merge Recommendation',
      subject: 'AI Suggestion: Merge Similar Projects',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #8b5cf6; color: white; padding: 20px; text-align: center;">
            <h1>🤖 AI Recommendation</h1>
          </div>
          <div style="padding: 20px; background: #f3f4f6;">
            <h2>Project Merge Suggestion</h2>
            <p>Our AI has identified similar projects that could be merged for better organization:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Primary Project:</strong> {{primaryProject}}</p>
              <p><strong>Similar Project:</strong> {{similarProject}}</p>
              <p><strong>Similarity Score:</strong> {{similarityScore}}%</p>
              <p><strong>Potential Benefits:</strong></p>
              <ul>
                {{#benefits}}
                <li>{{.}}</li>
                {{/benefits}}
              </ul>
            </div>
            <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
              Review Suggestion
            </a>
          </div>
        </div>
      `
    });

    this.templates.set('project_invitation', {
      id: 'project_invitation',
      name: 'Project Invitation',
      subject: 'You\'ve been invited to join {{projectName}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Project Invitation</h1>
          </div>
          <div style="padding: 20px; background: #f0fdf4;">
            <h2>Join {{projectName}}</h2>
            <p>{{inviterName}} has invited you to collaborate on a project:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Project:</strong> {{projectName}}</p>
              <p><strong>Invited by:</strong> {{inviterName}}</p>
              <p><strong>Role:</strong> {{role}}</p>
              {{#description}}<p><strong>Description:</strong> {{description}}</p>{{/description}}
            </div>
            <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">
              Accept Invitation
            </a>
          </div>
        </div>
      `
    });
  }

  /**
   * Send email immediately
   */
  async sendEmail(params: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.resend) {
      console.warn('Email service not configured. Skipping email send.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      let html = params.html;
      let text = params.text;
      let subject = params.subject;

      // Use template if provided
      if (params.templateId && this.templates.has(params.templateId)) {
        const template = this.templates.get(params.templateId)!;
        const data = params.templateData || {};

        html = this.processTemplate(template.htmlTemplate, data);
        text = template.textTemplate ? this.processTemplate(template.textTemplate, data) : undefined;
        subject = this.processTemplate(template.subject, data);
      }

      const emailOptions: any = {
        from: process.env.EMAIL_FROM || 'Task Manager <noreply@taskmanager.com>',
        to: params.to,
        subject,
        html,
      };

      // Only include text if it has a value
      if (text) {
        emailOptions.text = text;
      }

      const result = await this.resend.emails.send(emailOptions);

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(params: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    scheduledFor?: Date;
    maxAttempts?: number;
  }): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const insertData: InsertEmailQueue = {
        to_email: params.to,
        subject: params.subject,
        html_content: params.html || '',
        text_content: params.text || null,
        template_id: params.templateId || null,
        template_data: params.templateData || {},
        scheduled_for: (params.scheduledFor || new Date()).toISOString(),
        max_attempts: params.maxAttempts || 3,
      };

      const { data, error } = await this.supabase
        .from('email_queue')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error queueing email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('Error in queueEmail:', error);
      return { success: false, error: 'Failed to queue email' };
    }
  }

  /**
   * Process email queue (should be called by a cron job or background worker)
   */
  async processEmailQueue(batchSize: number = 10): Promise<{ processed: number; errors: number }> {
    if (!this.resend) {
      console.warn('Email service not configured. Skipping queue processing.');
      return { processed: 0, errors: 0 };
    }

    try {
      // Get pending emails that are ready to be sent
      const { data: emails, error } = await this.supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .lt('attempts', 3) // Fixed: removed problematic rpc call
        .order('created_at', { ascending: true })
        .limit(batchSize) as { data: EmailQueue[] | null; error: any };

      if (error) {
        console.error('Error fetching email queue:', error);
        return { processed: 0, errors: 1 };
      }

      if (!emails || emails.length === 0) {
        return { processed: 0, errors: 0 };
      }

      let processed = 0;
      let errors = 0;

      for (const email of emails) {
        try {
          // Update attempts count
          const updateData: UpdateEmailQueue = {
            attempts: email.attempts + 1
          };

          await this.supabase
            .from('email_queue')
            .update(updateData)
            .eq('id', email.id) as { error: any };

          // Send email
          const result = await this.sendEmail({
            to: email.to_email,
            subject: email.subject,
            html: email.html_content,
            text: email.text_content || undefined,
            templateId: email.template_id || undefined,
            templateData: (email.template_data as Record<string, any>) || {},
          });

          if (result.success) {
            // Mark as sent
            const sentUpdateData: UpdateEmailQueue = {
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null,
            };

            await this.supabase
              .from('email_queue')
              .update(sentUpdateData)
              .eq('id', email.id) as { error: any };

            processed++;
          } else {
            // Mark as failed if max attempts reached
            const newAttempts = email.attempts + 1;
            const status = newAttempts >= email.max_attempts ? 'failed' : 'pending';

            const failedUpdateData: UpdateEmailQueue = {
              status,
              error_message: result.error || 'Unknown error',
            };

            await this.supabase
              .from('email_queue')
              .update(failedUpdateData)
              .eq('id', email.id) as { error: any };

            errors++;
          }
        } catch (emailError) {
          console.error(`Error processing email ${email.id}:`, emailError);
          
          // Mark as failed
          const errorUpdateData: UpdateEmailQueue = {
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
          };

          await this.supabase
            .from('email_queue')
            .update(errorUpdateData)
            .eq('id', email.id) as { error: any };

          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error processing email queue:', error);
      return { processed: 0, errors: 1 };
    }
  }

  /**
   * Get email queue status
   */
  async getQueueStatus(): Promise<{
    pending: number;
    sent: number;
    failed: number;
    total: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('email_queue')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) as { data: { status: string }[] | null; error: any }; // Last 24 hours

      if (error) {
        console.error('Error fetching queue status:', error);
        return { pending: 0, sent: 0, failed: 0, total: 0 };
      }

      const stats = (data || []).reduce(
        (acc, email) => {
          const status = email.status as 'pending' | 'sent' | 'failed';
          if (status === 'pending' || status === 'sent' || status === 'failed') {
            acc[status]++;
          }
          acc.total++;
          return acc;
        },
        { pending: 0, sent: 0, failed: 0, total: 0 }
      );

      return stats;
    } catch (error) {
      console.error('Error in getQueueStatus:', error);
      return { pending: 0, sent: 0, failed: 0, total: 0 };
    }
  }

  /**
   * Cancel queued email
   */
  async cancelQueuedEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: UpdateEmailQueue = {
        status: 'cancelled'
      };

      const { error } = await this.supabase
        .from('email_queue')
        .update(updateData)
        .eq('id', emailId)
        .eq('status', 'pending') as { error: any };

      if (error) {
        console.error('Error cancelling email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in cancelQueuedEmail:', error);
      return { success: false, error: 'Failed to cancel email' };
    }
  }

  /**
   * Process template with data
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;

    // Simple mustache-like template processing
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#key}}...{{/key}}
    processed = processed.replace(/{{#(\w+)}}(.*?){{\/\1}}/g, (match, key, content) => {
      return data[key] ? content : '';
    });

    // Handle arrays {{#key}}...{{/key}}
    processed = processed.replace(/{{#(\w+)}}(.*?){{\/\1}}/g, (match, key, content) => {
      const arrayData = data[key];
      if (Array.isArray(arrayData)) {
        return arrayData.map(item => {
          let itemContent = content;
          if (typeof item === 'object') {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              const itemRegex = new RegExp(`{{${itemKey}}}`, 'g');
              itemContent = itemContent.replace(itemRegex, String(itemValue || ''));
            });
          } else {
            itemContent = itemContent.replace(/{{\.}}/g, String(item));
          }
          return itemContent;
        }).join('');
      }
      return '';
    });

    return processed;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!this.resend) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await this.sendEmail({
        to: process.env.TEST_EMAIL || 'test@example.com',
        subject: 'Task Manager Email Test',
        html: '<h1>Email Configuration Test</h1><p>If you receive this email, your email configuration is working correctly.</p>',
        text: 'Email Configuration Test\n\nIf you receive this email, your email configuration is working correctly.',
      });

      return result;
    } catch (error) {
      console.error('Error testing email configuration:', error);
      return { success: false, error: 'Failed to test email configuration' };
    }
  }
}

export const emailService = new EmailService();
export type { EmailTemplate, QueuedEmail };