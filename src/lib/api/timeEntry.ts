import { ApplyBreakResponse, CompleteEntryResponse, ResumeTimerResponse, StartTimeEntryRequest, StartTimeEntryResponse, StopTimeEntryResponse } from "../types";
import api from "./axios";

export const startTimeEntry = async (
  projectId: string,
  data: StartTimeEntryRequest,
): Promise<StartTimeEntryResponse> => {
  const response = await api.post(`/timeEntry/create/${projectId}`, data);

  return response.data;
};

export const stopTimeEntry = async (
    timeEntryId: string,
): Promise<StopTimeEntryResponse> => {
    const response = await api.post(`/timeEntry/stopTimeEntry/${timeEntryId}`)

    return response.data
}

export const applyBreak = async (
    timeEntryId: string
): Promise<ApplyBreakResponse> => {
    const response = await api.post(`/timeEntry/break/${timeEntryId}`)

    return response.data
}

export const resumeTimer = async (
    timeEntryId: string
): Promise<ResumeTimerResponse> => {
    const response = await api.post(`/timeEntry/resume/${timeEntryId}`)

    return response.data
}

export const completeTimeEntry = async (
    timeEntryId: string
): Promise<CompleteEntryResponse> => {
    const response = await api.post(`/timeEntry/complete/${timeEntryId}`)

    return response.data
}