import { Cleaner, ICleaner } from "../../types/cleaner";
import { DeepPartial } from "../utils/DeepPartial";
import { apiClient } from "./api";

type Params = {
  readonly orgId: string;
};

type GetCleanersResponse = {
  readonly cleaners: readonly Cleaner[];
  readonly totalPages: number;
  readonly currentPage: number;
};

export function createCleanerClient({ orgId }: Params) {
  const baseUrl = `/orgs/${orgId}`;

  const createCleaner = (cleaner: ICleaner) =>
    apiClient.post<ICleaner, Cleaner>(`${baseUrl}/cleaners`, cleaner);
  const getCleaners = () =>
    apiClient.get<GetCleanersResponse>(`${baseUrl}/cleaners`);
  const getCleaner = (id: string) =>
    apiClient.get<Cleaner>(`${baseUrl}/cleaners/${id}`);
  const updateCleaner = (id: string, cleaner: DeepPartial<Cleaner>) =>
    apiClient.patch<DeepPartial<Cleaner>>(`${baseUrl}/cleaners/${id}`, cleaner);
  const deleteCleaner = (id: string) =>
    apiClient.delete(`${baseUrl}/cleaners/${id}`);

  return {
    createCleaner,
    deleteCleaner,
    getCleaner,
    getCleaners,
    updateCleaner,
  };
}
