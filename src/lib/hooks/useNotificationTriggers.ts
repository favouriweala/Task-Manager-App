import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { notificationService } from '../services/notificationService';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee_id?: string;
  due_date?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  owner_id: string;
}

export function useNotificationTriggers() {
  // Use the imported notificationService instead of creating a new instance
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Subscribe to task changes
    const taskSubscription = supabase
      .channel('task_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        async (payload) => {
          try {
            await handleTaskChange(payload);
          } catch (error) {
            console.error('Error handling task change notification:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to project changes
    const projectSubscription = supabase
      .channel('project_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        async (payload) => {
          try {
            await handleProjectChange(payload);
          } catch (error) {
            console.error('Error handling project change notification:', error);
          }
        }
      )
      .subscribe();

    // Check for due date reminders every minute
    const dueDateInterval = setInterval(async () => {
      try {
        await checkDueDateReminders();
      } catch (error) {
        console.error('Error checking due date reminders:', error);
      }
    }, 60000); // Check every minute

    return () => {
      taskSubscription.unsubscribe();
      projectSubscription.unsubscribe();
      clearInterval(dueDateInterval);
    };
  }, [supabase]);

  const handleTaskChange = async (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        await handleTaskCreated(newRecord);
        break;
      case 'UPDATE':
        await handleTaskUpdated(newRecord, oldRecord);
        break;
      case 'DELETE':
        await handleTaskDeleted(oldRecord);
        break;
    }
  };

  const handleTaskCreated = async (task: Task) => {
    // Notify assignee if task is assigned
    if (task.assignee_id) {
      await notificationService.createNotification({
        userId: task.assignee_id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.title}"`,
        priority: task.priority === 'urgent' ? 'urgent' : 'normal',
        relatedTaskId: task.id,
        relatedProjectId: task.project_id,
        actionUrl: `/tasks/${task.id}`,
      });
    }

    // Notify project owner if different from assignee
    if (task.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id, name')
        .eq('id', task.project_id)
        .single();

      if (project && project.owner_id !== task.assignee_id) {
        await notificationService.createNotification({
          userId: project.owner_id,
          type: 'task_assigned',
          title: 'New Task Created',
          message: `A new task "${task.title}" was created in project "${project.name}"`,
          priority: 'normal',
          relatedTaskId: task.id,
          relatedProjectId: task.project_id,
          actionUrl: `/tasks/${task.id}`,
        });
      }
    }
  };

  const handleTaskUpdated = async (newTask: Task, oldTask: Task) => {
    // Check if assignee changed
    if (newTask.assignee_id !== oldTask.assignee_id && newTask.assignee_id) {
      await notificationService.createNotification({
        userId: newTask.assignee_id,
        type: 'task_assigned',
        title: 'Task Reassigned',
        message: `You have been assigned to task: "${newTask.title}"`,
        priority: newTask.priority === 'urgent' ? 'urgent' : 'normal',
        relatedTaskId: newTask.id,
        relatedProjectId: newTask.project_id,
        actionUrl: `/tasks/${newTask.id}`,
      });
    }

    // Check if status changed to completed
    if (newTask.status === 'completed' && oldTask.status !== 'completed') {
      // Notify project owner
      if (newTask.project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('owner_id, name')
          .eq('id', newTask.project_id)
          .single();

        if (project && project.owner_id !== newTask.assignee_id) {
          await notificationService.createNotification({
            userId: project.owner_id,
            type: 'task_completed',
            title: 'Task Completed',
            message: `Task "${newTask.title}" has been completed in project "${project.name}"`,
            priority: 'normal',
            relatedTaskId: newTask.id,
            relatedProjectId: newTask.project_id,
            actionUrl: `/tasks/${newTask.id}`,
          });
        }
      }
    }

    // Check if priority changed to urgent
    if (newTask.priority === 'urgent' && oldTask.priority !== 'urgent' && newTask.assignee_id) {
      await notificationService.createNotification({
        userId: newTask.assignee_id,
        type: 'task_updated',
        title: 'Urgent Task Priority',
        message: `Task "${newTask.title}" has been marked as urgent`,
        priority: 'urgent',
        relatedTaskId: newTask.id,
        relatedProjectId: newTask.project_id,
        actionUrl: `/tasks/${newTask.id}`,
      });
    }
  };

  const handleTaskDeleted = async (task: Task) => {
    // Notify assignee if task was assigned
    if (task.assignee_id) {
      await notificationService.createNotification({
        userId: task.assignee_id,
        type: 'task_updated',
        title: 'Task Deleted',
        message: `Task "${task.title}" has been deleted`,
        priority: 'normal',
        relatedProjectId: task.project_id,
      });
    }
  };

  const handleProjectChange = async (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'UPDATE') {
      // Check if project name or description changed
      if (newRecord.name !== oldRecord.name || newRecord.description !== oldRecord.description) {
        // Notify all project members
        const { data: members } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', newRecord.id);

        if (members) {
          for (const member of members) {
            if (member.user_id !== newRecord.owner_id) {
              await notificationService.createNotification({
                userId: member.user_id,
                type: 'project_update',
                title: 'Project Updated',
                message: `Project "${newRecord.name}" has been updated`,
                priority: 'normal',
                relatedProjectId: newRecord.id,
                actionUrl: `/projects/${newRecord.id}`,
              });
            }
          }
        }
      }
    }
  };

  const checkDueDateReminders = async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Check for tasks due tomorrow
    const { data: tasksDueTomorrow } = await supabase
      .from('tasks')
      .select('id, title, assignee_id, project_id, due_date')
      .gte('due_date', tomorrow.toISOString().split('T')[0])
      .lt('due_date', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .neq('status', 'completed');

    if (tasksDueTomorrow) {
      for (const task of tasksDueTomorrow) {
        if (task.assignee_id) {
          // Check if we already sent a reminder today
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', task.assignee_id)
            .eq('type', 'task_due_soon')
            .eq('related_task_id', task.id)
            .gte('created_at', now.toISOString().split('T')[0])
            .single();

          if (!existingNotification) {
            await notificationService.createNotification({
              userId: task.assignee_id,
              type: 'task_due_soon',
              title: 'Task Due Tomorrow',
              message: `Task "${task.title}" is due tomorrow`,
              priority: 'high',
              relatedTaskId: task.id,
              relatedProjectId: task.project_id,
              actionUrl: `/tasks/${task.id}`,
            });
          }
        }
      }
    }

    // Check for overdue tasks
    const { data: overdueTasks } = await supabase
      .from('tasks')
      .select('id, title, assignee_id, project_id, due_date')
      .lt('due_date', now.toISOString().split('T')[0])
      .neq('status', 'completed');

    if (overdueTasks) {
      for (const task of overdueTasks) {
        if (task.assignee_id) {
          // Check if we already sent an overdue reminder today
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', task.assignee_id)
            .eq('type', 'task_overdue')
            .eq('related_task_id', task.id)
            .gte('created_at', now.toISOString().split('T')[0])
            .single();

          if (!existingNotification) {
            await notificationService.createNotification({
              userId: task.assignee_id,
              type: 'task_overdue',
              title: 'Overdue Task',
              message: `Task "${task.title}" is overdue`,
              priority: 'urgent',
              relatedTaskId: task.id,
              relatedProjectId: task.project_id,
              actionUrl: `/tasks/${task.id}`,
            });
          }
        }
      }
    }
  };

  return {
    // Expose manual trigger functions if needed
    triggerTaskAssignedNotification: handleTaskCreated,
    triggerTaskUpdatedNotification: handleTaskUpdated,
    triggerDueDateCheck: checkDueDateReminders,
  };
}