import { devtools } from "zustand/middleware";
import create from "zustand";

export type CleanerData = {
  readonly description: string;
  readonly fieldName: string;
  readonly fieldId: string;
  readonly fieldType: string;
  readonly meritTemplateIds: readonly string[];
  readonly name: string;
};

export type Field = {
  readonly id: string;
  readonly fieldName: string;
  readonly fieldType: string;
};

export type MeritTemplate = {
  readonly id: string;
  readonly title: string;
  readonly enabledFieldSettings: readonly {
    readonly fieldId: string;
  }[];
};

export type WizardState = {
  readonly updateCleanerInfo: (name: string, description: string) => void;
  readonly updateField: (fieldId: string) => void;
  readonly clearField: () => void;
  readonly addMeritTemplateId: (mtId: string) => void;
  readonly removeMeritTemplateId: (mtId: string) => void;
  readonly resetCleanerData: () => void;
  readonly setCleanerDescription: (description: string) => void;
  readonly setCleanerName: (name: string) => void;
  readonly setFields: (fields: readonly Field[]) => void;
  readonly setInitialCall: (value: boolean) => void;
  readonly setTemplates: (templates: readonly MeritTemplate[]) => void;
  readonly cleanerData: CleanerData;
  readonly fields: readonly Field[];
  readonly templates: readonly MeritTemplate[];
  readonly initialCallMade: boolean;
};

export const useWizardStore = create<WizardState>(
  devtools((set) => ({
    addMeritTemplateId(mtId) {
      set((state) => ({
        cleanerData: {
          ...state.cleanerData,
          meritTemplateIds: [...state.cleanerData.meritTemplateIds, mtId],
        },
      }));
    },
    cleanerData: {
      description: "",
      fieldId: "",
      fieldName: "",
      fieldType: "",
      meritTemplateIds: [],
      name: "",
    },
    clearField() {
      set((state) => ({
        ...state,
        cleanerData: {
          ...state.cleanerData,
          fieldId: "",
          fieldName: "",
          fieldType: "",
        },
      }));
    },
    fields: [],
    initialCallMade: false,
    removeMeritTemplateId(mtId) {
      set((state) => ({
        cleanerData: {
          ...state.cleanerData,
          meritTemplateIds: state.cleanerData.meritTemplateIds.filter(
            (el) => el !== mtId
          ),
        },
      }));
    },
    resetCleanerData() {
      set((state) => ({
        ...state,
        cleanerData: {
          description: "",
          fieldId: "",
          fieldName: "",
          fieldType: "",
          meritTemplateIds: [],
          name: "",
        },
      }));
    },
    setCleanerDescription(description: string) {
      set((state) => ({
        cleanerData: {
          ...state.cleanerData,
          description,
        },
      }));
    },
    setCleanerName(name: string) {
      set((state) => ({
        cleanerData: {
          ...state.cleanerData,
          name,
        },
      }));
    },
    setFields(fields) {
      set(() => ({
        fields,
      }));
    },
    setInitialCall(value: boolean) {
      set(() => ({
        initialCallMade: value,
      }));
    },
    setTemplates(templates) {
      set(() => ({
        templates,
      }));
    },
    templates: [],
    updateCleanerInfo(name, description) {
      set((state) => ({
        cleanerData: {
          ...state.cleanerData,
          description,
          name,
        },
      }));
    },
    updateField(fieldId) {
      set((state) => {
        const field = state.fields.find((el) => el.id === fieldId);

        if (field) { // eslint-disable-line
          return {
            ...state,
            cleanerData: {
              ...state.cleanerData,
              fieldId,
              fieldName: field.fieldName,
              fieldType: field.fieldType,
            },
          };
        }

        return {
          ...state,
        };
      });
    },
  }))
);
