import {
  AutoComplete,
  Button,
  Col,
  Form,
  Image,
  Input,
  Layout,
  List,
  Modal,
  Pagination,
  Row,
  Typography,
} from "antd";
import { Cleaner } from "../../types/cleaner";
import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import {
  ComposerState,
  Mapping,
  useComposerStore,
} from "../stores/composerStore";
import { Content, Footer } from "antd/lib/layout/layout";
import { None } from "../utils/None";
import { OptionData, OptionGroupData } from "rc-select/lib/interface";
import { Some } from "../utils/Some";
import { TopBar } from "../components/TopBar";
import { createMappingsClient } from "../api-client/createMappingsClient";
import { useCleanerService } from "../services/useCleanerService";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useMappingsService } from "../services/useMappingsService";
import React, { CSSProperties, useEffect, useState } from "react";
import RightArrowImage from "../images/right-arrow.svg";
import debounce from "lodash.debounce";

type Params = {
  readonly cleanerId: string;
};

const colLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
};

const cleanerInFocusSelector = (state: CleanerState) => state.cleanerInFocus;
const cleanersSelector = (state: CleanerState) => state.cleaners;
const currentPageSelector = (state: ComposerState) => state.currentPage;
const totalPagesSelector = (state: ComposerState) => state.totalPages;
const mappingsSelector = (state: ComposerState) => state.mappings;
const updateMappingSelector = (state: ComposerState) => state.updateMapping;
const initialCallMadeSelector = (state: ComposerState) => state.initialCallMade;
const setCleanerInFocusSelector = (state: CleanerState) =>
  state.setCleanerInFocus;
const setInitialCallSelector = (state: ComposerState) =>
  state.setInitialCallMade;
const setMappingsSelector = (state: ComposerState) => state.setMappings;
const setCurrentPageSelector = (state: ComposerState) => state.setCurrentPage;
const setTotalPagesSelector = (state: ComposerState) => state.setTotalPages;

type OptionsItem = {
  readonly id: string;
  readonly value: string;
  readonly cleanerId: string;
  readonly inputValue: string;
  readonly outputValue: string;
};

