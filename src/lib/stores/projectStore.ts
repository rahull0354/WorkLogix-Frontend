import { create } from "zustand";
import { Project, ProjectStore } from "@/lib/types";
import {
  getMyProjects,
  createProject as apiCreateProject,
  updateProject,
  changeProjectStatus,
  deleteProject,
} from "@/lib/api";

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  setProjects: (projects: Project[]) => {
    set({ projects, error: null });
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === id ? { ...p, ...updates } : p,
      ),
      selectedProject:
        state.selectedProject?._id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    }));
  },

  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== id),
      selectedProject:
        state.selectedProject?._id === id ? null : state.selectedProject,
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

export const fetchProjects = async () => {
  const { setProjects, setLoading, setError } = useProjectStore.getState();

  try {
    setLoading(true);
    const projects = await getMyProjects();
    setProjects(projects);
    return { success: true, projects };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch projects";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

export const createProject = async (data: {
  projectName: string;
  clientName: string;
  hourlyRate: number;
  description: string;
}) => {
  const { addProject, setLoading, setError } = useProjectStore.getState();

  try {
    setLoading(true);
    const response = await apiCreateProject(data);
    addProject(response.project);
    return { success: true, project: response.project };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create project";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

export const updateProjectData = async (
  id: string,
  data: {
    projectName?: string;
    clientName?: string;
    hourlyRate?: number;
    description?: string;
  }
) => {
  const {
    updateProject: updateProjectInStore,
    setLoading,
    setError,
  } = useProjectStore.getState();

  try {
    setLoading(true);
    const updatedProject = await updateProject(id, data);
    updateProjectInStore(id, updatedProject);
    return { success: true, project: updatedProject };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update project";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

export const changeProjectStatusAction = async (
  id: string,
  status: "active" | "hold" | "completed"
) => {
  const {
    updateProject: updateProjectInStore,
    setLoading,
    setError,
  } = useProjectStore.getState();

  try {
    setLoading(true);
    const updatedProject = await changeProjectStatus(id, { status });
    updateProjectInStore(id, updatedProject);
    return { success: true, project: updatedProject };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to change status of project";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

export const deleteProjectAction = async (id: string) => {
  const {
    deleteProject: deleteProjectFromStore,
    setLoading,
    setError,
  } = useProjectStore.getState();

  try {
    setLoading(true);
    // Call the API delete function, not recursively
    await deleteProject(id);
    deleteProjectFromStore(id);
    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete project";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};
