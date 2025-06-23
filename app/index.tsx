import React, { useState } from "react";
import { View, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import BottomNavigation from "./components/BottomNavigation";
import TodayScreen from "./components/TodayScreen";
import UpcomingScreen from "./components/UpcomingScreen";
import SearchScreen from "./components/SearchScreen";
import BrowseScreen from "./components/BrowseScreen";
import AuthScreen from "./components/AuthScreen";
import TaskFormModal from "./components/TaskFormModal";

function MainApp() {
  const [activeTab, setActiveTab] = useState("today");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { user, isLoading } = useAuth();

  const renderScreen = () => {
    switch (activeTab) {
      case "today":
        return <TodayScreen />;
      case "upcoming":
        return <UpcomingScreen />;
      case "search":
        return <SearchScreen />;
      case "browse":
        return <BrowseScreen />;
      default:
        return <TodayScreen />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="auto" />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  return (
    <TaskProvider>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="auto" />

        {/* Main Content */}
        <View className="flex-1">{renderScreen()}</View>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute bottom-24 right-6 w-14 h-14 bg-red-500 rounded-2xl items-center justify-center shadow-lg"
          onPress={() => setShowTaskModal(true)}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>

        {/* Task Form Modal */}
        <TaskFormModal
          visible={showTaskModal}
          onClose={() => setShowTaskModal(false)}
        />
      </SafeAreaView>
    </TaskProvider>
  );
}

export default function HomeScreen() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
