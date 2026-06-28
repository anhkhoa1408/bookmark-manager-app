import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import type { BookmarkFormValues } from "@/components/molecules/BookmarkDialog";
import { deleteBookmarkFromCache, syncBookmarkToCache } from "@/lib/cache/bookmark-cache";
import { syncTagsFromServer } from "@/lib/cache/tag-cache";
import {
  archiveBookmark,
  deleteBookmarkPermanently,
  getBookmarkDetail,
  toggleBookmarkPin,
  trackBookmarkView,
  unarchiveBookmark,
  updateBookmark,
  type BookmarkListItem,
} from "@/server/bookmarks";

type BookmarkArchiveMode = "active" | "archived";

type UseBookmarkCardActionsParams = {
  bookmarks: BookmarkListItem[];
  setBookmarks: Dispatch<SetStateAction<BookmarkListItem[]>>;
  archiveMode: BookmarkArchiveMode;
  selectedBookmarkId: string | null;
  setSelectedBookmarkId: Dispatch<SetStateAction<string | null>>;
  isDetailOpen: boolean;
  setIsDetailOpen: Dispatch<SetStateAction<boolean>>;
};

export function useBookmarkCardActions({
  bookmarks,
  setBookmarks,
  archiveMode,
  selectedBookmarkId,
  setSelectedBookmarkId,
  isDetailOpen,
  setIsDetailOpen,
}: UseBookmarkCardActionsParams) {
  const queryClient = useQueryClient();
  const selectedBookmark = bookmarks.find((bookmark) => bookmark.id === selectedBookmarkId) ?? null;
  const isArchivedPage = archiveMode === "archived";

  const bookmarkDetailQuery = useQuery({
    queryKey: ["bookmark-detail", selectedBookmarkId],
    queryFn: () => getBookmarkDetail({ data: { id: selectedBookmarkId ?? "" } }),
    enabled: isDetailOpen && Boolean(selectedBookmarkId),
  });
  const editBookmark = bookmarkDetailQuery.data ?? selectedBookmark;
  const editBookmarkDefaultValues = useMemo(
    () => (editBookmark ? mapBookmarkToFormValues(editBookmark) : undefined),
    [editBookmark],
  );

  const updateBookmarkMutation = useMutation({
    mutationFn: (values: BookmarkFormValues) => {
      if (!selectedBookmarkId) {
        throw new Error("Bookmark id is required");
      }

      return updateBookmark({ data: { id: selectedBookmarkId, ...values } });
    },
    onSuccess: async (updatedBookmark) => {
      toast.success("Bookmark updated");
      await syncBookmarkToCache(updatedBookmark);
      await syncTagsFromServer();
      setBookmarks((currentBookmarks) =>
        updateBookmarkInList(currentBookmarks, updatedBookmark.id, () => updatedBookmark),
      );
      queryClient.setQueryData(["bookmark-detail", updatedBookmark.id], updatedBookmark);
      await queryClient.invalidateQueries({ queryKey: ["bookmark-detail", updatedBookmark.id] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsDetailOpen(false);
      setSelectedBookmarkId(null);
    },
    onError: () => {
      toast.error("Could not update bookmark");
    },
  });

  const toggleBookmarkPinMutation = useMutation({
    mutationFn: (bookmarkId: string) => toggleBookmarkPin({ data: { id: bookmarkId } }),
    onMutate: async (bookmarkId) => {
      const previousBookmarks = bookmarks;
      const previousDetail = queryClient.getQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId]);

      setBookmarks((currentBookmarks) =>
        updateBookmarkInList(currentBookmarks, bookmarkId, (bookmark) => ({
          ...bookmark,
          pinned: !bookmark.pinned,
        })),
      );
      queryClient.setQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId], (bookmark) =>
        bookmark
          ? {
              ...bookmark,
              pinned: !bookmark.pinned,
            }
          : bookmark,
      );

      return { bookmarkId, previousBookmarks, previousDetail };
    },
    onSuccess: async (updatedBookmark) => {
      await syncBookmarkToCache(updatedBookmark);
      setBookmarks((currentBookmarks) =>
        updateBookmarkInList(currentBookmarks, updatedBookmark.id, () => updatedBookmark),
      );
      queryClient.setQueryData(["bookmark-detail", updatedBookmark.id], updatedBookmark);
      await queryClient.invalidateQueries({ queryKey: ["bookmark-detail", updatedBookmark.id] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (_error, _bookmarkId, context) => {
      if (context) {
        setBookmarks(context.previousBookmarks);
        queryClient.setQueryData(["bookmark-detail", context.bookmarkId], context.previousDetail);
      }

      toast.error("Could not update pin");
    },
  });

  const archiveStateMutation = useMutation({
    mutationFn: (bookmarkId: string) =>
      isArchivedPage ? unarchiveBookmark({ data: { id: bookmarkId } }) : archiveBookmark({ data: { id: bookmarkId } }),
    onMutate: async (bookmarkId) => {
      const previousBookmarks = bookmarks;
      const previousDetail = queryClient.getQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId]);

      setBookmarks((currentBookmarks) => currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
      queryClient.setQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId], (bookmark) =>
        bookmark
          ? {
              ...bookmark,
              archived: !isArchivedPage,
            }
          : bookmark,
      );

      return { bookmarkId, previousBookmarks, previousDetail };
    },
    onSuccess: async (updatedBookmark) => {
      toast.success(isArchivedPage ? "Bookmark unarchived" : "Bookmark archived");
      await syncBookmarkToCache(updatedBookmark);
      queryClient.setQueryData(["bookmark-detail", updatedBookmark.id], updatedBookmark);
      await queryClient.invalidateQueries({ queryKey: ["bookmark-detail", updatedBookmark.id] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (_error, _bookmarkId, context) => {
      if (context) {
        setBookmarks(context.previousBookmarks);
        queryClient.setQueryData(["bookmark-detail", context.bookmarkId], context.previousDetail);
      }

      toast.error(isArchivedPage ? "Could not unarchive bookmark" : "Could not archive bookmark");
    },
  });

  const trackBookmarkViewMutation = useMutation({
    mutationFn: (bookmarkId: string) => trackBookmarkView({ data: { id: bookmarkId } }),
    onMutate: async (bookmarkId) => {
      const viewedAt = new Date().toISOString();
      const previousBookmarks = bookmarks;
      const previousDetail = queryClient.getQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId]);

      setBookmarks((currentBookmarks) =>
        updateBookmarkInList(currentBookmarks, bookmarkId, (bookmark) => ({
          ...bookmark,
          viewCount: bookmark.viewCount + 1,
          lastViewedAt: viewedAt,
        })),
      );
      queryClient.setQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId], (bookmark) =>
        bookmark
          ? {
              ...bookmark,
              viewCount: bookmark.viewCount + 1,
              lastViewedAt: viewedAt,
            }
          : bookmark,
      );

      return { bookmarkId, previousBookmarks, previousDetail };
    },
    onSuccess: async (updatedBookmark) => {
      await syncBookmarkToCache(updatedBookmark);
      setBookmarks((currentBookmarks) =>
        updateBookmarkInList(currentBookmarks, updatedBookmark.id, () => updatedBookmark),
      );
      queryClient.setQueryData(["bookmark-detail", updatedBookmark.id], updatedBookmark);
      await queryClient.invalidateQueries({ queryKey: ["bookmark-detail", updatedBookmark.id] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (_error, _bookmarkId, context) => {
      if (context) {
        setBookmarks(context.previousBookmarks);
        queryClient.setQueryData(["bookmark-detail", context.bookmarkId], context.previousDetail);
      }
    },
  });

  const deleteBookmarkPermanentlyMutation = useMutation({
    mutationFn: (bookmarkId: string) => deleteBookmarkPermanently({ data: { id: bookmarkId } }),
    onMutate: async (bookmarkId) => {
      const previousBookmarks = bookmarks;
      const previousDetail = queryClient.getQueryData<BookmarkListItem>(["bookmark-detail", bookmarkId]);

      setBookmarks((currentBookmarks) => currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
      queryClient.removeQueries({ queryKey: ["bookmark-detail", bookmarkId] });

      return { bookmarkId, previousBookmarks, previousDetail };
    },
    onSuccess: async (deletedBookmark) => {
      toast.success("Bookmark deleted permanently");
      await deleteBookmarkFromCache(deletedBookmark.id);
      await syncTagsFromServer();
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (_error, _bookmarkId, context) => {
      if (context) {
        setBookmarks(context.previousBookmarks);
        queryClient.setQueryData(["bookmark-detail", context.bookmarkId], context.previousDetail);
      }

      toast.error("Could not delete bookmark");
    },
  });

  const handleSelectBookmark = useCallback(
    (bookmarkId: string) => {
      setSelectedBookmarkId(bookmarkId);
      setIsDetailOpen(true);
    },
    [setIsDetailOpen, setSelectedBookmarkId],
  );

  const handleVisitBookmark = useCallback(
    (bookmark: BookmarkListItem) => {
      window.open(bookmark.url, "_blank", "noopener,noreferrer");
      trackBookmarkViewMutation.mutate(bookmark.id);
    },
    [trackBookmarkViewMutation],
  );

  const handleCopyBookmarkUrl = useCallback(async (bookmark: BookmarkListItem) => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  }, []);

  const handleTogglePin = useCallback(
    (bookmarkId: string) => {
      toggleBookmarkPinMutation.mutate(bookmarkId);
    },
    [toggleBookmarkPinMutation],
  );

  const handleArchiveStateChange = useCallback(
    async (bookmarkId: string) => {
      await archiveStateMutation.mutateAsync(bookmarkId);
    },
    [archiveStateMutation],
  );

  const handleDetailOpenChange = useCallback(
    (open: boolean) => {
      setIsDetailOpen(open);

      if (!open) {
        setSelectedBookmarkId(null);
      }
    },
    [setIsDetailOpen, setSelectedBookmarkId],
  );

  const handleSubmitBookmark = useCallback(
    async (values: BookmarkFormValues) => {
      await updateBookmarkMutation.mutateAsync(values);
    },
    [updateBookmarkMutation],
  );

  const handleDeletePermanently = useCallback(
    async (bookmarkId: string) => {
      await deleteBookmarkPermanentlyMutation.mutateAsync(bookmarkId);
    },
    [deleteBookmarkPermanentlyMutation],
  );

  const isTogglingPin = useCallback(
    (bookmarkId: string) => toggleBookmarkPinMutation.isPending && toggleBookmarkPinMutation.variables === bookmarkId,
    [toggleBookmarkPinMutation.isPending, toggleBookmarkPinMutation.variables],
  );
  const isChangingArchiveState = useCallback(
    (bookmarkId: string) => archiveStateMutation.isPending && archiveStateMutation.variables === bookmarkId,
    [archiveStateMutation.isPending, archiveStateMutation.variables],
  );
  const isDeletingPermanently = useCallback(
    (bookmarkId: string) =>
      deleteBookmarkPermanentlyMutation.isPending && deleteBookmarkPermanentlyMutation.variables === bookmarkId,
    [deleteBookmarkPermanentlyMutation.isPending, deleteBookmarkPermanentlyMutation.variables],
  );

  return {
    editBookmarkDefaultValues,
    handleArchiveStateChange,
    handleCopyBookmarkUrl,
    handleDeletePermanently,
    handleDetailOpenChange,
    handleSelectBookmark,
    handleSubmitBookmark,
    handleTogglePin,
    handleVisitBookmark,
    isChangingArchiveState,
    isDeletingPermanently,
    isTogglingPin,
  };
}

function mapBookmarkToFormValues(bookmark: BookmarkListItem): BookmarkFormValues {
  return {
    title: bookmark.title,
    description: bookmark.description,
    url: bookmark.url,
    tags: bookmark.tags.map((tag) => tag.name).join(", "),
  };
}

function updateBookmarkInList(
  bookmarks: BookmarkListItem[],
  bookmarkId: string,
  updateBookmark: (bookmark: BookmarkListItem) => BookmarkListItem,
) {
  return bookmarks.map((bookmark) => (bookmark.id === bookmarkId ? updateBookmark(bookmark) : bookmark));
}
