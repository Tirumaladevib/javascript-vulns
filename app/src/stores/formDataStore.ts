import { CleanerData } from "../stores/wizardStore";
import { CleanerMeritTemplate } from "../../types/cleaner";
import { DeepPartial } from "../utils/DeepPartial";

type CleanerDataPartial = DeepPartial<CleanerData> & {
  readonly active?: boolean;
  readonly templateId?: string;
  readonly meritTemplates?: DeepPartial<CleanerMeritTemplate>[]; //eslint-disable-line
};

type Action = {
  readonly type: string;
  readonly payload: CleanerDataPartial;
};

export const initialFormData: CleanerDataPartial = {
  active: false,
  description: "",
  fieldId: "",
  fieldName: "",
  fieldType: "",
  meritTemplateIds: [],
  meritTemplates: [],
  name: "",
};

export const withFormReducer = (state: CleanerDataPartial, action: Action) => {
  const { payload } = action;

  switch (action.type) {
    case "SET_CLEANER_INFO": {
      return {
        ...state,
        description: payload.description,
        name: payload.name,
      };
    }
    case "SET_CLEANER_NAME": {
      return {
        ...state,
        name: payload.name,
      };
    }
    case "SET_CLEANER_DESC": {
      return {
        ...state,
        description: payload.description,
      };
    }
    case "SET_FIELD": {
      return {
        ...state,
        fieldId: payload.fieldId,
        fieldName: payload.fieldName,
        fieldType: payload.fieldType,
      };
    }
    case "SET_MERIT_TEMPLATE": {
      const p = payload.meritTemplateIds ?? [];
      const currentTemplateIds = state.meritTemplateIds ?? [];

      return {
        ...state,
        meritTemplateIds: [...currentTemplateIds, ...p],
        meritTemplates: [...currentTemplateIds, ...p].map((el) => ({
          active: true,
          id: el,
        })),
      };
    }
    case "SET_CLEANER_ACTIVE": {
      return {
        ...state,
        active: payload.active,
      };
    }
    case "REMOVE_MERIT_TEMPLATE": {
      const id = payload.templateId;
      const currentTemplateIds = state.meritTemplateIds ?? [];

      return {
        ...state,
        meritTemplateIds: currentTemplateIds.filter((el) => el !== id),
        meritTemplates: currentTemplateIds
          .filter((el) => el !== id)
          .map((el) => ({
            active: true,
            id: el,
          })),
      };
    }
    case "RESET": {
      return initialFormData;
    }
    default: {
      return state;
    }
  }
};
