import { Checkbox, List, Typography } from "antd";
import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { Content } from "antd/lib/layout/layout";
import { WizardState, useWizardStore } from "../stores/wizardStore";
import React, { CSSProperties } from "react";

const { Paragraph, Title } = Typography;

const listStyles: CSSProperties = {
  backgroundColor: "white",
  marginBottom: "1px",
  padding: "12px",
};

export type Props = {
  readonly fields: { // eslint-disable-line
    readonly id: string;
    readonly fieldName: string;
    readonly fieldType: string;
    readonly checked: boolean;
  }[];
};

const updateFieldSelector = (state: WizardState) => state.updateField;
const clearFieldSelector = (state: WizardState) => state.clearField;
const cleanersSelector = (state: CleanerState) => state.cleaners;

export function CreateCleanerFieldsView({ fields }: Props) {
  const updateField = useWizardStore(updateFieldSelector);
  const clearField = useWizardStore(clearFieldSelector);
  const cleaners = useCleanerStore(cleanersSelector);

  const usedFieldIds = cleaners.map((el) => el.fieldId);

  const toggleField = (id: string, value: boolean) => {
    if (value) {
      updateField(id);
    } else {
      clearField();
    }
  };

  return (
    <>
      <header className="wizzard-header">
        <Title className="title">Select a field</Title>
        <Paragraph className="description" type="secondary">
          Select the field that will be used for this cleaner
        </Paragraph>
      </header>
      <Content className="wizzard-content">
        <List
          dataSource={fields}
          renderItem={(item) => (
            <List.Item style={listStyles}>
              <Checkbox
                checked={item.checked}
                disabled={usedFieldIds.includes(item.id)}
                onChange={(e) => {
                  toggleField(item.id, e.target.checked);
                }}
                style={{ width: "100%" }}
              >
                {item.fieldName}
              </Checkbox>
              <span>{item.fieldType}</span>
            </List.Item>
          )}
          style={{ maxWidth: "520px" }}
        />
      </Content>
    </>
  );
}
