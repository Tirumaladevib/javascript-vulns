import { Checkbox, List, Typography } from "antd";
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
  readonly templates: {  // eslint-disable-line
    readonly id: string;
    readonly title: string;
    readonly checked: boolean;
  }[];
};

const addMeritTemplateSelector = (state: WizardState) =>
  state.addMeritTemplateId;
const removeMeritTemplateSelector = (state: WizardState) =>
  state.removeMeritTemplateId;

export function CreateCleanerTemplatesView({ templates }: Props) {
  const addMeritTemplate = useWizardStore(addMeritTemplateSelector);
  const removeMeritTemplate = useWizardStore(removeMeritTemplateSelector);
  const updateTemplates = (id: string, value: boolean) => {
    if (value) {
      addMeritTemplate(id);
    } else {
      removeMeritTemplate(id);
    }
  };

  return (
    <>
      <header className="wizzard-header">
        <Title className="title">Select a template</Title>
        <Paragraph className="description" type="secondary">
          Select a template to be used with the field name you selected
        </Paragraph>
      </header>
      <Content className="wizzard-content">
        <List
          dataSource={templates}
          renderItem={(item) => (
            <List.Item style={listStyles}>
              <Checkbox
                checked={item.checked}
                onChange={(e) => {
                  updateTemplates(item.id, e.target.checked);
                }}
                style={{ width: "100%" }}
              >
                {item.title}
              </Checkbox>
            </List.Item>
          )}
          style={{ maxWidth: "520px" }}
        />
      </Content>
    </>
  );
}
