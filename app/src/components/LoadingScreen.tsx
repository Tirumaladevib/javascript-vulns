import { Spin } from "antd";
import { WizardLayout } from "./WizzardLayout";
import React from "react";

export function LoadingScreen() {
  return (
    <WizardLayout>
      <Spin size="large" />
    </WizardLayout>
  );
}
