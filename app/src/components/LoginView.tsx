import { Button, Col, Image, Layout, Row, Typography } from "antd";
import { Some } from "../utils/Some";
import { UserState, useUserStore } from "../stores/userStore";
import { useHistory } from "react-router-dom";
import { useLoginService } from "../services/useLoginService";
import LoginWithMeritButton from "../images/login-with-merit.svg";
import React, { CSSProperties } from "react";

const { Text, Title } = Typography;

const removeDefaultStyle: CSSProperties = {
  background: "none",
  border: "none",
  boxShadow: "none",
  fontSize: 24,
  margin: 0,
  padding: 0,
};

const userSelector = (state: UserState) => state.user;

export const LoginView = () => {
  const history = useHistory();
  const user = useUserStore(userSelector);

  const { loginWithMerit } = useLoginService();
  async function login(): Promise<void> {
    if (Some(user)) {
      history.push("/dashboard");
    } else {
      await loginWithMerit();
    }
  }

  return (
    <Layout>
      <Layout.Content className="login-layout-container">
        <Row className="full-height-container">
          <Col span={12}>
            <div className="container">
              <Row style={{ marginTop: 70 }}>
                <Title level={1}>Data Cleaning Tool</Title>
              </Row>
              <Row style={{ marginBottom: 80 }}>
                <Text>Create and manage rules for 24/7 data cleaning</Text>
              </Row>
              <Row>
                <Button onClick={login} style={removeDefaultStyle}>
                  <Image
                    alt="Login with merit button"
                    preview={false}
                    src={LoginWithMeritButton}
                  />
                </Button>
              </Row>
              <Row className="login-column-footer">
                <Col span={8}>
                  <a>Help</a>
                  <a>Privacy</a>
                  <a>Terms</a>
                </Col>
                <Col span={8}>© 2021 Merit International Inc.</Col>
              </Row>
            </div>
          </Col>
          <Col className="login-side-image-container" span={12} />
        </Row>
      </Layout.Content>
    </Layout>
  );
};
