"use client";

import { User, LoginRequest, RegisterRequest } from "@/lib/types";
import { api } from "@/lib/api/axios";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // only run on client side
    if (typeof window === "undefined") return;

    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth: ", error);
        // clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // login dunction
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/user/login", credentials);
        const { accessToken: newToken, user: userData } = response.data;

        // Map backend user structure to our User interface
        const newUser: User = {
          _id: userData.id,
          username: userData.username,
          email: userData.email,
          fullname: userData.username,
        };

        // update data
        setToken(newToken);
        setUser(newUser);

        // store in localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        toast.success(`Welcome back, ${newUser.username}! 🎉`);
        router.push("/dashboard");
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Login failed. Please check your credentials.";
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  // register function
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/user/register", data);
        const { accessToken: newToken, user: userData } = response.data;

        // Map backend user structure to our User interface
        const newUser: User = {
          _id: userData.id,
          username: userData.username,
          email: userData.email,
          fullname: userData.fullname || userData.username,
        };

        // update state
        setToken(newToken);
        setUser(newUser);

        // storing in localstorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        toast.success("Account Created Successfully!");
        router.push("/dashboard");
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  //   logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged Out Successfully!");
    router.push("/login");
  }, [router]);

  //   update user function
  const updateUser = useCallback(
    (data: Partial<User>) => {
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    [user],
  );

  //   refresh user function
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error: any) {
      console.error("Error refreshing User: ", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  const isAuthenticated = !!user && !!token;
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
