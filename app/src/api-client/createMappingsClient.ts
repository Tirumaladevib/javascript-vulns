import { Mapping } from "../stores/composerStore";
import { apiClient } from "./api";

type GetMappingsResponse = {
  readonly mappings: readonly Mapping[];
  readonly totalPages: number;
  readonly currentPage: number;
};

type GetMappingsRequestParam = {
  readonly page: number;
  readonly limit?: number;
  readonly searchTerm?: string;
};

export function createMappingsClient() {
  const getCleanerMappings = (
    cleanerId: string,
    data: GetMappingsRequestParam
  ) =>
    apiClient.get<GetMappingsResponse, GetMappingsRequestParam>(
      `/cleaners/${cleanerId}/mappings`,
      data
    );

  const updateCleanerMapping = (cleanerId: string, data: Mapping) =>
    apiClient.post<Mapping>(`/cleaners/${cleanerId}/mappings/${data.id}`, data);

  return {
    getCleanerMappings,
    updateCleanerMapping,
  };
}
