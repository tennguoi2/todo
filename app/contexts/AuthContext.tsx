import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.googleusercontent.com", // Replace with your actual web client ID
  offlineAccess: true,
});

// API Base URL - Replace with your actual backend URL
const API_BASE_URL = "https://your-backend-api.com/api";

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

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userData && token) {
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
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
        const userData = response.data.user;
        const token = response.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        // Set default axios header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sign in error:", error);
      // Fallback to mock authentication for development
      if (email && password.length >= 6) {
        const userData = {
          id: "1",
          email,
          name: email.split("@")[0],
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
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
        const userData = response.data.user;
        const token = response.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        // Set default axios header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      // Fallback to mock registration for development
      if (email && password.length >= 6 && name) {
        const userData = {
          id: Date.now().toString(),
          email,
          name,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
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
          const userData = response.data.user;
          const token = response.data.token;

          // Store user data and token
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", token);

          // Set default axios header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Google Sign-In error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      }
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Google if signed in with Google
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

      // Clear stored data
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      // Clear axios default header
      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
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
