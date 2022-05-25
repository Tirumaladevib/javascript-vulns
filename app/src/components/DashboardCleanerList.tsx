import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { Col } from "antd";
import { DashboardCleanerTable } from "./DashboardCleanerTable";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { useCleanerService } from "../services/useCleanerService";
import React, { useEffect } from "react";

const cleanersSelector = (state: CleanerState) => state.cleaners;
// const currentPageSelector = (state: CleanerState) => state.currentPage;

export const DashboardCleanerList = () => {
  const cleaners = useCleanerStore(cleanersSelector);
  // const currentPage = useCleanerStore(currentPageSelector);
  const { getCleaners } = useCleanerService();

  useEffect(() => {
    if (cleaners.length === 0) {
      getCleaners();
    }
  }, [cleaners, getCleaners]);

  return cleaners.length > 0 ? (
    <Col
      style={{
        borderTop: "solid 1px #a4a4a4",
        padding: 50,
      }}
    >
      <DashboardCleanerTable
        cleaners={cleaners.map((cleaner) => ({ ...cleaner, key: cleaner.id }))}
      />
    </Col>
  ) : (
    <DashboardEmptyState />
  );
};
