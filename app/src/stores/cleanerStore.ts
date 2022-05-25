import { Cleaner } from "../../types/cleaner";
import { devtools } from "zustand/middleware";
import create, { SetState } from "zustand";

export type CleanerState = {
  readonly setCleanerInFocus: (cleaner: Cleaner | null) => void;
  readonly setCleaners: (cleaners: readonly Cleaner[]) => void;
  readonly setPagination: (currentPage: number, totalPages: number) => void;
  readonly cleanerInFocus: Cleaner | null;
  readonly cleaners: readonly Cleaner[];
  readonly currentPage: number;
  readonly totalPages: number;
};

const store = (set: SetState<CleanerState>) => ({
  cleanerInFocus: null,
  cleaners: [],
  currentPage: 0,
  setCleanerInFocus(cleaner: Cleaner | null) {
    set(() => ({
      cleanerInFocus: cleaner,
    }));
  },
  setCleaners(cleaners: readonly Cleaner[]) {
    set(() => ({
      cleaners,
    }));
  },
  setPagination(currentPage: number, totalPages: number) {
    set(() => ({
      currentPage,
      totalPages,
    }));
  },
  totalPages: 0,
});

export const useCleanerStore = create<CleanerState>(devtools(store));
