import { Button, Col, Layout, Row, Space, Typography } from "antd";
import { DashboardCleanerList } from "./DashboardCleanerList";
import { Link } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import { UserState, useUserStore } from "../stores/userStore";
import { useLogoutService } from "../services/useLogoutService";
import React, { CSSProperties } from "react";

const { Text, Title } = Typography;
const { Content, Header } = Layout;

const removeDefaultStyle: CSSProperties = {
  background: "none",
  border: "none",
  boxShadow: "none",
  fontSize: 24,
};

const ctaButtonStyle: CSSProperties = {
  backgroundColor: "#276AAF",
  borderRadius: "4px",
  color: "white",
};

const orgTitleSelector = (state: UserState) => state.orgTitle;

export const Dashboard = () => {
  const { logOut } = useLogoutService();
  const orgTitle = useUserStore(orgTitleSelector);

  async function signOut() {
    await logOut();
  }

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <Row className="dashboard-header-container">
          <Col span={8}>
            <Space direction="vertical">
              <Title level={3}>{orgTitle}</Title>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: "center" }}>
            <Text>Data cleaning tool</Text>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button onClick={signOut} style={removeDefaultStyle}>
              <LogoutOutlined />
            </Button>
          </Col>
        </Row>
      </Header>
      <Row className="cta-row">
        <Link style={{ marginLeft: "auto" }} to="/create-cleaner">
          <Button style={ctaButtonStyle}>Create data cleaner</Button>
        </Link>
      </Row>
      <Content className="main-content">
        <DashboardCleanerList />
      </Content>
    </Layout>
  );
};
