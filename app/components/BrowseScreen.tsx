import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
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
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTask } from "../contexts/TaskContext";

const BrowseScreen = () => {
  const { user, signOut } = useAuth();
  const { projects, getStatistics, tasks } = useTask();
  const stats = getStatistics();

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

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded items-center justify-center mr-3">
                <BarChart3 size={16} color="#3B82F6" />
              </View>
              <Text className="text-base text-gray-900">All Tasks</Text>
            </View>
            <Text className="text-gray-500 font-medium">{stats.total}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded items-center justify-center mr-3">
                <CheckCircle size={16} color="#10B981" />
              </View>
              <Text className="text-base text-gray-900">Completed</Text>
            </View>
            <Text className="text-gray-500 font-medium">{stats.completed}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
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

          <TouchableOpacity className="flex-row items-center px-4 py-4">
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

          <TouchableOpacity className="flex-row items-center px-4 py-4">
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
    </View>
  );
};

export default BrowseScreen;
