import {
  ChangeProjectStatusRequest,
  CreateProjectRequest,
  CreateProjectResponse,
  Project,
  UpdateProjectRequest,
} from "../types";
import api from "./axios";

export const createProject = async (
  data: CreateProjectRequest,
): Promise<CreateProjectResponse> => {
  const response = await api.post("project/create", data);

  return response.data;
};

export const getMyProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>("/project/myProjects");

  return response.data;
};

export const getProjectDetails = async (
  projectId: string,
): Promise<Project> => {
  const response = await api.get<any>(
    `/project/projectDetails/${projectId}`,
  );

  // Backend returns: { message, success, projectDetails: {...} }
  return response.data.projectDetails || response.data;
};

export const updateProject = async (
  projectId: string,
  data: UpdateProjectRequest,
): Promise<Project> => {
  const response = await api.put<Project>(`/project/update/${projectId}`, data);

  return response.data;
};

export const changeProjectStatus = async (
  projectId: string,
  status: ChangeProjectStatusRequest,
): Promise<Project> => {
  const response = await api.put<Project>(
    `/project/changeStatus/${projectId}`,
    status,
  );

  return response.data;
};

export const deleteProject = async (
  projectId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/project/delete/${projectId}`);

  return response.data
};


