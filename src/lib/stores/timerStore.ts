import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TimeEntry, TimerStore } from "../types";
import {
  applyBreak,
  resumeTimer as resumeTimerApi,
  startTimeEntry,
  stopTimeEntry,
  completeTimeEntry,
} from "../api/timeEntry";

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      activeEntry: null,
      isRunning: false,
      isOnBreak: false,
      elapsedSeconds: 0,
      lastUpdateTime: 0,
      breakSeconds: 0,
      breakStartTime: 0,

      setActiveEntry: (entry: TimeEntry | null) => {
        set({
          activeEntry: entry,
          isRunning: entry?.status === "running",
          isOnBreak: entry?.status === "break",
          elapsedSeconds: 0,
          lastUpdateTime: Date.now(),
          breakSeconds: 0,
          breakStartTime: 0,
        });
      },

      startTimer: (entry: TimeEntry) => {
        set({
          activeEntry: entry,
          isRunning: true,
          isOnBreak: false,
          elapsedSeconds: 0,
          lastUpdateTime: Date.now(),
          breakSeconds: 0,
          breakStartTime: 0,
        });
      },

      stopTimer: () => {
        const state = get();
        const now = Date.now();

        // If currently on break, calculate and save the break duration first
        if (state.isOnBreak && state.breakStartTime > 0) {
          const breakDuration = Math.floor((now - state.breakStartTime) / 1000);
          set({
            isRunning: false,
            isOnBreak: false,
            breakSeconds: state.breakSeconds + breakDuration,
            breakStartTime: 0,
          });
        } else {
          // Not on break, just stop without resetting breakSeconds
          set({
            isRunning: false,
            isOnBreak: false,
          });
        }
      },

      pauseTimer: () => {
        set({
          isRunning: false,
          isOnBreak: true,
          breakStartTime: Date.now(),
        });
      },

      resumeTimer: () => {
        const state = get();
        const now = Date.now();
        // Calculate break duration
        if (state.breakStartTime > 0) {
          const breakDuration = Math.floor((now - state.breakStartTime) / 1000);
          set({
            isRunning: true,
            isOnBreak: false,
            breakSeconds: state.breakSeconds + breakDuration,
            breakStartTime: 0,
            lastUpdateTime: now,
          });
        } else {
          set({
            isRunning: true,
            isOnBreak: false,
            lastUpdateTime: now,
          });
        }
      },

      updateElapsedSeconds: (seconds: number) => {
        set({ elapsedSeconds: seconds });
      },

      updateBreakSeconds: (seconds: number) => {
        set({ breakSeconds: seconds });
      },

      resetTimer: () => {
        set({
          activeEntry: null,
          isRunning: false,
          isOnBreak: false,
          elapsedSeconds: 0,
          lastUpdateTime: 0,
          breakSeconds: 0,
          breakStartTime: 0,
        });
      },
    }),
    {
      name: "timer-storage",
      partialize: (state) => ({
        activeEntry: state.activeEntry,
        isRunning: state.isRunning,
        isOnBreak: state.isOnBreak,
        elapsedSeconds: state.elapsedSeconds,
        lastUpdateTime: state.lastUpdateTime,
        breakSeconds: state.breakSeconds,
        breakStartTime: state.breakStartTime,
      }),
    }
  )
);

export const startTimeEntryAction = async (
  projectId: string,
  description: string
) => {
  const { startTimer, stopTimer } = useTimerStore.getState();

  try {
    console.log("startTimeEntryAction - Calling API with projectId:", projectId);
    const response = await startTimeEntry(projectId, { description });
    console.log("startTimeEntryAction - API Response:", response);
    console.log("startTimeEntryAction - response.entry:", response.entry);

    startTimer(response.entry);

    // Verify the state after starting
    const newState = useTimerStore.getState();
    console.log("startTimeEntryAction - State after startTimer:", {
      activeEntry: newState.activeEntry,
      isRunning: newState.isRunning,
    });

    return { success: true, entry: response.entry };
  } catch (error: any) {
    console.error("startTimeEntryAction - Error:", error);
    console.error("startTimeEntryAction - Error response:", error.response?.data);
    stopTimer();
    return {
      success: false,
      error: error.response?.data?.message || "Failed to start timer",
    };
  }
};

export const stopTimerAction = async () => {
  const { activeEntry, stopTimer } = useTimerStore.getState();

  if (!activeEntry) {
    return { success: false, error: "No Active Timer" };
  }

  try {
    const response = await stopTimeEntry(activeEntry._id);

    // Stop the timer but keep the activeEntry for resume/complete
    stopTimer();

    return { success: true, entry: response.entry };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to stop timer",
    };
  }
};

export const takeBreakAction = async () => {
  const state = useTimerStore.getState();
  console.log("takeBreakAction - Store state:", {
    activeEntry: state.activeEntry,
    isRunning: state.isRunning,
    isOnBreak: state.isOnBreak,
  });

  const { activeEntry, pauseTimer } = state;

  if (!activeEntry) {
    console.log("takeBreakAction - No active entry");
    return { success: false, error: "No active timer" };
  }

  try {
    console.log("takeBreakAction - Calling applyBreak with ID:", activeEntry._id);
    const response = await applyBreak(activeEntry._id);
    console.log("takeBreakAction - Response:", response);
    pauseTimer();
    return {
      success: true,
      entry: response.entry,
    };
  } catch (error: any) {
    console.error("takeBreakAction - Error:", error);
    console.error("takeBreakAction - Error response:", error.response?.data);
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
    const completedEntry = response.entry;

    resetTimer();
    return { success: true, entry: completedEntry };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to complete timer",
    };
  }
};

export const fetchActiveTimeEntry = async () => {
  try {
    // These endpoints don't exist in the backend yet
    // We'll rely entirely on persisted state from localStorage
    // Just verify the stored state is valid
    const state = useTimerStore.getState();

    if (state.activeEntry && state.activeEntry._id) {
      console.log("fetchActiveTimeEntry - Using persisted active entry:", state.activeEntry);
      console.log("fetchActiveTimeEntry - Persisted state:", {
        activeEntry: state.activeEntry,
        isRunning: state.isRunning,
        isOnBreak: state.isOnBreak,
        elapsedSeconds: state.elapsedSeconds,
      });

      // Recalculate elapsed time from stored entry's start time
      if (state.activeEntry.startTime) {
        const startTime = new Date(state.activeEntry.startTime).getTime();
        const now = Date.now();
        let elapsed = Math.floor((now - startTime) / 1000);

        // Subtract break durations
        if (state.activeEntry.breaks && state.activeEntry.breaks.length > 0) {
          state.activeEntry.breaks.forEach((breakItem) => {
            if (breakItem.duration) {
              elapsed -= breakItem.duration;
            }
          });
        }

        const finalElapsed = elapsed > 0 ? elapsed : 0;

        // Update using the store method
        const { updateElapsedSeconds } = useTimerStore.getState();
        updateElapsedSeconds(finalElapsed);

        console.log("fetchActiveTimeEntry - Recalculated elapsed time:", finalElapsed);
      }

      return { success: true, entry: state.activeEntry };
    } else {
      console.log("fetchActiveTimeEntry - No persisted active entry");
      // Don't reset - just return the current state
      return { success: true, entry: null };
    }
  } catch (error: any) {
    console.error("fetchActiveTimeEntry - Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch active timer",
    };
  }
};
