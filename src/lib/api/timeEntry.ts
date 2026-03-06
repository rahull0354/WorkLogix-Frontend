import {
  ApplyBreakResponse,
  CompleteEntryResponse,
  ResumeTimerResponse,
  StartTimeEntryRequest,
  StartTimeEntryResponse,
  StopTimeEntryResponse,
  TimeEntry,
  TimeEntriesListResponse
} from "../types";
import api from "./axios";

export const startTimeEntry = async (
  projectId: string,
  data: StartTimeEntryRequest,
): Promise<StartTimeEntryResponse> => {
  const response = await api.post(`/timeEntry/startTimeEntry/${projectId}`, data);

  // Backend returns { message, success, timeEntry } but we need { entry, message }
  // Transform the response to match the expected type
  return {
    entry: response.data.timeEntry,
    message: response.data.message,
  };
};

export const stopTimeEntry = async (
  timeEntryId: string,
): Promise<StopTimeEntryResponse> => {
  const response = await api.post(`/timeEntry/stopTimeEntry/${timeEntryId}`);

  // Backend returns timeEntry instead of entry
  return {
    entry: response.data.timeEntry || response.data.entry,
    duration: response.data.duration || 0,
    message: response.data.message || "Timer stopped",
  };
};

export const applyBreak = async (
  timeEntryId: string,
): Promise<ApplyBreakResponse> => {
  const response = await api.post(`/timeEntry/break/${timeEntryId}`);

  // Backend returns timeEntry instead of entry
  return {
    entry: response.data.timeEntry || response.data.entry,
    message: response.data.message || "Break applied",
  };
};

export const resumeTimer = async (
  timeEntryId: string,
): Promise<ResumeTimerResponse> => {
  const response = await api.post(`/timeEntry/resume/${timeEntryId}`);

  // Backend returns timeEntry instead of entry
  return {
    entry: response.data.timeEntry || response.data.entry,
    message: response.data.message || "Timer resumed",
  };
};

export const completeTimeEntry = async (
  timeEntryId: string,
): Promise<CompleteEntryResponse> => {
  const response = await api.post(`/timeEntry/complete/${timeEntryId}`);

  // Backend returns timeEntry instead of entry
  return {
    entry: response.data.timeEntry || response.data.entry,
    message: response.data.message || "Time entry completed",
  };
};

export const getTimeEntriesByProject = async (
  projectId: string,
): Promise<TimeEntriesListResponse> => {
  const response = await api.get<any>(
    `/timeEntry/project/${projectId}`,
  );

  const timeEntries = response.data.timeEntries || response.data.entries || [];

  return {
    entries: timeEntries,
    total: response.data.count || response.data.total || timeEntries.length,
    totalHours: 0, // Calculate if needed
  };
};

export const getAllTimeEntries = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  status?: string;
}): Promise<TimeEntriesListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.status) queryParams.append('status', params.status);

  const response = await api.get<any>(
    `/timeEntry/myEntries?${queryParams.toString()}`,
  );

  // Backend returns: { message, success, timeEntries, totalCount, pagination }
  return {
    entries: response.data.timeEntries || [],
    total: response.data.totalCount || 0,
    totalHours: 0,
  };
};

export const deleteTimeEntry = async (
  timeEntryId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/timeEntry/delete/${timeEntryId}`);
  return response.data;
};
