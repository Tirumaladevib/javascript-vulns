import create from "zustand";

export type Mapping = {
  readonly id: string;
  readonly cleanerId: string;
  readonly inputValue: string;
  readonly outputValue: string;
};

export type ComposerState = {
  readonly currentPage: number;
  readonly setCurrentPage: (value: number) => void;
  readonly mappings: readonly Mapping[];
  readonly setMappings: (mappings: readonly Mapping[]) => void;
  readonly updateMapping: (data: Mapping) => void;
  readonly initialCallMade: boolean;
  readonly totalPages: number;
  readonly setTotalPages: (value: number) => void;
  readonly setInitialCallMade: (value: boolean) => void;
};

export const useComposerStore = create<ComposerState>((set) => ({
  currentPage: 0,
  initialCallMade: false,
  mappings: [],

  setCurrentPage(currentPage: number) {
    set({ currentPage });
  },
  setInitialCallMade(value) {
    set(() => ({
      initialCallMade: value,
    }));
  },
  setMappings(mappings) {
    set({ mappings });
  },
  setTotalPages(totalPages: number) {
    set({ totalPages });
  },
  totalPages: 0,
  updateMapping(data) {
    set((state) => ({
      mappings: state.mappings.map((el) =>
        el.id === data.id ? { ...el, ...data } : el
      ),
    }));
  },
}));
