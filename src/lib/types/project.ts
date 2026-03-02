import type { TimeEntry } from './timeEntry';

export type ProjectStatus = 'active' | 'hold' | 'completed';

export type ProjectType = 'api_development' | 'web_app' | 'mobile_app' | 'consulting' | 'website_redesign';

export interface Project {
  _id: string;                    // MongoDB ObjectId
  userId: string;                 // ID of user who owns project
  projectName: string;            // Project name/title
  clientName: string;             // Client or company name
  hourlyRate: number;             // Hourly rate in currency
  description: string;            // Project description
  projectType: ProjectType;       // Project type/category
  status: ProjectStatus;          // Current status
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string
}

export interface ProjectWithStats extends Project {
  totalEntries?: number;          // Number of time entries
  totalHours?: number;            // Total hours tracked
  totalEarnings?: number;         // Total earnings (hours × rate)
  lastEntry?: string;             // Last work date
  timeEntries?: any[];            // Time entries for this project (backend may include these)
}

export interface CreateProjectRequest {
  projectName: string;            // Required: Project name
  clientName: string;             // Required: Client name
  hourlyRate: number;             // Required: Hourly rate
  description: string;            // Required: Description
  projectType: ProjectType;       // Required: Project type
}

export interface CreateProjectResponse {
  project: Project;               // Created project
  message: string;                // Success message
}

export interface UpdateProjectRequest {
  projectName?: string;           // Optional: New project name
  clientName?: string;            // Optional: New client name
  hourlyRate?: number;            // Optional: New hourly rate
  description?: string;           // Optional: New description
  projectType?: ProjectType;      // Optional: New project type
}

export interface ChangeProjectStatusRequest {
  status: ProjectStatus;          // New status (active/hold/completed)
}

export interface ProjectsListResponse {
  projects: Project[];            // Array of user's projects
  total: number;                  // Total count
}

export interface ProjectDetailsResponse {
  project: Project;               // Project details
  timeEntries?: TimeEntry[];      // Associated time entries (if returned)
  totalHours?: number;            // Total hours on this project
}

export interface ProjectState {
  projects: Project[];            // All projects list
  selectedProject: Project | null; // Currently selected project
  isLoading: boolean;             // Loading state
  error: string | null;           // Error message
}

export interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type ProjectStore = ProjectState & ProjectActions;


