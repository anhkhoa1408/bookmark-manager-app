import { bookmarkIndexedDbService } from "@/lib/index-db/bookmark-indexed-db";
import { tagIndexedDbService } from "@/lib/index-db/tag-indexed-db";
import { getTags, type TagOption } from "@/server/tags";

export async function getTagsAndSyncCache() {
  try {
    const cachedTags = await tagIndexedDbService.getAllTags();

    if (cachedTags.length > 0) {
      return sortTags(await countTagBookmarksFromCache(cachedTags));
    }
  } catch {
    // If IndexedDB is unavailable, fall back to the server.
  }

  return syncTagsFromServer();
}

export async function syncTagsToCache(tags: TagOption[]) {
  await tagIndexedDbService.upsertTags(tags);
}

export async function syncTagsFromServer() {
  const tags = await getTags();

  await tagIndexedDbService.replaceTags(tags);

  return sortTags(tags);
}

export async function clearTagCache() {
  await tagIndexedDbService.clearTags();
}

export async function syncTagBookmarkCountsFromCache() {
  const cachedTags = await tagIndexedDbService.getAllTags();

  if (cachedTags.length === 0) {
    return [];
  }

  const tagsWithBookmarkCounts = await countTagBookmarksFromCache(cachedTags);
  await syncTagsToCache(tagsWithBookmarkCounts);

  return sortTags(tagsWithBookmarkCounts);
}

export async function countTagBookmarksFromCache(tags: TagOption[]) {
  const cachedBookmarks = await bookmarkIndexedDbService.getAllBookmarks();
  const bookmarkCountsByTagId = cachedBookmarks.reduce((countsByTagId, bookmark) => {
    for (const tag of bookmark.tags) {
      countsByTagId.set(tag.id, (countsByTagId.get(tag.id) ?? 0) + 1);
    }

    return countsByTagId;
  }, new Map<string, number>());

  return tags.map((tag) => ({
    ...tag,
    bookmarkCount: bookmarkCountsByTagId.get(tag.id) ?? 0,
  }));
}

function sortTags(tags: TagOption[]) {
  return [...tags].sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name));
}
