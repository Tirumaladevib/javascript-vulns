/* eslint-disable react/no-multi-comp */
import {
  Badge,
  Button,
  Col,
  Drawer,
  List,
  Modal,
  Row,
  Space,
  Switch,
  Table,
  TableColumnsType,
  Tooltip,
  Typography,
} from "antd";
import { Cleaner } from "../../types/cleaner";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { WizardState, useWizardStore } from "../stores/wizardStore";
import { useCleanerService } from "../services/useCleanerService";
import { useFieldsService } from "../services/useFieldsService";
import { useTemplatesService } from "../services/useTemplatesService";
import React, { useEffect, useState } from "react";

const { Paragraph, Title } = Typography;

type Props = {
  readonly cleaners: readonly Cleaner[];
};

type ActionColumnProp = {
  readonly cleaner: Cleaner;
};

const templatesSelector = (state: WizardState) => state.templates;
const fieldsSelector = (state: WizardState) => state.fields;
// const initialCallMadeSelector = (state: WizardState) => state.initialCallMade;

function CleanerActionColumn({ cleaner }: ActionColumnProp) {
  const templates = useWizardStore(templatesSelector);
  const [drawerVisibility, setDrawerVisibility] = useState(false);
  const { deleteCleaner, updateCleaner } = useCleanerService();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const meritTemplateTitles = cleaner.meritTemplates
    .map((mt) => {
      const template = templates.find((el) => mt.id === el.id);
      if (template !== undefined) {
        return template.title;
      }

      return null;
    })
    .filter((el) => el !== null);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const showLoading = () => {
    setConfirmLoading(true);
  };

  const hideLoading = () => {
    setConfirmLoading(false);
  };

  const closeDrawer = () => {
    setDrawerVisibility(false);
  };

  const showDrawer = () => {
    setDrawerVisibility(true);
  };

  const switchListener = () => {
    updateCleaner(cleaner.id, { active: !cleaner.active });
  };

  const handleDeleteCleaner = async () => {
    showLoading();
    await deleteCleaner(cleaner.id);
    hideLoading();
    hideModal();
  };

  return (
    <>
      <Space size="middle">
        <Link to={`/cleaners/${cleaner.id}/composer`}>
          <Button>Add Rules</Button>
        </Link>
        <Button onClick={showDrawer}>View Details</Button>
      </Space>

      <Drawer
        closable={false}
        onClose={closeDrawer}
        placement="right"
        visible={drawerVisibility}
        width={640}
      >
        <Typography>
          <Title level={2}>{cleaner.name}</Title>
          <Paragraph>{cleaner.description}</Paragraph>
        </Typography>
        <Row>
          <Col span={12}>
            <Switch
              checkedChildren="Active"
              defaultChecked={cleaner.active}
              onChange={switchListener}
              unCheckedChildren="Inactive"
            />
          </Col>
          <Col span={12}>
            <Row justify="end">
              <Col span={4} style={{ textAlign: "right" }}>
                <Tooltip placement="top" title="Edit">
                  <Link to={`/cleaners/${cleaner.id}/edit`}>
                    <Button onClick={showModal} type="text">
                      <EditOutlined style={{ color: "grey", fontSize: 16 }} />
                    </Button>
                  </Link>
                </Tooltip>
              </Col>
              <Col span={4} style={{ textAlign: "right" }}>
                <Tooltip placement="top" title="Delete">
                  <Button onClick={showModal} type="text">
                    <DeleteOutlined style={{ color: "red", fontSize: 16 }} />
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Col>
        </Row>
        <List
          dataSource={meritTemplateTitles}
          header={<Title level={4}>Templates</Title>}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Drawer>
      <Modal
        confirmLoading={confirmLoading}
        onCancel={hideModal}
        onOk={handleDeleteCleaner}
        title="Delete Cleaner"
        visible={modalVisible}
      >
        Are you sure you want to delete?
      </Modal>
    </>
  );
}

const columns: TableColumnsType<Cleaner> = [
  {
    dataIndex: "name",
    key: "name",
    title: "Name",
  },
  {
    dataIndex: "active",
    key: "active",
    render: (text: boolean) => (
      <Space>
        <Badge
          status={text ? "success" : "default"}
          text={text ? "Active" : "Inactive"}
        />
      </Space>
    ),
    title: "Status",
  },
  {
    key: "id",
    render: (cleaner: Cleaner) => <CleanerActionColumn cleaner={cleaner} />,
    title: "Action",
  },
];

export function DashboardCleanerTable({ cleaners }: Props) {
  const templates = useWizardStore(templatesSelector);
  const fields = useWizardStore(fieldsSelector);
  // const initialCallMade = useWizardStore(initialCallMadeSelector);
  const { getTemplates } = useTemplatesService();
  const { getFields } = useFieldsService();

  useEffect(() => {
    if (templates.length === 0) {
      getTemplates();
    }

    if (fields.length === 0) {
      getFields();
    }
  }, [getTemplates, getFields, templates, fields]);

  return (
    <Table
      columns={columns}
      dataSource={cleaners}
      pagination={false}
      rowKey="id"
      sticky={{ offsetHeader: 200 }}
    />
  );
}
