import { Button, Col, Image, Row, Typography } from "antd";
import { Link } from "react-router-dom";
import DashboardEmptyStateImage from "../images/dashboard-empty-state.svg";
import React, { CSSProperties } from "react";

const { Paragraph, Title } = Typography;

const ctaButtonStyle: CSSProperties = {
  backgroundColor: "#276AAF",
  borderRadius: "5px",
};

export const DashboardEmptyState = () => (
  <Col className="empty-state-container">
    <Row style={{ marginBottom: 60 }}>
      <Col offset={6} span={12} style={{ textAlign: "center" }}>
        <Image
          alt="computer screen graphics"
          height={120}
          preview={false}
          src={DashboardEmptyStateImage}
        />
      </Col>
    </Row>
    <Row>
      <Col offset={6} span={12}>
        <Title>
          Create correction rules for merit field values to ensure data stays
          golden
        </Title>
      </Col>
    </Row>
    <Row>
      <Col offset={6} span={12}>
        <Paragraph>
          Data cleaners allow for correction rules to be made for specific field
          values for a given field on chosen templates. Once configured, the
          cleanner will continue to monitor for and correct any future instances
          of bad values.
        </Paragraph>
      </Col>
    </Row>
    <Row>
      <Col offset={6} span={12}>
        <Link to="/create-cleaner">
          <Button size="large" style={ctaButtonStyle} type="primary">
            Create data cleaner
          </Button>
        </Link>
      </Col>
    </Row>
  </Col>
);
