import { User } from "../../types/user";
import { apiClient } from "./api";

export function createUserClient() {
  const getUserInfo = () => apiClient.get<User>("/me");

  return {
    getUserInfo,
  };
}

export const userClient = createUserClient();
