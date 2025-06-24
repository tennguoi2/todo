import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  Search,
  MoreVertical,
  Check,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Tag,
  Filter,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import TaskFormModal from "./TaskFormModal";

const SearchScreen = () => {
  const { tasks, searchTasks, toggleTaskComplete, deleteTask, projects } =
    useTask();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() || selectedFilter !== "all") {
      let results = searchQuery.trim() ? searchTasks(searchQuery) : tasks;

      // Apply additional filters
      if (selectedFilter !== "all") {
        switch (selectedFilter) {
          case "completed":
            results = results.filter((task) => task.isCompleted);
            break;
          case "pending":
            results = results.filter((task) => !task.isCompleted);
            break;
          case "high":
            results = results.filter((task) => task.priority === "high");
            break;
          case "overdue":
            results = results.filter((task) => {
              if (!task.dueDate || task.isCompleted) return false;
              return new Date(task.dueDate) < new Date();
            });
            break;
        }
      }

      setFilteredTasks(results);
    } else {
      setFilteredTasks([]);
    }
  }, [searchQuery, selectedFilter, tasks]);

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

  const filterOptions = [
    { value: "all", label: "All Tasks" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "high", label: "High Priority" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Search</Text>
          <TouchableOpacity>
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-700"
            placeholder="Search tasks, descriptions, tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Dropdown */}
        <View className="relative">
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2"
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              {filterOptions.find((f) => f.value === selectedFilter)?.label}
            </Text>
          </TouchableOpacity>

          {showFilterDropdown && (
            <View className="absolute top-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className="px-4 py-3 border-b border-gray-100"
                  onPress={() => {
                    setSelectedFilter(option.value);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text className="text-gray-800">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {!searchQuery.trim() ? (
          /* Recently Visited Section */
          <View>
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                className="flex-row items-center py-3 bg-white rounded-lg px-4"
                onPress={() => {
                  setSearchQuery("all");
                  setSelectedFilter("all");
                }}
              >
                <View className="w-8 h-8 bg-red-100 rounded items-center justify-center mr-4">
                  <View className="w-4 h-4 bg-red-500 rounded" />
                </View>
                <Text className="text-lg text-gray-900">View All Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 bg-white rounded-lg px-4"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilter("completed");
                }}
              >
                <View className="w-8 h-8 bg-green-100 rounded items-center justify-center mr-4">
                  <Check size={16} color="#10B981" />
                </View>
                <Text className="text-lg text-gray-900">Completed Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 bg-white rounded-lg px-4"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilter("high");
                }}
              >
                <View className="w-8 h-8 bg-orange-100 rounded items-center justify-center mr-4">
                  <Flag size={16} color="#F59E0B" />
                </View>
                <Text className="text-lg text-gray-900">High Priority</Text>
              </TouchableOpacity>
            </View>

            {/* Search Tips */}
            <View className="mt-6 bg-blue-50 rounded-lg p-4">
              <Text className="text-blue-900 font-semibold mb-2">
                Search Tips:
              </Text>
              <Text className="text-blue-800 text-sm">
                • Search by task title or description
              </Text>
              <Text className="text-blue-800 text-sm">
                • Use tags to find related tasks
              </Text>
              <Text className="text-blue-800 text-sm">
                • Filter by status or priority
              </Text>
            </View>
          </View>
        ) : (
          /* Search Results */
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {filteredTasks.length} result
              {filteredTasks.length !== 1 ? "s" : ""} found
            </Text>

            {filteredTasks.length === 0 ? (
              <View className="bg-white rounded-lg p-6 items-center">
                <Text className="text-gray-500 text-center">
                  No tasks found matching your search.
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
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

                          {task.dueDate && (
                            <View className="flex-row items-center mr-3">
                              <Calendar size={12} color="#9CA3AF" />
                              <Text className="text-xs text-gray-500 ml-1">
                                {task.dueDate}
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
              ))
            )}
          </View>
        )}
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

export default SearchScreen;
