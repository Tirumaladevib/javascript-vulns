import { WizardState, useWizardStore } from "../stores/wizardStore";
import { createFieldsClient } from "../api-client/createFieldsClient";
import { useCallback } from "react";

const setFieldsSelector = (state: WizardState) => state.setFields;
export function useFieldsService() {
  const setFields = useWizardStore(setFieldsSelector);
  const { getOrgFields } = createFieldsClient();

  const getFields = useCallback(async () => {
    try {
      const res = await getOrgFields();
      setFields(res);
    } catch (err: unknown) {}
  }, [getOrgFields, setFields]);

  return {
    getFields,
  };
}
