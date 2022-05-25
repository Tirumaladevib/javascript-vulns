import { WizardState, useWizardStore } from "../stores/wizardStore";
import { createTemplatesClient } from "../api-client/createTemplatesClient";
import { useCallback } from "react";

const setTemplatesSelector = (state: WizardState) => state.setTemplates;

export function useTemplatesService() {
  const setTemplates = useWizardStore(setTemplatesSelector);
  const { getOrgTemplates } = createTemplatesClient();

  const getTemplates = useCallback(async () => {
    try {
      const templatesResponse = await getOrgTemplates();
      setTemplates(templatesResponse.data.templates);
    } catch (err: unknown) {}
  }, [getOrgTemplates, setTemplates]);

  return {
    getTemplates,
  };
}
