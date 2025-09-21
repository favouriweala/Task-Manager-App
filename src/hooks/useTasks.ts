import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'task-manager-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    }
  }, [tasks, loading]);

  const addTask = (taskData: TaskFormData) => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      completed: false,
      priority: taskData.priority,
      created_by: 'local-user', // Default for local storage usage
      dueDate: taskData.dueDate,
      due_date: taskData.due_date,
      createdAt: new Date(),
      updatedAt: new Date(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: taskData.category,
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, taskData: TaskFormData) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              dueDate: taskData.dueDate,
              category: taskData.category,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              status,
              completed: status === 'done',
              updatedAt: new Date(),
              updated_at: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(
      task => !task.completed && task.dueDate && new Date() > task.dueDate
    ).length;

    return { total, completed, pending, overdue };
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    updateTaskStatus,
    getTaskById,
    getTaskStats,
  };
}