import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  User,
} from "@/lib/types";
import api from "./axios";

export const registerUser = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await api.post("/user/register", data);

  return response.data;
};

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.get<LoginResponse>("/user/login", {
    data: credentials,
  });

  return response.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<any>("/user/profile");

  return response.data.user || response.data;
};

export const updateUser = async (
  userId: string,
  data: UpdateUserRequest,
): Promise<User> => {
  const response = await api.patch<User>(`/user/update`, data);

  return response.data;
};

export const deleteUser = async (): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>("/user/delete");

  return response.data;
};
