import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownUpIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card, CardTitle } from "@/components/atoms/card";
import { ActionDropdown, type ActionDropdownItem } from "@/components/molecules/ActionDropdown";
import { BookmarkCard } from "@/components/molecules/BookmarkCard";
import { BookmarkDialog } from "@/components/molecules/BookmarkDialog";
import { VirtualBookmarkGrid } from "@/components/organisms/VirtualBookmarkGrid";
import { useBookmarkCardActions } from "@/hooks/use-bookmark-card-actions";
import { useBookmarkFilters } from "@/lib/contexts/bookmark-filters";
import { getBookmarksAndSyncCache } from "@/lib/cache/bookmark-cache";
import type { BookmarkListItem } from "@/server/bookmarks";

export const Route = createFileRoute("/_main/home")({
  loader: () => ({
    bookmarks: [] satisfies BookmarkListItem[],
  }),
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  component: RouteComponent,
});

type BookmarkSort = "recently-added" | "recently-visited" | "most-viewed";

const sortOptions = [
  { value: "recently-added", label: "Recently added" },
  { value: "recently-visited", label: "Recently visited" },
  { value: "most-viewed", label: "Most viewed" },
] satisfies Array<ActionDropdownItem & { value: BookmarkSort }>;

function RouteComponent() {
  const { bookmarks: loaderBookmarks } = Route.useLoaderData();
  const { searchTerm, selectedTagIds } = useBookmarkFilters();
  const [bookmarks, setBookmarks] = useState<BookmarkListItem[]>(loaderBookmarks);
  const [selectedSort, setSelectedSort] = useState<BookmarkSort>("recently-added");
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", "active"],
    queryFn: () =>
      getBookmarksAndSyncCache({
        archived: false,
      }),
    placeholderData: loaderBookmarks,
    enabled: typeof window !== "undefined",
  });
  const loadError = bookmarksQuery.error ? "Could not load bookmarks right now." : null;

  useEffect(() => {
    setBookmarks(bookmarksQuery.data ?? loaderBookmarks);
  }, [bookmarksQuery.data, loaderBookmarks]);

  const bookmarkCardActions = useBookmarkCardActions({
    bookmarks,
    setBookmarks,
    archiveMode: "active",
    selectedBookmarkId,
    setSelectedBookmarkId,
    isDetailOpen,
    setIsDetailOpen,
  });
  const filteredBookmarks = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const selectedTagIdsSet = new Set(selectedTagIds);

    const filtered = bookmarks.filter((bookmark) => {
      const matchesTitle =
        normalizedSearchTerm.length === 0 || bookmark.title.toLowerCase().includes(normalizedSearchTerm);
      const matchesTags = selectedTagIdsSet.size === 0 || bookmark.tags.some((tag) => selectedTagIdsSet.has(tag.id));

      return matchesTitle && matchesTags;
    });

    return sortBookmarks(filtered, selectedSort);
  }, [bookmarks, searchTerm, selectedSort, selectedTagIds]);
  const sortDropdownItems = useMemo(
    () =>
      sortOptions.map((option) => ({
        ...option,
        checked: option.value === selectedSort,
      })),
    [selectedSort],
  );

  const handleSortSelect = useCallback((value: string) => {
    if (isBookmarkSort(value)) {
      setSelectedSort(value);
    }
  }, []);
  const renderBookmarkCard = useCallback(
    (bookmark: BookmarkListItem) => (
      <BookmarkCard
        key={bookmark.id}
        bookmark={bookmark}
        onSelect={bookmarkCardActions.handleSelectBookmark}
        onVisit={bookmarkCardActions.handleVisitBookmark}
        onCopyUrl={bookmarkCardActions.handleCopyBookmarkUrl}
        onTogglePin={bookmarkCardActions.handleTogglePin}
        onArchive={bookmarkCardActions.handleArchiveStateChange}
        isTogglingPin={bookmarkCardActions.isTogglingPin(bookmark.id)}
        isArchiving={bookmarkCardActions.isChangingArchiveState(bookmark.id)}
      />
    ),
    [bookmarkCardActions],
  );

  return (
    <main className="flex h-full min-h-0 flex-col gap-24 p-32">
      <div className="flex shrink-0 items-center justify-between gap-16">
        <h1 className="text-preset-1 text-neutral-900 dark:text-neutral-0">All bookmarks</h1>
        <ActionDropdown
          triggerLabel={
            <>
              <ArrowDownUpIcon className="size-20" aria-hidden="true" />
              Sort by
            </>
          }
          className="gap-4 rounded-8 border border-neutral-400 bg-neutral-0 px-12 py-10 text-preset-3 shadow-none dark:border-neutral-dark-400 dark:bg-neutral-dark-800"
          items={sortDropdownItems}
          onSelect={handleSortSelect}
        />
      </div>
      {loadError ? (
        <Card className="items-center gap-12 py-48 text-center dark:bg-neutral-dark-800">
          <CardTitle className="text-neutral-900 dark:text-neutral-0">Could not load bookmarks</CardTitle>
          <p className="max-w-md text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
            The server returned an error. You can retry without leaving this page.
          </p>
          <Button type="button" variant="secondary" className="border" onClick={() => void bookmarksQuery.refetch()}>
            <RefreshCwIcon className="size-20" aria-hidden="true" />
            Retry
          </Button>
        </Card>
      ) : bookmarks.length > 0 && filteredBookmarks.length > 0 ? (
        <VirtualBookmarkGrid bookmarks={filteredBookmarks} renderBookmarkCard={renderBookmarkCard} />
      ) : bookmarks.length > 0 ? (
        <Card className="items-center gap-12 py-48 text-center dark:bg-neutral-dark-800">
          <CardTitle className="text-neutral-900 dark:text-neutral-0">No bookmarks match your filters</CardTitle>
          <p className="max-w-md text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
            Try another title search or uncheck a tag to broaden the list.
          </p>
        </Card>
      ) : (
        <Card className="items-center gap-12 py-48 text-center dark:bg-neutral-dark-800">
          <CardTitle className="text-neutral-900 dark:text-neutral-0">No bookmarks yet</CardTitle>
          <p className="max-w-md text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
            Add your first bookmark to start building a searchable collection.
          </p>
        </Card>
      )}
      <BookmarkDialog
        title="Edit bookmark"
        description="Update your saved link details — change the title, description, URL, or tags anytime."
        submitLabel="Save Bookmark"
        open={isDetailOpen}
        onOpenChange={bookmarkCardActions.handleDetailOpenChange}
        defaultValues={bookmarkCardActions.editBookmarkDefaultValues}
        onSubmit={bookmarkCardActions.handleSubmitBookmark}
      />
    </main>
  );
}

