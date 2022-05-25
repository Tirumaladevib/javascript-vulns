import { Button, Layout, Modal, Space } from "antd";
import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { EditCleanerInfoView } from "../components/EditCleanerInfoView";
import { EditCleanerTemplatesView } from "../components/EditCleanerTemplatesView";
import { Footer } from "antd/lib/layout/layout";
import { LoadingScreen } from "../components/LoadingScreen";
import { None } from "../utils/None";
import { Some } from "../utils/Some";
import { TopBar } from "../components/TopBar";
import { WizardState, useWizardStore } from "../stores/wizardStore";
import { initialFormData, withFormReducer } from "../stores/formDataStore";
import { useCleanerService } from "../services/useCleanerService";
import { useHistory, useRouteMatch } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";

const cleanerInFocusSelector = (state: CleanerState) => state.cleanerInFocus;
const cleanersSelector = (state: CleanerState) => state.cleaners;
const setCleanerInFocusSelector = (state: CleanerState) =>
  state.setCleanerInFocus;

const setInitialCallSelector = (state: WizardState) => state.setInitialCall;
const templatesSelector = (state: WizardState) => state.templates;

type Params = {
  readonly cleanerId: string;
};

export const EditCleanerWizard = () => {
  const history = useHistory();
  const [step, setStep] = useState("nameAndDescription");
  const [isLoading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useReducer(withFormReducer, initialFormData);
  const { params }: { readonly params: Params } = useRouteMatch();
  const cleaners = useCleanerStore(cleanersSelector);

  const templates = useWizardStore(templatesSelector);
  const cleanerInFocus = useCleanerStore(cleanerInFocusSelector);
  const setCleanerInFocus = useCleanerStore(setCleanerInFocusSelector);
  const setInitialCall = useWizardStore(setInitialCallSelector);
  const cleaner = cleaners.find((item) => item.id === params.cleanerId) ?? null;

  const { updateCleaner } = useCleanerService();

  useEffect(() => {
    if (Some(cleaner)) {
      setCleanerInFocus(cleaner);
      setFormData({
        payload: {
          description: cleaner.description,
          name: cleaner.name,
        },
        type: "SET_CLEANER_INFO",
      });

      setFormData({
        payload: {
          fieldId: cleaner.fieldId,
          fieldName: cleaner.fieldName,
          fieldType: cleaner.fieldType,
        },
        type: "SET_FIELD",
      });

      setFormData({
        payload: {
          meritTemplateIds: cleaner.meritTemplates.map((m) => m.id),
        },
        type: "SET_MERIT_TEMPLATE",
      });

      setFormData({
        payload: { active: cleaner.active },
        type: "SET_CLEANER_ACTIVE",
      });
    }
  }, [cleaner, setCleanerInFocus, setFormData]);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const back = () => {
    if (step === "templates") {
      setStep("nameAndDescription");
    }
  };

  const next = () => {
    if (step === "nameAndDescription") {
      setStep("templates");
    }
  };

  const close = () => {
    setCleanerInFocus(null);
    setInitialCall(false);
    setFormData({ payload: {}, type: "RESET" });
    hideModal();
    history.push("/dashboard");
  };

  const finish = async () => {
    setLoading(true);
    // removing unused prop
    const { meritTemplateIds, ...rest } = formData; // eslint-disable-line

    await updateCleaner(params.cleanerId, rest);
    setLoading(false);
    close();
  };

  const setCleanerName = (name: string) => {
    setFormData({
      payload: {
        name,
      },
      type: "SET_CLEANER_NAME",
    });
  };

  const setCleanerDesc = (description: string) => {
    setFormData({
      payload: {
        description,
      },
      type: "SET_CLEANER_DESC",
    });
  };

  const setTemplate = (ids: readonly string[]) => {
    setFormData({
      payload: {
        meritTemplateIds: ids,
      },
      type: "SET_MERIT_TEMPLATE",
    });
  };

  const removeTemplate = (id: string) => {
    setFormData({
      payload: {
        templateId: id,
      },
      type: "REMOVE_MERIT_TEMPLATE",
    });
  };

  const isStepCompleted = () => {
    switch (step) {
      case "nameAndDescription":
        if (None(formData.name)) {
          return false;
        }

        return formData.name.trim().length > 0;
      case "templates":
        if (None(formData.meritTemplateIds)) {
          return false;
        }

        return Boolean(formData.meritTemplateIds.length > 0);
      default:
        return false;
    }
  };

  if (None(formData) || None(formData.name) || None(cleanerInFocus)) {
    return (
      <Layout style={{ backgroundColor: "#F5F5F5" }}>
        <TopBar action={showModal} title="Edit cleaner" />

        <LoadingScreen />
      </Layout>
    );
  }

  return (
    <Layout style={{ backgroundColor: "#F5F5F5", minHeight: "100%" }}>
      <TopBar
        action={showModal}
        title={`Edit cleaner ${cleanerInFocus.name}`}
      />
      {step === "nameAndDescription" && (
        <EditCleanerInfoView
          cleaner={{
            description: formData.description ?? "",
            id: params.cleanerId,
            name: formData.name,
          }}
          setCleanerDesc={setCleanerDesc}
          setCleanerName={setCleanerName}
        />
      )}
      {step === "templates" && (
        <EditCleanerTemplatesView
          removeTemplate={removeTemplate}
          setTemplate={setTemplate}
          templates={templates
            .filter((template) =>
              template.enabledFieldSettings.find(
                (field) => field.fieldId === formData.fieldId
              )
            )
            .map((el) => ({
              ...el,
              checked: formData.meritTemplateIds?.includes(el.id) ?? false,
            }))}
        />
      )}
      <Modal
        onCancel={hideModal}
        onOk={close}
        title="Close Page"
        visible={modalVisible}
      >
        Changes you made might not be saved. Are you sure you want to leave this
        page?
      </Modal>
      <Footer className="wizzard-footer">
        <Space>
          {step === "templates" ? (
            <Button onClick={back} type="default">
              Back
            </Button>
          ) : null}
          {step === "nameAndDescription" ? (
            <Button disabled={!isStepCompleted()} onClick={next} type="primary">
              Next
            </Button>
          ) : (
            <Button
              disabled={!isStepCompleted()}
              loading={isLoading}
              onClick={finish}
              type="primary"
            >
              Finish
            </Button>
          )}
        </Space>
      </Footer>
    </Layout>
  );
};
