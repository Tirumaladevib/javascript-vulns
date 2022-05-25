import {
  ComposerState,
  Mapping,
  useComposerStore,
} from "../stores/composerStore";
import { createMappingsClient } from "../api-client/createMappingsClient";
import { useCallback } from "react";

const setCurrentPageSelector = (state: ComposerState) => state.setCurrentPage;
const setTotalPagesSelector = (state: ComposerState) => state.setTotalPages;
const setMappingsSelector = (state: ComposerState) => state.setMappings;

export function useMappingsService() {
  const setMappings = useComposerStore(setMappingsSelector);
  const setCurrentPage = useComposerStore(setCurrentPageSelector);
  const setTotalPages = useComposerStore(setTotalPagesSelector);
  const { getCleanerMappings, updateCleanerMapping } = createMappingsClient();

  const getMappings = useCallback(
    async (cleanerId: string, searchTerm: string, page: number) => {
      try {
        const mappingsResponse = await getCleanerMappings(cleanerId, {
          limit: 20,
          page,
          searchTerm,
        });
        setMappings(mappingsResponse.mappings);
        setTotalPages(mappingsResponse.totalPages);
        setCurrentPage(mappingsResponse.currentPage);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [getCleanerMappings, setMappings, setCurrentPage, setTotalPages]
  );

  const saveMapping = useCallback(
    async (updatePayload: Mapping) => {
      try {
        await updateCleanerMapping(updatePayload.id, updatePayload);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [updateCleanerMapping]
  );

  return {
    getMappings,
    saveMapping,
  };
}
