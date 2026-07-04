import {
  getFirestoreService,
  type BaseFirestoreDocument,
  type FirestoreDocument,
} from "@/lib/firebase/firestoreService";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Timestamp } from "firebase-admin/firestore";
import * as z from "zod";

type BookmarkDocument = BaseFirestoreDocument & {
  userId: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  archived?: boolean;
  pinned?: boolean;
  viewCount?: number;
  lastViewedAt?: Timestamp | null;
};

type TagDocument = BaseFirestoreDocument & {
  userId: string;
  name: string;
  slug: string;
};

export type Bookmark = FirestoreDocument<BookmarkDocument>;

export type BookmarkListItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  archived: boolean;
  pinned: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const createBookmarkSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(280, "Description must be 280 characters or less"),
  url: z.url("Please enter a valid URL"),
  tags: z.string().trim().min(1, "Tags are required"),
});

const importBookmarksSchema = z.object({
  bookmarks: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Title is required"),
        url: z.url("Please enter a valid URL"),
        tags: z.array(z.string().trim().min(1, "Tag name is required")).max(40),
      }),
    )
    .min(1, "At least one bookmark is required")
    .max(5000, "Import supports up to 5000 bookmarks at a time"),
});

const bookmarkDetailSchema = z.object({
  id: z.string().trim().min(1, "Bookmark id is required"),
});

const updateBookmarkSchema = createBookmarkSchema.extend({
  id: z.string().trim().min(1, "Bookmark id is required"),
});

const bookmarkActionSchema = z.object({
  id: z.string().trim().min(1, "Bookmark id is required"),
});

const getBookmarksRepository = async () => (await getFirestoreService()).repository<BookmarkDocument>("bookmarks");
const getTagsRepository = async () => (await getFirestoreService()).repository<TagDocument>("tags");

const getSessionUserId = async () => {
  const headers = getRequestHeaders();
  const { auth } = await import("@/lib/firebase/auth");
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) {
    throw new Response("UNAUTHORIZED", { status: 401 });
  }

  return session.user.id;
};

const normalizeTagName = (name: string) => name.trim().replace(/\s+/g, " ");
const getTagSlug = (name: string) => normalizeTagName(name).toLowerCase();

const parseTagNamesFromList = (tagsInput: string[]) => {
  const uniqueTags = new Map<string, string>();

  for (const rawTagName of tagsInput) {
    const name = normalizeTagName(rawTagName);

    if (!name) {
      continue;
    }

    uniqueTags.set(getTagSlug(name), name);
  }

  return Array.from(uniqueTags.entries()).map(([slug, name]) => ({ name, slug }));
};

const parseTagNames = (tagsInput: string) => parseTagNamesFromList(tagsInput.split(","));

const resolveTagIds = async (userId: string, tagsInput: string) => {
  const tagNames = parseTagNames(tagsInput);

  if (tagNames.length === 0) {
    throw new Response("Tags are required", { status: 400 });
  }

  const tagsRepository = await getTagsRepository();
  const existingTags = await tagsRepository.findMany([
    { field: "userId", operator: "==", value: userId },
    { field: "deleted", operator: "==", value: false },
  ]);
  const tagsBySlug = new Map(existingTags.map((tag) => [tag.slug || getTagSlug(tag.name), tag]));
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    const existingTag = tagsBySlug.get(tagName.slug);

    if (existingTag) {
      tagIds.push(existingTag.id);
      continue;
    }

    const createdTag = await tagsRepository.insert({
      userId,
      name: tagName.name,
      slug: tagName.slug,
    });
    tagsBySlug.set(createdTag.slug, createdTag);
    tagIds.push(createdTag.id);
  }

  return tagIds;
};

const resolveImportedTagIds = async (
  userId: string,
  tagsInput: string[],
  tagsBySlug: Map<string, FirestoreDocument<TagDocument>>,
) => {
  const tagNames = parseTagNamesFromList(tagsInput);
  const tagsRepository = await getTagsRepository();
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    const existingTag = tagsBySlug.get(tagName.slug);

    if (existingTag) {
      tagIds.push(existingTag.id);
      continue;
    }

    const createdTag = await tagsRepository.insert({
      userId,
      name: tagName.name,
      slug: tagName.slug,
    });
    tagsBySlug.set(createdTag.slug, createdTag);
    tagIds.push(createdTag.id);
  }

  return tagIds;
};

