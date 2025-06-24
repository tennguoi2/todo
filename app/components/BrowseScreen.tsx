import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  Bell,
  Settings,
  Plus,
  ChevronUp,
  Hash,
  Edit,
  Target,
  LogOut,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Folder,
  X,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTask } from "../contexts/TaskContext";

const BrowseScreen = () => {
  const { user, signOut } = useAuth();
  const { projects, getStatistics, tasks, addProject, deleteProject } =
    useTask();
  const stats = getStatistics();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const getOverdueTasks = () => {
    return tasks.filter((task) => {
      if (!task.dueDate || task.isCompleted) return false;
      return new Date(task.dueDate) < new Date();
    }).length;
  };

  const showTasksByFilter = (filter: string) => {
    let filtered = [];
    let title = "";

    switch (filter) {
      case "all":
        filtered = tasks;
        title = "All Tasks";
        break;
      case "completed":
        filtered = tasks.filter((task) => task.isCompleted);
        title = "Completed Tasks";
        break;
      case "overdue":
        filtered = tasks.filter((task) => {
          if (!task.dueDate || task.isCompleted) return false;
          return new Date(task.dueDate) < new Date();
        });
        title = "Overdue Tasks";
        break;
      case "high":
        filtered = tasks.filter((task) => task.priority === "high");
        title = "High Priority Tasks";
        break;
    }

    setFilteredTasks(filtered);
    setFilterTitle(title);
    setShowTasksModal(true);
  };

  const showProjectTasks = (projectId: string, projectName: string) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    setFilteredTasks(projectTasks);
    setFilterTitle(`${projectName} Tasks`);
    setShowTasksModal(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    addProject({
      name: newProjectName.trim(),
      color: selectedColor,
    });

    setNewProjectName("");
    setSelectedColor("#3B82F6");
    setShowProjectModal(false);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${projectName}"? Tasks in this project will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProject(projectId),
        },
      ],
    );
  };

  const projectColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`,
              }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="text-xl font-bold text-gray-900">
                {user?.name || "User"}
              </Text>
              <Text className="text-sm text-gray-500">{user?.email}</Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity>
              <Bell size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut}>
              <LogOut size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Statistics Overview */}
        <View className="bg-white mt-4 mx-4 rounded-lg p-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <CheckCircle size={24} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </Text>
              <Text className="text-xs text-gray-500">Completed</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Clock size={24} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </Text>
              <Text className="text-xs text-gray-500">Pending</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
                <Calendar size={24} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {getOverdueTasks()}
              </Text>
              <Text className="text-xs text-gray-500">Overdue</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <BarChart3 size={24} color="#8B5CF6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {stats.total}
              </Text>
              <Text className="text-xs text-gray-500">Total</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white mt-4 mx-4 rounded-lg">
          <Text className="text-lg font-bold text-gray-900 px-4 py-4 border-b border-gray-100">
            Quick Actions
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onPress={() => showTasksByFilter("all")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded items-center justify-center mr-3">
                <BarChart3 size={16} color="#3B82F6" />
              </View>
              <Text className="text-base text-gray-900">All Tasks</Text>
            </View>
            <Text className="text-gray-500 font-medium">{stats.total}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onPress={() => showTasksByFilter("completed")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded items-center justify-center mr-3">
                <CheckCircle size={16} color="#10B981" />
              </View>
              <Text className="text-base text-gray-900">Completed</Text>
            </View>
            <Text className="text-gray-500 font-medium">{stats.completed}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
            onPress={() => showTasksByFilter("overdue")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-red-100 rounded items-center justify-center mr-3">
                <Calendar size={16} color="#EF4444" />
              </View>
              <Text className="text-base text-gray-900">Overdue</Text>
            </View>
            <Text className="text-gray-500 font-medium">
              {getOverdueTasks()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => showTasksByFilter("high")}
          >
            <View className="w-8 h-8 bg-orange-100 rounded items-center justify-center mr-3">
              <Target size={16} color="#F59E0B" />
            </View>
            <Text className="text-base text-gray-900">High Priority</Text>
          </TouchableOpacity>
        </View>

        {/* My Projects Section */}
        <View className="bg-white mt-4 mx-4 rounded-lg">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">My Projects</Text>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity>
                <Plus size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity>
                <ChevronUp size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
              onPress={() => showProjectTasks(project.id, project.name)}
              onLongPress={() => handleDeleteProject(project.id, project.name)}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded items-center justify-center mr-3">
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                </View>
                <Text className="text-base text-gray-900">{project.name}</Text>
              </View>
              <Text className="text-gray-500 font-medium">
                {project.taskCount}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Edit size={20} color="#9CA3AF" className="mr-3" />
            <Text className="text-base text-gray-500">Manage projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => setShowProjectModal(true)}
          >
            <Folder size={20} color="#6B7280" className="mr-3" />
            <Text className="text-base text-gray-900">Create new project</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View className="bg-white mt-4 mx-4 mb-6 rounded-lg">
          <Text className="text-lg font-bold text-gray-900 px-4 py-4 border-b border-gray-100">
            Settings
          </Text>

          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Settings size={20} color="#6B7280" className="mr-3" />
            <Text className="text-base text-gray-900">Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Bell size={20} color="#6B7280" className="mr-3" />
            <Text className="text-base text-gray-900">Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" className="mr-3" />
            <Text className="text-base text-red-500">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">New Project</Text>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <Text className="text-base font-medium mb-2">Project Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
              placeholder="Enter project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
            />

            <Text className="text-base font-medium mb-2">Color</Text>
            <View className="flex-row flex-wrap mb-6">
              {projectColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-full mr-3 mb-3 items-center justify-center ${
                    selectedColor === color ? "border-2 border-gray-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <View className="w-4 h-4 bg-white rounded-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-red-500 py-4 rounded-lg items-center"
              onPress={handleCreateProject}
            >
              <Text className="text-white text-base font-semibold">
                Create Project
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tasks Modal */}
      <Modal
        visible={showTasksModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">{filterTitle}</Text>
            <TouchableOpacity onPress={() => setShowTasksModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {filteredTasks.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500 text-center">
                  No tasks found in this category.
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <View key={task.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-4 h-4 rounded-full mr-3 ${
                        task.isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <Text
                      className={`text-base font-medium flex-1 ${
                        task.isCompleted
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </Text>
                  </View>
                  {task.description && (
                    <Text className="text-gray-600 text-sm mb-2 ml-7">
                      {task.description}
                    </Text>
                  )}
                  <View className="flex-row items-center ml-7">
                    <Text className="text-xs text-gray-500 mr-3">
                      {task.category}
                    </Text>
                    {task.dueDate && (
                      <Text className="text-xs text-gray-500">
                        Due: {task.dueDate}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default BrowseScreen;
