export type TimeEntryStatus = 'running' | 'stopped' | 'break' | 'completed';

export interface Break {
  startTime: string;              // ISO date string when break started
  endTime?: string;               // ISO date string when break ended (null if active)
  duration?: number;              // Break duration in seconds
}

export interface TimeEntry {
  _id: string;                    // MongoDB ObjectId
  projectId: string;              // ID of associated project
  userId: string;                 // ID of user who created entry
  description: string;            // Work description
  startTime: string;              // ISO date string - when work started
  endTime?: string;               // ISO date string - when work ended (null if running)
  duration?: number;              // Total duration in seconds
  status: TimeEntryStatus;        // Current status
  breaks: Break[];                // Array of breaks taken
  createdAt: string;              // ISO date string - when entry was created
  updatedAt: string;              // ISO date string - last update time
}

export interface TimeEntryWithDetails extends TimeEntry {
  projectName?: string;           // Project name (from project reference)
  clientName?: string;            // Client name (from project reference)
  hourlyRate?: number;            // Hourly rate (from project)
  earnings?: number;              // Calculated earnings (duration × rate / 3600)
  breakDuration?: number;         // Total break duration in seconds
  workDuration?: number;          // Actual work duration (total - breaks)
}

export interface StartTimeEntryRequest {
  description: string;            // Required: Work description
}

export interface StartTimeEntryResponse {
  entry: TimeEntry;               // Created time entry
  message: string;                // Success message
}

export interface StopTimeEntryResponse {
  entry: TimeEntry;               // Updated time entry with endTime
  duration: number;               // Final duration in seconds
  message: string;                // Success message
}

export interface ApplyBreakResponse {
  entry: TimeEntry;               // Updated entry with new break
  message: string;                // Success message
}

export interface ResumeTimerResponse {
  entry: TimeEntry;               // Updated entry
  message: string;                // Success message
}

export interface CompleteEntryResponse {
  entry: TimeEntry;               // Completed entry
  message: string;                // Success message
}

export interface TimerState {
  activeEntry: TimeEntry | null;  // Currently active time entry
  isRunning: boolean;             // Is timer running?
  isOnBreak: boolean;             // Is timer on break?
  elapsedSeconds: number;         // Elapsed time in seconds
  lastUpdateTime: number;         // Last update timestamp
}

/**
 * Timer store actions
 */
export interface TimerActions {
  setActiveEntry: (entry: TimeEntry | null) => void;
  startTimer: (entry: TimeEntry) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  updateElapsedSeconds: (seconds: number) => void;
  resetTimer: () => void;
}

/**
 * Combined timer state and actions
 */
export type TimerStore = TimerState & TimerActions;

/**
 * Time entry list response
 * Could be returned from a list endpoint
 */
export interface TimeEntriesListResponse {
  entries: TimeEntry[];           // Array of time entries
  total: number;                  // Total count
  totalHours: number;             // Total hours across all entries
}

/**
 * Time entry filters
 * Used for filtering time entries list
 */
export interface TimeEntryFilters {
  projectId?: string;             // Filter by project
  status?: TimeEntryStatus;       // Filter by status
  startDate?: string;             // Filter by start date (ISO)
  endDate?: string;               // Filter by end date (ISO)
  limit?: number;                 // Pagination limit
  skip?: number;                  // Pagination skip
}
