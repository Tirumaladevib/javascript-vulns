import { Col, Layout, Row } from "antd";
import React, { ReactNode } from "react";

const { Content } = Layout;

type Props = {
  readonly children: ReactNode;
};

export function WizardLayout({ children }: Props) {
  return (
    <Layout style={{ marginTop: "20%" }}>
      <Content>
        <Row justify="center">
          <Col style={{ maxWidth: 600 }}>{children}</Col>
        </Row>
      </Content>
    </Layout>
  );
}
