import { create } from "zustand";
import { TimeEntry, TimerStore } from "../types";
import {
  applyBreak,
  resumeTimer as resumeTimerApi,
  startTimeEntry,
  stopTimeEntry,
  completeTimeEntry,
} from "../api/timeEntry";

export const useTimerStore = create<TimerStore>((set, get) => ({
  activeEntry: null,
  isRunning: false,
  isOnBreak: false,
  elapsedSeconds: 0,
  lastUpdateTime: 0,

  setActiveEntry: (entry: TimeEntry | null) => {
    set({
      activeEntry: entry,
      isRunning: entry?.status === "running",
      isOnBreak: entry?.status === "break",
      elapsedSeconds: 0,
      lastUpdateTime: Date.now(),
    });
  },

  startTimer: (entry: TimeEntry) => {
    set({
      activeEntry: entry,
      isRunning: true,
      isOnBreak: false,
      elapsedSeconds: 0,
      lastUpdateTime: Date.now(),
    });
  },

  stopTimer: () => {
    set({
      isRunning: false,
      isOnBreak: false,
    });
  },

  pauseTimer: () => {
    set({
      isRunning: false,
      isOnBreak: true,
    });
  },

  resumeTimer: () => {
    set({
      isRunning: true,
      isOnBreak: false,
      lastUpdateTime: Date.now(),
    });
  },

  updateElapsedSeconds: (seconds: number) => {
    set({ elapsedSeconds: seconds });
  },

  resetTimer: () => {
    set({
      activeEntry: null,
      isRunning: false,
      isOnBreak: false,
      elapsedSeconds: 0,
      lastUpdateTime: 0,
    });
  },
}));

export const startTimeEntryAction = async (
  projectId: string,
  description: string
) => {
  const { startTimer, stopTimer } = useTimerStore.getState();

  try {
    const response = await startTimeEntry(projectId, { description });
    startTimer(response.entry);
    return { success: true, entry: response.entry };
  } catch (error: any) {
    stopTimer();
    return {
      success: false,
      error: error.response?.data?.message || "Failed to start timer",
    };
  }
};

export const stopTimerAction = async () => {
  const { activeEntry, resetTimer } = useTimerStore.getState();

  if (!activeEntry) {
    return { success: false, error: "No Active Timer" };
  }

  try {
    const response = await stopTimeEntry(activeEntry._id);
    resetTimer();
    return { success: true, entry: response.entry };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to stop timer",
    };
  }
};

export const takeBreakAction = async () => {
  const { activeEntry, pauseTimer } = useTimerStore.getState();

  if (!activeEntry) {
    return { success: false, error: "No active timer" };
  }

  try {
    const response = await applyBreak(activeEntry._id);
    pauseTimer();
    return {
      success: true,
      entry: response.entry,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to take break",
    };
  }
};

export const resumeBreakAction = async () => {
  const { activeEntry, resumeTimer: resumeTimerStore } = useTimerStore.getState();

  if (!activeEntry) {
    return { success: false, error: "No active timer" };
  }

  try {
    const response = await resumeTimerApi(activeEntry._id);
    resumeTimerStore();
    return {
      success: true,
      entry: response.entry,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to resume break",
    };
  }
};

export const completeTimerAction = async () => {
  const { activeEntry, resetTimer } = useTimerStore.getState();

  if (!activeEntry) {
    return { success: false, error: "No active timer" };
  }

  try {
    const response = await completeTimeEntry(activeEntry._id);
    resetTimer();
    return { success: true, entry: response.entry };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to complete timer",
    };
  }
};
