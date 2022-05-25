import { Cleaner, ICleaner } from "../../types/cleaner";
import { CleanerState, useCleanerStore } from "../stores/cleanerStore";
import { DeepPartial } from "../utils/DeepPartial";
import { UserState, useUserStore } from "../stores/userStore";
import { createCleanerClient } from "../api-client/createCleanerClient";
import { useCallback } from "react";

const orgIdSelector = (state: UserState) => state.orgId;
const setCleanersSelector = (state: CleanerState) => state.setCleaners;
const setPaginationSelector = (state: CleanerState) => state.setPagination;
const cleanersSelector = (state: CleanerState) => state.cleaners;

export function useCleanerService() {
  const orgId = useUserStore(orgIdSelector);
  const cleanerClient = createCleanerClient({ orgId });
  const setCleaners = useCleanerStore(setCleanersSelector);
  const setPagination = useCleanerStore(setPaginationSelector);
  const cleaners = useCleanerStore(cleanersSelector);

  const getCleaners = useCallback(async () => {
    try {
      const res = await cleanerClient.getCleaners();

      if (res.cleaners && res.cleaners.length === 0 && cleaners.length === 0) { // eslint-disable-line
        return;
      }

      setCleaners(res.cleaners);
      setPagination(res.currentPage, res.totalPages);
    } catch (err: unknown) {
      // do nothing
    }
  }, [cleaners, setCleaners, cleanerClient, setPagination]);

  const getCleaner = useCallback(
    async (cleanerId: string) => {
      try {
        const res = await cleanerClient.getCleaner(cleanerId);
        setCleaners([...cleaners, res]);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [setCleaners, cleaners, cleanerClient]
  );

  const createCleaner = useCallback(
    async (
      data: ICleaner & { readonly meritTemplateIds: readonly string[] }
    ) => {
      try {
        const { meritTemplateIds } = data;
        const createCleanerPayload: ICleaner = {
          ...data,
          active: true,
          meritTemplates: meritTemplateIds.map((id) => ({ active: true, id })),
        };
        const res = await cleanerClient.createCleaner(createCleanerPayload);
        setCleaners([res, ...cleaners]);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [setCleaners, cleaners, cleanerClient]
  );

  const updateCleaner = useCallback(
    async (cleanerId: string, data: DeepPartial<Cleaner>) => {
      try {
        await cleanerClient.updateCleaner(cleanerId, data);
        const cleanerItemIdx = cleaners.findIndex(
          (cleaner) => cleaner.id === cleanerId
        );
        const updatedCleaner = {
          ...cleaners[cleanerItemIdx],
          ...data,
        };
        const newSet = Object.assign([], cleaners, {
          [cleanerItemIdx]: updatedCleaner,
        });
        setCleaners(newSet);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [cleaners, cleanerClient, setCleaners]
  );

  const deleteCleaner = useCallback(
    async (cleanerId: string) => {
      try {
        await cleanerClient.deleteCleaner(cleanerId);
        const filteredCleaners = cleaners.filter(
          (cleaner) => cleaner.id !== cleanerId
        );
        setCleaners(filteredCleaners);
      } catch (err: unknown) {
        // do nothing
      }
    },
    [cleaners, setCleaners, cleanerClient]
  );

  return {
    createCleaner,
    deleteCleaner,
    getCleaner,
    getCleaners,
    updateCleaner,
  };
}
