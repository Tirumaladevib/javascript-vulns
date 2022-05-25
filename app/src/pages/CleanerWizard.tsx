import { Button, Layout, Modal, Space } from "antd";
import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { CreateCleanerFieldsView } from "../components/CreateCleanerFieldsView";
import { CreateCleanerInfoView } from "../components/CreateCleanerInfoView";
import { CreateCleanerTemplatesView } from "../components/CreateCleanerTemplatesView";
import { Footer } from "antd/lib/layout/layout";
import { TopBar } from "../components/TopBar";
import { WizardState, useWizardStore } from "../stores/wizardStore";
import { useCleanerService } from "../services/useCleanerService";
import { useFieldsService } from "../services/useFieldsService";
import { useHistory } from "react-router-dom";
import { useTemplatesService } from "../services/useTemplatesService";
import React, { useEffect, useState } from "react";

const cleanersSelector = (state: CleanerState) => state.cleaners;
const cleanerDataSelector = (state: WizardState) => state.cleanerData;
const fieldsSelector = (state: WizardState) => state.fields;
const templatesSelector = (state: WizardState) => state.templates;
const initialCallSelector = (state: WizardState) => state.initialCallMade;
const resetCleanerDataSelector = (state: WizardState) => state.resetCleanerData;
const setInitialCallSelector = (state: WizardState) => state.setInitialCall;

export const CleanerWizard = () => {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { getFields } = useFieldsService();
  const { getTemplates } = useTemplatesService();
  const { createCleaner } = useCleanerService();

  const cleaners = useCleanerStore(cleanersSelector);
  const cleanerData = useWizardStore(cleanerDataSelector);
  const fields = useWizardStore(fieldsSelector);
  const templates = useWizardStore(templatesSelector);
  const initialCallMade = useWizardStore(initialCallSelector);
  const resetCleanerData = useWizardStore(resetCleanerDataSelector);
  const setInitialCall = useWizardStore(setInitialCallSelector);

  useEffect(() => {
    if (fields.length === 0 && templates.length === 0 && !initialCallMade) {
      getFields();
      getTemplates();
      setInitialCall(true);
    }

    // if templates were populated in another instance
    if (fields.length === 0 && templates.length > 0 && !initialCallMade) {
      getFields();
      setInitialCall(true);
    }
  }, [
    fields,
    templates,
    getFields,
    getTemplates,
    setInitialCall,
    initialCallMade,
  ]);

  const back = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const existingCleanerName = (name: string) => {
    const cleanerNames = cleaners.map((el) => el.name);

    return cleanerNames.includes(name);
  };

  const isStepCompleted = () => {
    switch (step) {
      case 1:
        return (
          Boolean(cleanerData.name) &&
          cleanerData.name.trim().length > 0 &&
          !existingCleanerName(cleanerData.name)
        );
      case 2:
        return Boolean(cleanerData.fieldId);
      case 3:
        return Boolean(cleanerData.meritTemplateIds.length > 0);
      default:
        return false;
    }
  };

  const close = () => {
    resetCleanerData();
    hideModal();
    history.push("/dashboard");
  };

  const finish = async () => {
    setLoading(true);
    await createCleaner(cleanerData);
    resetCleanerData();
    setLoading(false);
    close();
  };

  return (
    <Layout style={{ backgroundColor: "#F5F5F5", minHeight: "100%" }}>
      <TopBar action={showModal} title="Creating a cleaner" />
      {step === 1 && <CreateCleanerInfoView />}
      {step === 2 && (
        <CreateCleanerFieldsView
          fields={fields.map((el) => ({
            ...el,
            checked: el.id === cleanerData.fieldId,
          }))}
        />
      )}
      {step === 3 && (
        <CreateCleanerTemplatesView
          templates={templates
            .filter((template) =>
              template.enabledFieldSettings.find(
                (field) => field.fieldId === cleanerData.fieldId
              )
            )
            .map((el) => ({
              ...el,
              checked: cleanerData.meritTemplateIds.includes(el.id),
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
          {step > 1 ? (
            <Button onClick={back} type="default">
              Back
            </Button>
          ) : null}
          {step < 3 ? (
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
