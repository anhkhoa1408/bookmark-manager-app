import { bookmarkIndexedDbService } from "@/lib/index-db/bookmark-indexed-db";
import { getBookmarksPage, type BookmarkListItem, type BookmarksPage } from "@/server/bookmarks";

type BookmarkPageParams = {
  archived: boolean;
  cursor?: string | null;
  limit: number;
};

export async function getBookmarksPageCacheFirst({ archived, cursor, limit }: BookmarkPageParams) {
  if (!cursor) {
    const cachedBookmarks = await bookmarkIndexedDbService.getAllBookmarks();
    const matchingBookmarks = cachedBookmarks
      .filter((bookmark) => bookmark.archived === archived)
      .sort((firstBookmark, secondBookmark) => compareDates(secondBookmark.createdAt, firstBookmark.createdAt));

    if (matchingBookmarks.length > 0) {
      const pageBookmarks = matchingBookmarks.slice(0, limit);
      const lastBookmark = pageBookmarks.at(-1);

      return {
        bookmarks: pageBookmarks,
        nextCursor: matchingBookmarks.length >= limit && lastBookmark ? encodeBookmarkPageCursor(lastBookmark) : null,
      } satisfies BookmarksPage;
    }
  }

  const page = await getBookmarksPage({
    data: {
      archived,
      cursor,
      limit,
    },
  });
  await syncBookmarksToCache(page.bookmarks);

  return page;
}

export async function syncBookmarksToCache(bookmarks: BookmarkListItem[]) {
  await bookmarkIndexedDbService.upsertBookmarks(bookmarks);
}

export async function syncBookmarkToCache(bookmark: BookmarkListItem) {
  await bookmarkIndexedDbService.upsertBookmarks([bookmark]);
}

export async function deleteBookmarkFromCache(bookmarkId: string) {
  await bookmarkIndexedDbService.deleteBookmarks([bookmarkId]);
}

export async function clearBookmarkCache() {
  await bookmarkIndexedDbService.clearBookmarks();
}

function compareDates(firstDate: string, secondDate: string) {
  return getDateTime(firstDate) - getDateTime(secondDate);
}

function encodeBookmarkPageCursor(bookmark: BookmarkListItem) {
  return JSON.stringify({
    createdAt: getDateTime(bookmark.createdAt),
    id: bookmark.id,
  });
}

function getDateTime(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}