const mapBookmarkListItem = (
  bookmark: Bookmark,
  tagsById: Map<string, FirestoreDocument<TagDocument>>,
): BookmarkListItem => ({
  id: bookmark.id,
  title: bookmark.title,
  description: bookmark.description,
  url: bookmark.url,
  tags: bookmark.tags.flatMap((tagId) => {
    const tag = tagsById.get(tagId);
    return tag ? [{ id: tag.id, name: tag.name }] : [];
  }),
  archived: bookmark.archived ?? false,
  pinned: bookmark.pinned ?? false,
  viewCount: bookmark.viewCount ?? 0,
  lastViewedAt: bookmark.lastViewedAt?.toDate().toISOString() ?? null,
  createdAt: bookmark.createdAt.toDate().toISOString(),
  updatedAt: bookmark.updatedAt.toDate().toISOString(),
});

const getUserTagsById = async (userId: string) => {
  const tagsRepository = await getTagsRepository();
  const tags = await tagsRepository.findMany([
    { field: "userId", operator: "==", value: userId },
    { field: "deleted", operator: "==", value: false },
  ]);

  return new Map(tags.map((tag) => [tag.id, tag]));
};

const getBookmarksByArchivedState = async (archived: boolean): Promise<BookmarkListItem[]> => {
  const userId = await getSessionUserId();
  const tagsById = await getUserTagsById(userId);
  const bookmarksRepository = await getBookmarksRepository();
  const bookmarks = await bookmarksRepository.findMany([
    { field: "userId", operator: "==", value: userId },
    { field: "deleted", operator: "==", value: false },
    ...(archived ? [{ field: "archived", operator: "==" as const, value: true }] : []),
  ]);

  console.log("🚀 - getBookmarksByArchivedState - bookmarks:", bookmarks);

  return bookmarks
    .filter((bookmark) => (bookmark.archived ?? false) === archived)
    .sort((firstBookmark, secondBookmark) => {
      const createdAtSort = secondBookmark.createdAt.toMillis() - firstBookmark.createdAt.toMillis();

      if (createdAtSort !== 0) {
        return createdAtSort;
      }

      return secondBookmark.id.localeCompare(firstBookmark.id);
    })
    .map((bookmark) => mapBookmarkListItem(bookmark, tagsById));
};

const deleteUnusedTags = async (userId: string, tagIds: string[], deletedBookmarkId: string) => {
  if (tagIds.length === 0) {
    return;
  }

  const bookmarksRepository = await getBookmarksRepository();
  const tagsRepository = await getTagsRepository();
  const uniqueTagIds = Array.from(new Set(tagIds));
  const remainingBookmarks = await bookmarksRepository.findMany([
    { field: "userId", operator: "==", value: userId },
    { field: "deleted", operator: "==", value: false },
  ]);

  await Promise.all(
    uniqueTagIds.map(async (tagId) => {
      const isTagStillUsed = remainingBookmarks.some(
        (bookmark) => bookmark.id !== deletedBookmarkId && bookmark.tags.includes(tagId),
      );

      if (!isTagStillUsed) {
        await tagsRepository.hardDelete(tagId);
      }
    }),
  );
};

export const getAllBookmarks = createServerFn({
  method: "GET",
}).handler(async (): Promise<BookmarkListItem[]> => {
  return getBookmarksByArchivedState(false);
});

export const getArchivedBookmarks = createServerFn({
  method: "GET",
}).handler(async (): Promise<BookmarkListItem[]> => {
  return getBookmarksByArchivedState(true);
});

export const getBookmarkDetail = createServerFn({
  method: "GET",
})
  .validator((data) => bookmarkDetailSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(bookmark, await getUserTagsById(userId));
  });

export const createBookmark = createServerFn({
  method: "POST",
})
  .validator((data) => createBookmarkSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const tagIds = await resolveTagIds(userId, data.tags);
    const bookmark = await bookmarksRepository.insert({
      userId,
      title: data.title.trim(),
      description: data.description.trim(),
      url: data.url,
      tags: tagIds,
      archived: false,
      pinned: false,
      viewCount: 0,
      lastViewedAt: null,
    });

    return mapBookmarkListItem(bookmark, await getUserTagsById(userId));
  });

