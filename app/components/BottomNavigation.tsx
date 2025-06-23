import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, Search, Menu } from "lucide-react-native";

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabPress }: BottomNavigationProps) => {
  const tabs = [
    { id: "today", label: "Today", icon: "23" },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "search", label: "Search", icon: Search },
    { id: "browse", label: "Browse", icon: Menu },
  ];

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-2">
      <View className="flex-row justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isSearch = tab.id === "search";
          const isBrowse = tab.id === "browse";

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              className="items-center py-2 px-4"
            >
              <View className="items-center">
                {tab.id === "today" ? (
                  <View
                    className={`w-8 h-8 rounded items-center justify-center ${
                      isActive ? "bg-red-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    >
                      23
                    </Text>
                  </View>
                ) : (
                  <View
                    className={`w-8 h-8 rounded items-center justify-center ${
                      isActive
                        ? isSearch
                          ? "bg-red-500"
                          : isBrowse
                            ? "bg-red-500"
                            : "bg-red-500"
                        : "bg-transparent"
                    }`}
                  >
                    {React.createElement(tab.icon as any, {
                      size: 20,
                      color: isActive ? "white" : "#6B7280",
                    })}
                  </View>
                )}
                <Text
                  className={`text-xs mt-1 ${
                    isActive ? "text-red-500 font-medium" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavigation;
