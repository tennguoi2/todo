import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios, { AxiosError } from "axios";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.googleusercontent.com", // Replace with your actual web client ID
  offlineAccess: true,
});

// API Base URL - Replace with your actual backend URL
// For mobile development, use your computer's IP address instead of localhost
// const API_BASE_URL = "http://10.0.2.2:3000/api"; // For Android emulator
const API_BASE_URL = "http://localhost:3000/api"; // For iOS simulator
// const API_BASE_URL = "http://YOUR_COMPUTER_IP:3000/api"; // For physical device

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  // Setup axios interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.log("Token expired, signing out...");
          try {
            await clearAuthData();
            setUser(null);
          } catch (e) {
            console.error("Error during auto signout:", e);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token', 'userToken', 'userData', 'googleToken']);
      delete axios.defaults.headers.common["Authorization"];
      console.log("Auth data cleared successfully");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userData && token) {
        // Verify token is still valid by making a test request
        try {
          const response = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setUser(JSON.parse(userData));
          } else {
            await clearAuthData();
          }
        } catch (error) {
          console.log("Token validation failed, clearing auth data");
          await clearAuthData();
        }
      } else {
        await clearAuthData();
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error?.message || "Invalid credentials";
        console.error("Server error:", errorMessage);
        return false;
      } else if (error.request) {
        // Network error - no response received
        console.error("Network error:", error.message);
        return false;
      } else {
        // Other error
        console.error("Other error:", error.message);
        return false;
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        name,
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error?.message || "Registration failed";
        console.error("Server error:", errorMessage);
        return false;
      } else if (error.request) {
        // Network error - no response received
        console.error("Network error:", error.message);
        return false;
      } else {
        // Other error
        console.error("Other error:", error.message);
        return false;
      }
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data) {
        // Send Google user info to your backend
        const response = await axios.post(`${API_BASE_URL}/auth/google`, {
          googleId: userInfo.data.user.id,
          email: userInfo.data.user.email,
          name: userInfo.data.user.name,
          avatar: userInfo.data.user.photo,
          idToken: userInfo.data.idToken,
        });

        if (response.data.success) {
          const userData = response.data.data.user;
          const token = response.data.data.token;

          // Store user data and token
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", token);

          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Google Sign-In error:", error);
      if (typeof error === "object" && error && "code" in error) {
        const err = error as { code: string };
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log("User cancelled the login flow");
        } else if (err.code === statusCodes.IN_PROGRESS) {
          console.log("Sign in is in progress already");
        } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log("Play services not available");
        }
      }
      return false;
    }
  };

  const signOut = async () => {
    console.log("Starting sign out process...");
    
    try {
      // Get current token for backend signout
      const token = await AsyncStorage.getItem("token");
      
      if (token) {
        try {
          // Call the backend signout endpoint
          await axios.post(`${API_BASE_URL}/auth/signout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Backend signout successful");
        } catch (backendError) {
          console.warn("Backend signout failed, but continuing with local cleanup:", backendError);
        }
      }
      
      // Google sign out (non-critical)
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          await GoogleSignin.signOut();
          console.log("Google signout successful");
        }
      } catch (googleError) {
        console.warn("Google sign out error (non-critical):", googleError);
      }
      
      // Clear local storage
      await clearAuthData();
      setUser(null);
      
      console.log("Sign out completed successfully");
      
    } catch (error) {
      console.error("Critical sign out error:", error);
      // Even if there's an error, try to clear local data
      try {
        await clearAuthData();
        setUser(null);
      } catch (cleanupError) {
        console.error("Failed to clear local data:", cleanupError);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};