function sortBookmarks(bookmarks: BookmarkListItem[], selectedSort: BookmarkSort) {
  return [...bookmarks].sort((firstBookmark, secondBookmark) => {
    const pinnedSort = Number(secondBookmark.pinned) - Number(firstBookmark.pinned);

    if (pinnedSort !== 0) {
      return pinnedSort;
    }

    if (selectedSort === "recently-visited") {
      return compareDates(getRecentlyVisitedSortDate(secondBookmark), getRecentlyVisitedSortDate(firstBookmark));
    }

    if (selectedSort === "most-viewed") {
      const viewCountSort = secondBookmark.viewCount - firstBookmark.viewCount;

      if (viewCountSort !== 0) {
        return viewCountSort;
      }
    }

    return compareDates(secondBookmark.createdAt, firstBookmark.createdAt);
  });
}

function getRecentlyVisitedSortDate(bookmark: BookmarkListItem) {
  return bookmark.lastViewedAt ?? bookmark.updatedAt ?? bookmark.createdAt;
}

function isBookmarkSort(value: string): value is BookmarkSort {
  return value === "recently-added" || value === "recently-visited" || value === "most-viewed";
}

function compareDates(firstDate: string, secondDate: string) {
  return getDateTime(firstDate) - getDateTime(secondDate);
}

function getDateTime(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}