export const importBookmarks = createServerFn({
  method: "POST",
})
  .validator((data) => importBookmarksSchema.parse(data))
  .handler(async ({ data }): Promise<{ importedCount: number; totalCount: number }> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const tagsRepository = await getTagsRepository();
    const existingTags = await tagsRepository.findMany([
      { field: "userId", operator: "==", value: userId },
      { field: "deleted", operator: "==", value: false },
    ]);
    const tagsBySlug = new Map(existingTags.map((tag) => [tag.slug || getTagSlug(tag.name), tag]));

    for (const bookmarkInput of data.bookmarks) {
      const tagIds = await resolveImportedTagIds(userId, bookmarkInput.tags, tagsBySlug);

      await bookmarksRepository.insert({
        userId,
        title: bookmarkInput.title.trim(),
        description: "",
        url: bookmarkInput.url,
        tags: tagIds,
        archived: false,
        pinned: false,
        viewCount: 0,
        lastViewedAt: null,
      });
    }

    return {
      importedCount: data.bookmarks.length,
      totalCount: data.bookmarks.length,
    };
  });

export const updateBookmark = createServerFn({
  method: "POST",
})
  .validator((data) => updateBookmarkSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    const tagIds = await resolveTagIds(userId, data.tags);

    await bookmarksRepository.update(data.id, {
      title: data.title.trim(),
      description: data.description.trim(),
      url: data.url,
      tags: tagIds,
    });

    const updatedBookmark = await bookmarksRepository.findById(data.id);

    if (!updatedBookmark) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(updatedBookmark, await getUserTagsById(userId));
  });

export const toggleBookmarkPin = createServerFn({
  method: "POST",
})
  .validator((data) => bookmarkActionSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    await bookmarksRepository.update(data.id, {
      pinned: !(bookmark.pinned ?? false),
    });

    const updatedBookmark = await bookmarksRepository.findById(data.id);

    if (!updatedBookmark) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(updatedBookmark, await getUserTagsById(userId));
  });

export const trackBookmarkView = createServerFn({
  method: "POST",
})
  .validator((data) => bookmarkActionSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const { FieldValue, Timestamp } = await import("firebase-admin/firestore");
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    await bookmarksRepository.update(data.id, {
      viewCount: FieldValue.increment(1),
      lastViewedAt: Timestamp.now(),
    });

    const updatedBookmark = await bookmarksRepository.findById(data.id);

    if (!updatedBookmark) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(updatedBookmark, await getUserTagsById(userId));
  });

export const archiveBookmark = createServerFn({
  method: "POST",
})
  .validator((data) => bookmarkActionSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    await bookmarksRepository.update(data.id, {
      archived: true,
    });

    const updatedBookmark = await bookmarksRepository.findById(data.id);

    if (!updatedBookmark) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(updatedBookmark, await getUserTagsById(userId));
  });

export const unarchiveBookmark = createServerFn({
  method: "POST",
})
  .validator((data) => bookmarkActionSchema.parse(data))
  .handler(async ({ data }): Promise<BookmarkListItem> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    await bookmarksRepository.update(data.id, {
      archived: false,
    });

    const updatedBookmark = await bookmarksRepository.findById(data.id);

    if (!updatedBookmark) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    return mapBookmarkListItem(updatedBookmark, await getUserTagsById(userId));
  });

export const deleteBookmarkPermanently = createServerFn({
  method: "POST",
})
  .validator((data) => bookmarkActionSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const userId = await getSessionUserId();
    const bookmarksRepository = await getBookmarksRepository();
    const bookmark = await bookmarksRepository.findById(data.id);

    if (!bookmark || bookmark.userId !== userId || bookmark.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    if (!(bookmark.archived ?? false)) {
      throw new Response("BAD_REQUEST", { status: 400 });
    }

    await bookmarksRepository.hardDelete(data.id);
    await deleteUnusedTags(userId, bookmark.tags, data.id);

    return { id: data.id };
  });
