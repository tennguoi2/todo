import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

// const API_BASE_URL = "http://10.0.2.2:3000/api"; // For Android emulator
const API_BASE_URL = "http://localhost:3000/api"; // For iOS simulator
// const API_BASE_URL = "http://YOUR_COMPUTER_IP:3000/api"; // For physical device

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate?: string;
  category: string;
  priority: "high" | "medium" | "low";
  isCompleted: boolean;
  tags: string[];
  projectId?: string;
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addProject: (project: Omit<Project, "id" | "taskCount">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByCategory: (category: string) => Task[];
  getTasksByPriority: (priority: string) => Task[];
  searchTasks: (query: string) => Task[];
  getStatistics: () => {
    completed: number;
    pending: number;
    total: number;
    overdue: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Personal", color: "#3B82F6", taskCount: 0 },
    { id: "2", name: "Work", color: "#EF4444", taskCount: 0 },
    { id: "3", name: "Health", color: "#10B981", taskCount: 0 },
  ]);

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  useEffect(() => {
    saveTasks();
    updateProjectTaskCounts();
  }, [tasks]);

  useEffect(() => {
    saveProjects();
  }, [projects]);

  const loadTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        const backendTasks = response.data.data;
        // Map backend fields to frontend fields
        const validTasks = backendTasks
          .filter((task: any) => task && (task.startDate || task.start_date) && task.title)
          .map((task: any) => ({
            ...task,
            startDate: task.startDate || task.start_date,
            dueDate: task.dueDate || task.due_date,
            isCompleted: task.isCompleted !== undefined ? task.isCompleted : task.is_completed,
            projectId: task.projectId || task.project_id,
            isRecurring: task.isRecurring !== undefined ? task.isRecurring : task.is_recurring,
            recurringType: task.recurringType || task.recurring_type,
            completedAt: task.completedAt || task.completed_at,
            createdAt: task.createdAt || task.created_at
          }));
        setTasks(validTasks);
        await AsyncStorage.setItem("tasks", JSON.stringify(validTasks));
        console.log(`Loaded ${validTasks.length} tasks from backend`);
      } else {
        throw new Error("Backend fetch failed");
      }
    } catch (error) {
      console.error("Error loading tasks from backend:", error);
      // Fallback to local storage
      try {
        const savedTasks = await AsyncStorage.getItem("tasks");
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          const validTasks = Array.isArray(parsedTasks)
            ? parsedTasks.filter((task: any) => task && task.startDate && task.title)
            : [];
          setTasks(validTasks);
          console.log(`Loaded ${validTasks.length} tasks from local storage`);
        } else {
          setTasks([]); // Nếu không có gì trong local storage, set mảng rỗng
          console.log("No tasks found in local storage");
        }
      } catch (localError) {
        console.error("Error loading tasks from local storage:", localError);
        setTasks([]); // Nếu lỗi, set mảng rỗng
      }
    }
  };

  const loadProjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setProjects(response.data.data);
        await AsyncStorage.setItem("projects", JSON.stringify(response.data.data));
        console.log(`Loaded ${response.data.data.length} projects from backend`);
        return;
      }
    } catch (error) {
      console.error("Error loading projects from backend:", error);
    }
    
    // Fallback to local storage
    try {
      const savedProjects = await AsyncStorage.getItem("projects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        console.log("Using default projects");
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const saveProjects = async () => {
    try {
      await AsyncStorage.setItem("projects", JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects:", error);
    }
  };

  const updateProjectTaskCounts = () => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        taskCount: tasks.filter(
          (task) => task.projectId === project.id && !task.isCompleted
        ).length,
      })),
    );
  };

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    try {
      // Validate required fields
      if (!taskData.title || !taskData.startDate) {
        throw new Error("Title and start date are required");
      }

      // Try to create task on backend
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const backendTask = response.data.data;
        // Map backend fields to frontend fields
        const newTask = {
          ...backendTask,
          startDate: backendTask.startDate || backendTask.start_date,
          dueDate: backendTask.dueDate || backendTask.due_date,
          isCompleted: backendTask.isCompleted !== undefined ? backendTask.isCompleted : backendTask.is_completed,
          projectId: backendTask.projectId || backendTask.project_id,
          isRecurring: backendTask.isRecurring !== undefined ? backendTask.isRecurring : backendTask.is_recurring,
          recurringType: backendTask.recurringType || backendTask.recurring_type,
          completedAt: backendTask.completedAt || backendTask.completed_at,
          createdAt: backendTask.createdAt || backendTask.created_at
        };
        setTasks((prev) => [...prev, newTask]);
        console.log("Task created successfully on backend");
      } else {
        throw new Error("Backend creation failed");
      }
    } catch (error) {
      console.error("Error creating task on backend:", error);
      // Fallback to local storage
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
      console.log("Task created locally as fallback");
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Try to update task on backend
      const token = await AsyncStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const updatedTask = response.data.data;
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? {
            ...task,
            ...updatedTask,
            // Map backend fields to frontend fields
            startDate: updatedTask.startDate || updatedTask.start_date,
            dueDate: updatedTask.dueDate || updatedTask.due_date,
            isCompleted: updatedTask.isCompleted !== undefined ? updatedTask.isCompleted : updatedTask.is_completed,
            projectId: updatedTask.projectId || updatedTask.project_id,
            isRecurring: updatedTask.isRecurring !== undefined ? updatedTask.isRecurring : updatedTask.is_recurring,
            recurringType: updatedTask.recurringType || updatedTask.recurring_type,
            completedAt: updatedTask.completedAt || updatedTask.completed_at,
            createdAt: updatedTask.createdAt || updatedTask.created_at
          } : task)),
        );
        console.log("Task updated successfully on backend");
      } else {
        throw new Error("Backend update failed");
      }
    } catch (error) {
      console.error("Error updating task on backend:", error);
      // Fallback to local update
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updates } : task)),
      );
      console.log("Task updated locally as fallback");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Try to delete task on backend
      const token = await AsyncStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        console.log("Task deleted successfully on backend");
      } else {
        throw new Error("Backend deletion failed");
      }
    } catch (error) {
      console.error("Error deleting task on backend:", error);
      // Fallback to local deletion
      setTasks((prev) => prev.filter((task) => task.id !== id));
      console.log("Task deleted locally as fallback");
    }
  };

  const toggleTaskComplete = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      // Try to update task on backend
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/tasks/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedTask = response.data.data;
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? {
            ...task,
            isCompleted: updatedTask.isCompleted !== undefined ? updatedTask.isCompleted : updatedTask.is_completed,
            completedAt: updatedTask.completedAt || updatedTask.completed_at
          } : task)),
        );
        console.log("Task completion toggled successfully on backend");
      } else {
        throw new Error("Backend update failed");
      }
    } catch (error) {
      console.error("Error toggling task completion on backend:", error);
      // Fallback to local update
      const updates = {
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
      };
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updates
              }
            : task,
        ),
      );
      console.log("Task completion toggled locally as fallback");
    }
  };

  const addProject = (projectData: Omit<Project, "id" | "taskCount">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      taskCount: 0,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, ...updates } : project)),
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    // Remove project reference from tasks
    setTasks((prev) =>
      prev.map((task) => (task.projectId === id ? { ...task, projectId: undefined } : task)),
    );
  };

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId);
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter((task) => task.category === category);
  };

  const getTasksByPriority = (priority: string) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const searchTasks = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description.toLowerCase().includes(lowercaseQuery) ||
        task.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  };

  const getStatistics = () => {
    // Add safety check for tasks with missing properties
    const validTasks = tasks.filter(task => task && typeof task.isCompleted === 'boolean');

    const completed = validTasks.filter((task) => task.isCompleted).length;
    const pending = validTasks.filter((task) => !task.isCompleted).length;
    const total = validTasks.length;
    const overdue = validTasks.filter((task) => {
      if (!task.dueDate || task.isCompleted) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    return { completed, pending, total, overdue };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addProject,
        updateProject,
        deleteProject,
        getTasksByProject,
        getTasksByCategory,
        getTasksByPriority,
        searchTasks,
        getStatistics,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
