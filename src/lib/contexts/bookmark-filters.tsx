import { createContext, useContext, type ReactNode } from "react";

type BookmarkFiltersContextValue = {
  searchTerm: string;
  selectedTagIds: string[];
  onSearchTermChange: (searchTerm: string) => void;
  onTagCheckedChange: (tagId: string, checked: boolean) => void;
};

const BookmarkFiltersContext = createContext<BookmarkFiltersContextValue | null>(null);

type BookmarkFiltersProviderProps = BookmarkFiltersContextValue & {
  children: ReactNode;
};

export function BookmarkFiltersProvider({ children, ...value }: BookmarkFiltersProviderProps) {
  return <BookmarkFiltersContext.Provider value={value}>{children}</BookmarkFiltersContext.Provider>;
}

export function useBookmarkFilters() {
  const context = useContext(BookmarkFiltersContext);

  if (!context) {
    throw new Error("useBookmarkFilters must be used within BookmarkFiltersProvider");
  }

  return context;
}
