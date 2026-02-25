export interface User {
  _id: string;                    // MongoDB ObjectId
  username: string;               // Unique username
  email: string;                  // User email
  fullname: string;               // Full name
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;                  // JWT token for authentication
  user: User;                     // User object
}

export interface RegisterRequest {
  username: string;               // Required: Unique username
  email: string;                  // Required: Valid email
  password: string;               // Required: Min 6 chars
  fullname: string;               // Required: Full display name
}

export interface RegisterResponse {
  token: string;                  // JWT token
  user: User;                     // Created user object
  message?: string;               // Optional success message
}

export interface UpdateUserRequest {
  email?: string;                 // Optional: New email
  fullname?: string;              // Optional: New full name
}

export interface UserProfile extends User {
  // Can add additional profile fields here if needed
  totalProjects?: number;         // Total number of projects
  totalHours?: number;            // Total tracked hours
}

export interface AuthState {
  user: User | null;              // Current logged-in user
  token: string | null;           // JWT token
  isAuthenticated: boolean;       // Login status
  isLoading: boolean;            // Auth loading state
}

export interface AuthActions {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;
