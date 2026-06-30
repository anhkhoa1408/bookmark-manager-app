import {
  getFirestoreService,
  type BaseFirestoreDocument,
  type FirestoreDocument,
} from "@/lib/firebase/firestoreService";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

type TagDocument = BaseFirestoreDocument & {
  userId: string;
  name: string;
  slug: string;
};

type BookmarkDocument = BaseFirestoreDocument & {
  userId: string;
  tags: string[];
};

export type Tag = FirestoreDocument<TagDocument>;

export type TagOption = {
  id: string;
  name: string;
  slug: string;
  bookmarkCount?: number;
};

const getTagsRepository = async () => (await getFirestoreService()).repository<TagDocument>("tags");
const getBookmarksRepository = async () => (await getFirestoreService()).repository<BookmarkDocument>("bookmarks");

export const getTags = createServerFn({
  method: "GET",
}).handler(async (): Promise<TagOption[]> => {
  const headers = getRequestHeaders();
  const { auth } = await import("@/lib/firebase/auth");
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) {
    throw new Response("UNAUTHORIZED", { status: 401 });
  }

  const tagsRepository = await getTagsRepository();
  const bookmarksRepository = await getBookmarksRepository();
  const [tags, bookmarks] = await Promise.all([
    tagsRepository.findMany([
      { field: "userId", operator: "==", value: session.user.id },
      { field: "deleted", operator: "==", value: false },
    ]),
    bookmarksRepository.findMany([
      { field: "userId", operator: "==", value: session.user.id },
      { field: "deleted", operator: "==", value: false },
    ]),
  ]);
  const bookmarkCountsByTagId = bookmarks.reduce((countsByTagId, bookmark) => {
    for (const tagId of bookmark.tags) {
      countsByTagId.set(tagId, (countsByTagId.get(tagId) ?? 0) + 1);
    }

    return countsByTagId;
  }, new Map<string, number>());

  return tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug ?? tag.name.trim().replace(/\s+/g, " ").toLowerCase(),
      bookmarkCount: bookmarkCountsByTagId.get(tag.id) ?? 0,
    }))
    .sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name));
});