export function RuleComposer() {
  const history = useHistory();
  const { params }: { readonly params: Params } = useRouteMatch();

  const cleanerInFocus = useCleanerStore(cleanerInFocusSelector);
  const cleaners = useCleanerStore(cleanersSelector);
  const currentPage = useComposerStore(currentPageSelector);
  const totalPages = useComposerStore(totalPagesSelector);
  const mappings = useComposerStore(mappingsSelector);
  const updateMapping = useComposerStore(updateMappingSelector);
  const initialCallMade = useComposerStore(initialCallMadeSelector);
  const setCleanerInFocus = useCleanerStore(setCleanerInFocusSelector);
  const setInitialCall = useComposerStore(setInitialCallSelector);
  const setMappings = useComposerStore(setMappingsSelector);
  const setTotalPages = useComposerStore(setTotalPagesSelector);
  const setCurrentPage = useComposerStore(setCurrentPageSelector);

  const { getCleanerMappings } = createMappingsClient();
  const { getMappings, saveMapping } = useMappingsService();
  const { getCleaner } = useCleanerService();

  const [valueUpdated, setValueUpdated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formHasError, setFormHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([] as readonly OptionsItem[]);

  useEffect(() => {
    if (None(cleanerInFocus) && cleaners.length === 0) {
      getCleaner(params.cleanerId);
    } else {
      setCleanerInFocus(
        cleaners.find((item) => item.id === params.cleanerId) ?? null
      );
    }
  }, [
    cleanerInFocus,
    cleaners,
    params.cleanerId,
    getCleaner,
    searchTerm,
    setCleanerInFocus,
  ]);

  useEffect(() => {
    if (Some(cleanerInFocus) && mappings.length === 0 && !initialCallMade) {
      getMappings(cleanerInFocus.id, searchTerm, 1);
      setInitialCall(true);
    }

    history.listen(() => {
      if (history.action === "POP") {
        setCleanerInFocus(null);
        setMappings([]);
        setInitialCall(false);
      }
    });
  }, [
    cleanerInFocus,
    initialCallMade,
    mappings,
    getMappings,
    searchTerm,
    setInitialCall,
    setCleanerInFocus,
    setMappings,
    setOptions,
    history,
  ]);

  const buildOpts = (cleanerMapping: readonly Mapping[]) => {
    if (cleanerMapping.length > 0) {
      const opts = cleanerMapping.map((map) => ({
        cleanerId: map.cleanerId,
        id: map.id,
        inputValue: map.inputValue,
        outputValue: map.outputValue,
        value: map.inputValue,
      }));

      setOptions(opts);
    }
  };

  // useEffect(() => {
  //   buildOpts(mappings);
  // }, [mappings, setOptions]);

  const searchMappingsFromAPI = async (
    cleanerId: string,
    term: string,
    page: number
  ) => {
    try {
      const mappingsResponse = await getCleanerMappings(cleanerId, {
        limit: 20,
        page,
        searchTerm: term,
      });
      buildOpts(mappingsResponse.mappings);
    } catch (err: unknown) {
      // do nothing
    }
  };

  const debouncedHandler = debounce(
    (cleaner: Cleaner, e: string) => searchMappingsFromAPI(cleaner.id, e, 1),
    500
  );

  const searchMappings = (e: string) => {
    if (Some(cleanerInFocus)) {
      setSearchTerm(e);

      // if searchTerm is empty, it means we need to pull out all mappings from the selected cleaner
      if (e === "") {
        getMappings(cleanerInFocus.id, "", 1);
      } else {
        debouncedHandler(cleanerInFocus, e);
      }
    }
  };

  // TODO: find out how to use OptionData or OptionGroupData type properly.
  // This function is to handle the option select for autocomplete component.
  // Since user will always select one option, so we set the total pages and the current page to one.
  const selectMapping = (value: string, opts: OptionData | OptionGroupData) => { // eslint-disable-line
    setMappings([
      {
        cleanerId: opts.cleanerId, // eslint-disable-line
        id: opts.id, // eslint-disable-line
        inputValue: value,
        outputValue: opts.outputValue, // eslint-disable-line
      },
    ]);
    setTotalPages(1);
    setCurrentPage(1);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const validationText = (): string => {
    const fieldType = cleanerInFocus?.fieldType;

    switch (fieldType) {
      case "ShortText":
        return "The output value length exceeds the field's limit of 60 characters";
      case "LongText":
        return "The output value length exceeds the field's limit of 1000 characters";
      default:
        return "Unknown error";
    }
  };

  const validateField = (value: string): boolean => {
    const fieldType = cleanerInFocus?.fieldType;
    const len = value.length;
    let valid = true; // eslint-disable-line
    setFormHasError(false);

    // ShortText has 60 chars limit
    if (fieldType === "ShortText") {
      if (len > 60) {
        valid = false;
        setFormHasError(true);
      }
    }

    // LongText has 1000 chars limit
    if (fieldType === "LongText") {
      if (len > 1000) {
        valid = false;
        setFormHasError(true);
      }
    }

    return valid;
  };

  const updateValue = (item: Mapping, value: string) => {
    setValueUpdated(true);
    updateMapping({ ...item, outputValue: value });
  };

  const goToPage = (page: number) => {
    if (Some(cleanerInFocus)) {
      getMappings(cleanerInFocus.id, searchTerm, page);
    }
  };

  const saveValue = (item: Mapping) => {
    const isValid = validateField(item.outputValue);

    if (isValid && valueUpdated) {
      saveMapping({ ...item, outputValue: item.outputValue.trim() });
      setValueUpdated(false);
    }
  };

  const close = () => {
    setCleanerInFocus(null);
    setMappings([]);
    setInitialCall(false);
    hideModal();
    history.push("/dashboard");
  };

  const saveAndClose = () => {
    if (!formHasError) {
      setValueUpdated(false);
      setFormHasError(false);
      close();
    }
  };

  return Some(cleanerInFocus) ? (
    <Layout style={{ backgroundColor: "#F5F5F5", minHeight: "100%" }}>
      <TopBar
        action={showModal}
        description="Set the rules for field values to be changed to the new value"
        title={cleanerInFocus.name}
      />
      <header className="wizzard-header" style={{ paddingBottom: 14 }}>
        <Row>
          <Col span={11}>
            <Typography.Text># of rules</Typography.Text>
            <AutoComplete
              allowClear
              onChange={(e) => {
                setSearchTerm(e);
              }}
              onSearch={searchMappings}
              onSelect={selectMapping}
              options={[...options]}
              style={{ display: "block", margin: "20px 0" }}
            />
          </Col>
          <Col offset={1}>
            {/* <Typography.Text style={{ display: "block", marginBottom: "20px" }}>
              # of rules not set
            </Typography.Text>
            <Button
              style={{ display: "block", margin: "20px 0" }}
              type="primary"
            >
              Jump to next unset rule
            </Button> */}
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Typography.Text style={colLabel}>
              List of field values
            </Typography.Text>
          </Col>
          <Col offset={1}>
            <Typography.Text style={colLabel}>
              Enter a new rule field value
            </Typography.Text>
          </Col>
        </Row>
      </header>
      <Content className="wizzard-content">
        <Form>
          <List
            dataSource={[...mappings]}
            renderItem={(item) => (
              <List.Item style={{ border: "none" }}>
                <Row style={{ height: "32px", width: "100%" }}>
                  <Col span={11}>
                    <Input disabled value={item.inputValue} />
                  </Col>
                  <Col
                    span={1}
                    style={{
                      height: "inherit",
                      paddingTop: "5px",
                      textAlign: "center",
                    }}
                  >
                    <Image
                      alt="Right arrow"
                      preview={false}
                      src={RightArrowImage}
                    />
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      help={
                        validateField(item.outputValue) ? "" : validationText()
                      }
                      validateStatus={
                        validateField(item.outputValue) ? "success" : "error"
                      }
                    >
                      <Input
                        onBlur={() => {
                          saveValue(item);
                        }}
                        onChange={(e) => {
                          updateValue(item, e.target.value);
                        }}
                        value={item.outputValue}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Form>
      </Content>
      <Modal
        onCancel={hideModal}
        onOk={close}
        title="Close Page"
        visible={modalVisible}
      >
        Changes you made might not be saved. Are you sure you want to leave this
        page?
      </Modal>
      <Footer className="wizzard-footer">
        <div>
          <Pagination
            current={currentPage}
            disabled={totalPages === 0}
            onChange={goToPage}
            showSizeChanger={false}
            style={{ borderRadius: 4 }}
            total={totalPages * 10}
          />
        </div>
        <div>
          <Button
            disabled={formHasError}
            style={{ marginRight: 16, width: 80 }}
            type="default"
          >
            Save
          </Button>
          <Button
            disabled={formHasError}
            onClick={saveAndClose}
            style={{ width: 160 }}
            type="primary"
          >
            Save and close
          </Button>
        </div>
      </Footer>
    </Layout>
  ) : null;
}
