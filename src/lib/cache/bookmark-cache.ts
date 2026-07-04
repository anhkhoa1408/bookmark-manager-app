import { bookmarkIndexedDbService } from "@/lib/index-db/bookmark-indexed-db";
import { syncTagBookmarkCountsFromCache } from "@/lib/cache/tag-cache";
import { getAllBookmarks, getArchivedBookmarks, type BookmarkListItem } from "@/server/bookmarks";

type BookmarkParams = {
  archived: boolean;
};

export async function getBookmarksAndSyncCache({ archived }: BookmarkParams) {
  try {
    const cachedBookmarks = await bookmarkIndexedDbService.getAllBookmarks();
    const matchingBookmarks = sortBookmarks(cachedBookmarks.filter((bookmark) => bookmark.archived === archived));

    if (matchingBookmarks.length > 0) {
      return matchingBookmarks;
    }
  } catch {
    // If IndexedDB is unavailable, fall back to the server.
  }

  return syncBookmarksFromServer({ archived });
}

export async function syncBookmarksFromServer({ archived }: BookmarkParams) {
  const bookmarks = archived ? await getArchivedBookmarks() : await getAllBookmarks();
  await syncBookmarksToCache(bookmarks);

  return sortBookmarks(bookmarks);
}

export async function syncBookmarksToCache(bookmarks: BookmarkListItem[]) {
  await bookmarkIndexedDbService.upsertBookmarks(bookmarks);
  await syncTagBookmarkCountsFromCache();
}

export async function syncBookmarkToCache(bookmark: BookmarkListItem) {
  await syncBookmarksToCache([bookmark]);
}

export async function deleteBookmarkFromCache(bookmarkId: string) {
  await bookmarkIndexedDbService.deleteBookmarks([bookmarkId]);
  await syncTagBookmarkCountsFromCache();
}

export async function clearBookmarkCache() {
  await bookmarkIndexedDbService.clearBookmarks();
}

function sortBookmarks(bookmarks: BookmarkListItem[]) {
  return [...bookmarks].sort((firstBookmark, secondBookmark) => {
    const createdAtSort = getDateTime(secondBookmark.createdAt) - getDateTime(firstBookmark.createdAt);

    if (createdAtSort !== 0) {
      return createdAtSort;
    }

    return secondBookmark.id.localeCompare(firstBookmark.id);
  });
}

function getDateTime(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}
