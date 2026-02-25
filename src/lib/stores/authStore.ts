import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthStore } from "@/lib/types";
import { getUserProfile, loginUser, registerUser } from "../api/user";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth(user: User, token: string) {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // also storing in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
      },

      // logging out user and clear all auth data
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // clear local storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },

      updateUser(user: User) {
        set({ user });

        // update local storage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }
      },

      // set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage", // localstorage key

      // only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const login = async (email: string, password: string) => {
  const { setAuth, setLoading } = useAuthStore.getState();

  try {
    setLoading(true);
    const response = await loginUser({ email, password });
    setAuth(response.user, response.token);
    return { success: true, user: response.user };
  } catch (error: any) {
    setLoading(false)
    return {
        success: false,
        error: error.response?.data?.message || "login failed"
    }
  }
};

export const register = async (
    username: string,
    email: string,
    password: string,
    fullname: string
) => {
    const {setAuth, setLoading} = useAuthStore.getState()

    try {
        setLoading(true)
        const response = await registerUser({
            username,
            email,
            password,
            fullname
        })
        setAuth(response.user, response.token)
        return {success: true, user: response.user}
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Registration Failed"
        }
    }
}

export const loadUserProfile = async () => {
    const {updateUser, setLoading, logout} = useAuthStore.getState()

    try {
        setLoading(true)
        const user = await getUserProfile()
        updateUser(user)
        setLoading(false)
        return {success: true, user}
    } catch (error) {
        setLoading(false)
        logout()
        return {success: true, error: 'Failed to load profile'}
    }
}