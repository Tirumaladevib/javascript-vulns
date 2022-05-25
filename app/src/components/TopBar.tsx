import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import React, { CSSProperties } from "react";
import Title from "antd/lib/typography/Title";

const removeDefaultStyle: CSSProperties = {
  background: "none",
  border: "none",
  boxShadow: "none",
  padding: 0,
};

export type Props = {
  readonly title?: string;
  readonly description?: string;
  readonly action?: () => void;
};

export const TopBar = ({ action, description, title }: Props) => (
  <div className="top-bar">
    <div>
      <Title className="top-bar-title" level={4}>
        {title}
      </Title>
      <Title className="top-bar-description" level={5} style={{ margin: 0 }}>
        {description}
      </Title>
    </div>
    <Button
      className="top-bar-action"
      onClick={action}
      style={removeDefaultStyle}
    >
      <CloseOutlined />
    </Button>
  </div>
);
