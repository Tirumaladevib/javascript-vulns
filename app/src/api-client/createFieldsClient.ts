import { apiClient } from "./api";

type Field = {
  readonly id: string;
  readonly fieldName: string;
  readonly fieldType: string;
};

export function createFieldsClient() {
  const getOrgFields = () => apiClient.get<readonly Field[]>("/fields");

  return {
    getOrgFields,
  };
}
