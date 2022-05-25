import { MeritTemplate } from "../stores/wizardStore";
import { apiClient } from "./api";

type GetTemplatesResponse = {
  readonly data: {
    readonly templates: readonly MeritTemplate[];
  };
};

export function createTemplatesClient() {
  const getOrgTemplates = () =>
    apiClient.get<GetTemplatesResponse>("/merit-templates");

  return {
    getOrgTemplates,
  };
}
