import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  MoreVertical,
  ChevronDown,
  Check,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import TaskFormModal from "./TaskFormModal";

const UpcomingScreen = () => {
  const { tasks, toggleTaskComplete, deleteTask } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Get upcoming tasks (excluding today)
  const upcomingTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks
      .filter((task) => {
        const taskDate = task.startDate || task.dueDate;
        return taskDate && taskDate > today;
      })
      .sort((a, b) => {
        const dateA = a.startDate || a.dueDate || "";
        const dateB = b.startDate || b.dueDate || "";
        return dateA.localeCompare(dateB);
      });
  }, [tasks]);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: typeof tasks } = {};
    upcomingTasks.forEach((task) => {
      const date = task.startDate || task.dueDate || "";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });
    return groups;
  }, [upcomingTasks]);

  // Generate calendar dates for current month
  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

    const dates = [];
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(taskId),
      },
    ]);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      weekday: "long",
    };

    const dateStr = date.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dateStr === todayStr) {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • Today • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    } else if (dateStr === tomorrowStr) {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • Tomorrow • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    } else {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      const taskDate = task.startDate || task.dueDate;
      return taskDate === dateStr;
    }).length;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Upcoming</Text>
            <Text className="text-gray-500 text-sm">
              {upcomingTasks.length} upcoming tasks
            </Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Month Selector */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth(-1)}>
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)}>
              <ChevronRight size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Mini Calendar */}
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              {weekDays.map((day, index) => (
                <Text
                  key={index}
                  className="text-gray-500 text-sm font-medium w-8 text-center"
                >
                  {day}
                </Text>
              ))}
            </View>

            <View className="flex-wrap flex-row">
              {calendarDates.slice(0, 35).map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isToday =
                  date.toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0];
                const taskCount = getTasksForDate(date);

                return (
                  <View
                    key={index}
                    className="w-8 h-8 items-center justify-center mb-2"
                    style={{ width: "14.28%" }}
                  >
                    <View
                      className={`w-7 h-7 rounded-full items-center justify-center ${
                        isToday ? "bg-red-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isToday
                            ? "text-white"
                            : isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    {taskCount > 0 && (
                      <View className="w-1 h-1 bg-red-400 rounded-full mt-1" />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Tasks */}
        <View className="px-4 py-4">
          {Object.keys(groupedTasks).length === 0 ? (
            <View className="bg-white rounded-lg p-6 items-center">
              <Text className="text-gray-500 text-center">
                No upcoming tasks. All caught up! 🎉
              </Text>
            </View>
          ) : (
            Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <View key={date} className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  {formatDate(date)}
                </Text>

                {dateTasks.map((task) => (
                  <View
                    key={task.id}
                    className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                  >
                    <View className="flex-row items-start">
                      <TouchableOpacity
                        className={`w-6 h-6 rounded-full border-2 mr-3 mt-1 items-center justify-center ${
                          task.isCompleted
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                        onPress={() => toggleTaskComplete(task.id)}
                      >
                        {task.isCompleted && <Check size={16} color="white" />}
                      </TouchableOpacity>

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text
                            className={`text-base font-medium ${
                              task.isCompleted
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </Text>
                          <Flag
                            size={14}
                            color={getPriorityColor(task.priority)}
                            className="ml-2"
                          />
                        </View>

                        {task.description && (
                          <Text className="text-gray-600 text-sm mb-2">
                            {task.description}
                          </Text>
                        )}

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500 mr-3">
                              {task.category}
                            </Text>

                            {task.dueDate &&
                              task.dueDate !== task.startDate && (
                                <View className="flex-row items-center mr-3">
                                  <Calendar size={12} color="#9CA3AF" />
                                  <Text className="text-xs text-gray-500 ml-1">
                                    Due: {task.dueDate}
                                  </Text>
                                </View>
                              )}

                            {task.tags.length > 0 && (
                              <View className="flex-row items-center">
                                <Tag size={12} color="#9CA3AF" />
                                <Text className="text-xs text-gray-500 ml-1">
                                  {task.tags.slice(0, 2).join(", ")}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View className="flex-row items-center">
                            <TouchableOpacity
                              className="p-2 mr-1"
                              onPress={() => handleEditTask(task)}
                            >
                              <Edit size={16} color="#6B7280" />
                            </TouchableOpacity>

                            <TouchableOpacity
                              className="p-2"
                              onPress={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 size={16} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        isEditing={!!editingTask}
      />
    </View>
  );
};

export default UpcomingScreen;
