import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { X, Calendar, Tag, Flag, Folder, Repeat } from "lucide-react-native";
import { useTask, Task, Project } from "../contexts/TaskContext";

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  task?: Task;
  isEditing?: boolean;
}

const TaskFormModal = ({
  visible,
  onClose,
  task,
  isEditing = false,
}: TaskFormModalProps) => {
  const { addTask, updateTask, projects } = useTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [tags, setTags] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showRecurringDropdown, setShowRecurringDropdown] = useState(false);

  useEffect(() => {
    if (task && isEditing) {
      setTitle(task.title);
      setDescription(task.description);
      setStartDate(task.startDate);
      setDueDate(task.dueDate || "");
      setCategory(task.category);
      setPriority(task.priority);
      setTags(task.tags.join(", "));
      setProjectId(task.projectId || "");
      setIsRecurring(task.isRecurring);
      setRecurringType(task.recurringType || "daily");
    } else {
      resetForm();
    }
  }, [task, isEditing, visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setCategory("Personal");
    setPriority("medium");
    setTags("");
    setProjectId("");
    setIsRecurring(false);
    setRecurringType("daily");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      startDate,
      dueDate: dueDate || undefined,
      category,
      priority,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      projectId: projectId || undefined,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
      isCompleted: false,
    };

    if (isEditing && task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }

    onClose();
    resetForm();
  };

  const priorities = [
    { value: "high", label: "High Priority", color: "#EF4444" },
    { value: "medium", label: "Medium Priority", color: "#F59E0B" },
    { value: "low", label: "Low Priority", color: "#10B981" },
  ];

  const recurringOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-xl font-bold">
            {isEditing ? "Edit Task" : "New Task"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Title */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Dates */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-base font-medium mb-2">Start Date</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3">
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  className="ml-2 flex-1 text-base"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-base font-medium mb-2">Due Date</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3">
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  className="ml-2 flex-1 text-base"
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
            </View>
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Category</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              placeholder="Enter category"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          {/* Priority */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Priority</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-3"
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <View className="flex-row items-center">
                <Flag
                  size={20}
                  color={priorities.find((p) => p.value === priority)?.color}
                />
                <Text className="ml-2 text-base">
                  {priorities.find((p) => p.value === priority)?.label}
                </Text>
              </View>
            </TouchableOpacity>

            {showPriorityDropdown && (
              <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    className="flex-row items-center px-3 py-3 border-b border-gray-100"
                    onPress={() => {
                      setPriority(p.value as "high" | "medium" | "low");
                      setShowPriorityDropdown(false);
                    }}
                  >
                    <Flag size={20} color={p.color} />
                    <Text className="ml-2 text-base">{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Project */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Project</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-3"
              onPress={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              <View className="flex-row items-center">
                <Folder size={20} color="#6B7280" />
                <Text className="ml-2 text-base">
                  {projectId
                    ? projects.find((p) => p.id === projectId)?.name
                    : "Select Project"}
                </Text>
              </View>
            </TouchableOpacity>

            {showProjectDropdown && (
              <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-b border-gray-100"
                  onPress={() => {
                    setProjectId("");
                    setShowProjectDropdown(false);
                  }}
                >
                  <Text className="ml-2 text-base text-gray-500">
                    No Project
                  </Text>
                </TouchableOpacity>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    className="flex-row items-center px-3 py-3 border-b border-gray-100"
                    onPress={() => {
                      setProjectId(project.id);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <View
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: project.color }}
                    />
                    <Text className="text-base">{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Tags */}
          <View className="mb-4">
            <Text className="text-base font-medium mb-2">Tags</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3">
              <Tag size={20} color="#6B7280" />
              <TextInput
                className="ml-2 flex-1 text-base"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChangeText={setTags}
              />
            </View>
          </View>

          {/* Recurring */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-medium">Recurring Task</Text>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full ${isRecurring ? "bg-red-500" : "bg-gray-300"}`}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-white mt-0.5 ${isRecurring ? "ml-6" : "ml-0.5"}`}
                />
              </TouchableOpacity>
            </View>

            {isRecurring && (
              <TouchableOpacity
                className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-3"
                onPress={() => setShowRecurringDropdown(!showRecurringDropdown)}
              >
                <View className="flex-row items-center">
                  <Repeat size={20} color="#6B7280" />
                  <Text className="ml-2 text-base">
                    {
                      recurringOptions.find((r) => r.value === recurringType)
                        ?.label
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {showRecurringDropdown && (
              <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                {recurringOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="flex-row items-center px-3 py-3 border-b border-gray-100"
                    onPress={() => {
                      setRecurringType(
                        option.value as "daily" | "weekly" | "monthly",
                      );
                      setShowRecurringDropdown(false);
                    }}
                  >
                    <Repeat size={20} color="#6B7280" />
                    <Text className="ml-2 text-base">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-lg items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white text-base font-semibold">
              {isEditing ? "Update Task" : "Create Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskFormModal;
