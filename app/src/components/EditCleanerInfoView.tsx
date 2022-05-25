import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { Content } from "antd/lib/layout/layout";
import { Form, Input, Typography } from "antd";
import { None } from "../utils/None";
import React from "react";
import TextArea from "antd/lib/input/TextArea";

const { Paragraph, Title } = Typography;

const cleanersSelector = (state: CleanerState) => state.cleaners;

export const EditCleanerInfoView = (props: {
  readonly cleaner: {
    readonly name: string;
    readonly description: string;
    readonly id: string;
  };
  readonly setCleanerName: (name: string) => void;
  readonly setCleanerDesc: (desc: string) => void;
}) => {
  const { cleaner, setCleanerDesc, setCleanerName } = props;

  const cleaners = useCleanerStore(cleanersSelector);

  const cleanerNameExists = (name: string) => {
    if (None(cleaner)) {
      return false;
    }

    const cleanerWithName = cleaners.find((el) => el.name === name);
    if (None(cleanerWithName)) {
      return false;
    }

    return cleanerWithName.id !== cleaner.id;
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
              cleanerNameExists(cleaner.name)
                ? "A cleaner with this name already exists!"
                : ""
            }
            label="Cleaner name"
            validateStatus={
              cleanerNameExists(cleaner.name) ? "error" : "success"
            }
          >
            <Input
              onChange={(e) => {
                setCleanerName(e.target.value);
              }}
              placeholder="Enter a name"
              value={cleaner.name}
            />
          </Form.Item>
          <Form.Item label="Cleaner description">
            <TextArea
              onChange={(e) => {
                setCleanerDesc(e.target.value);
              }}
              placeholder="Describe the cleaner"
              rows={4}
              value={cleaner.description}
            />
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};
