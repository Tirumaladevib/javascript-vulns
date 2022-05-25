import { Checkbox, List, Typography } from "antd";
import { Content } from "antd/lib/layout/layout";
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
  readonly setTemplate: (ids: readonly string[]) => void;
  readonly removeTemplate: (id: string) => void;
};

export function EditCleanerTemplatesView({
  removeTemplate,
  setTemplate,
  templates,
}: Props) {
  const updateTemplates = (id: string, value: boolean) => {
    if (value) {
      setTemplate([id]);
    } else {
      removeTemplate(id);
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
