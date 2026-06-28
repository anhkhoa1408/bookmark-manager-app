import { tagIndexedDbService } from "@/lib/index-db/tag-indexed-db";
import { getTags, type TagOption } from "@/server/tags";

export async function getTagsCacheFirst() {
  const cachedTags = await tagIndexedDbService.getAllTags();

  if (cachedTags.length > 0) {
    return sortTags(cachedTags);
  }

  return syncTagsFromServer();
}

export async function syncTagsToCache(tags: TagOption[]) {
  await tagIndexedDbService.upsertTags(tags);
}

export async function syncTagsFromServer() {
  const tags = await getTags();
  await tagIndexedDbService.clearTags();
  await syncTagsToCache(tags);

  return sortTags(tags);
}

export async function clearTagCache() {
  await tagIndexedDbService.clearTags();
}

function sortTags(tags: TagOption[]) {
  return [...tags].sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name));
}
