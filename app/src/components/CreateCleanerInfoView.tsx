import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { Content } from "antd/lib/layout/layout";
import { Form, Input, Typography } from "antd";
import { WizardState, useWizardStore } from "../stores/wizardStore";
import React from "react";
import TextArea from "antd/lib/input/TextArea";

const { Paragraph, Title } = Typography;

const cleanerNameSelector = (state: WizardState) => state.cleanerData.name;
const cleanerDescriptionSelector = (state: WizardState) =>
  state.cleanerData.description;
const cleanersSelector = (state: CleanerState) => state.cleaners;
const cleanerDataSelector = (state: WizardState) => state.cleanerData;
const setCleanerDescriptionSelector = (state: WizardState) =>
  state.setCleanerDescription;
const setCleanerNameSelector = (state: WizardState) => state.setCleanerName;

export const CreateCleanerInfoView = () => {
  const cleanerName = useWizardStore(cleanerNameSelector);
  const cleanerDescription = useWizardStore(cleanerDescriptionSelector);
  const cleaners = useCleanerStore(cleanersSelector);
  const cleanerData = useWizardStore(cleanerDataSelector);
  const setCleanerDescription = useWizardStore(setCleanerDescriptionSelector);
  const setCleanerName = useWizardStore(setCleanerNameSelector);

  const cleanerNameExists = (name: string) => {
    const cleanerNames = cleaners.map((el) => el.name);

    return cleanerNames.includes(name);
  };

  return (
    <>
      <header className="wizzard-header">
        <Title className="title">Cleaner details</Title>
        <Paragraph className="description" type="secondary">
          Set a name and description that makes it easy to differentiate this
          cleaner from others
        </Paragraph>
      </header>
      <Content className="wizzard-content">
        <Form layout="vertical" style={{ maxWidth: "520px" }}>
          <Form.Item
            help={
              cleanerNameExists(cleanerData.name)
                ? "A cleaner with this name already exists!"
                : ""
            }
            label="Cleaner name"
            validateStatus={
              cleanerNameExists(cleanerData.name) ? "error" : "success"
            }
          >
            <Input
              onChange={(e) => {
                setCleanerName(e.target.value);
              }}
              placeholder="Enter a name"
              value={cleanerName}
            />
          </Form.Item>
          <Form.Item label="Cleaner description">
            <TextArea
              onChange={(e) => {
                setCleanerDescription(e.target.value);
              }}
              placeholder="Describe the cleaner"
              rows={4}
              value={cleanerDescription}
            />
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};
