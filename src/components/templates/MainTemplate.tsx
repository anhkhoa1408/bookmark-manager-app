import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../organisms/(sidebar)/Sidebar";
import Header from "../organisms/(header)/Header";
import { Outlet } from "@tanstack/react-router";
import type { TagOption } from "@/server/tags";
import { BookmarkFiltersProvider } from "@/lib/contexts/bookmark-filters";
import { getTagsCacheFirst } from "@/lib/cache/tag-cache";

type MainTemplateProps = {
  tags: TagOption[];
  dataLoadError?: string | null;
};

export default function MainTemplate({ tags, dataLoadError = null }: MainTemplateProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsCacheFirst,
    initialData: tags,
    enabled: typeof window !== "undefined",
  });

  const currentTags = tagsQuery.data ?? tags;

  const currentDataLoadError = tagsQuery.error
    ? "Could not load tags right now. Your bookmark pages are still available."
    : dataLoadError;

  const handleTagCheckedChange = (tagId: string, checked: boolean) => {
    setSelectedTagIds((currentTagIds) => {
      if (checked) {
        return currentTagIds.includes(tagId) ? currentTagIds : [...currentTagIds, tagId];
      }

      return currentTagIds.filter((currentTagId) => currentTagId !== tagId);
    });
  };

  return (
    <BookmarkFiltersProvider
      searchTerm={searchTerm}
      selectedTagIds={selectedTagIds}
      onSearchTermChange={setSearchTerm}
      onTagCheckedChange={handleTagCheckedChange}
    >
      <div className="grid h-dvh grid-cols-[296px_minmax(0,1fr)] overflow-hidden">
        <div className="min-h-0 min-w-0">
          <Sidebar tags={currentTags} selectedTagIds={selectedTagIds} onTagCheckedChange={handleTagCheckedChange} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <Header />
          {currentDataLoadError ? (
            <div className="border-b border-red-200 bg-red-50 px-32 py-10 text-preset-4m text-red-700">
              {currentDataLoadError}
            </div>
          ) : null}
          <Outlet />
        </div>
      </div>
    </BookmarkFiltersProvider>
  );
}
