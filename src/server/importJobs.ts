import { auth } from "@/lib/firebase/auth";
import { sendEmail } from "@/lib/resend/email";
import { firestoreService, type BaseFirestoreDocument, type FirestoreDocument } from "@/lib/firebase/firestoreService";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Timestamp } from "firebase-admin/firestore";
import * as z from "zod";

type ImportJobStatus = "queued" | "processing" | "succeeded" | "failed";
type ImportJobChunkStatus = "queued" | "processing" | "succeeded" | "failed";

type ImportBookmarkInput = {
  title: string;
  url: string;
  tags: string[];
};

type ImportJobDocument = BaseFirestoreDocument & {
  userId: string;
  userEmail: string;
  status: ImportJobStatus;
  totalCount: number;
  importedCount: number;
  failedCount: number;
  totalChunkCount: number;
  processedChunkCount: number;
  lastError?: string;
  startedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
};

type ImportJobChunkDocument = BaseFirestoreDocument & {
  jobId: string;
  userId: string;
  index: number;
  status: ImportJobChunkStatus;
  bookmarks: ImportBookmarkInput[];
  totalCount: number;
  importedCount: number;
  failedCount: number;
  error?: string;
  emailError?: string;
  startedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  emailedAt?: Timestamp | null;
};

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

export type ImportJobSummary = {
  id: string;
  status: ImportJobStatus;
  totalCount: number;
  importedCount: number;
  failedCount: number;
  totalChunkCount: number;
  processedChunkCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

const IMPORT_JOB_CHUNK_SIZE = 100;

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

const importJobSchema = z.object({
  jobId: z.string().trim().min(1, "Import job id is required"),
});

const importJobsRepository = firestoreService.repository<ImportJobDocument>("importJobs");
const importJobChunksRepository = firestoreService.repository<ImportJobChunkDocument>("importJobChunks");
const bookmarksRepository = firestoreService.repository<BookmarkDocument>("bookmarks");
const tagsRepository = firestoreService.repository<TagDocument>("tags");
const activeImportJobIds = new Set<string>();

const getSessionUser = async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id || !session.user.email) {
    throw new Response("UNAUTHORIZED", { status: 401 });
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
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

const resolveImportedTagIds = async (
  userId: string,
  tagsInput: string[],
  tagsBySlug: Map<string, FirestoreDocument<TagDocument>>,
) => {
  const tagNames = parseTagNamesFromList(tagsInput);
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    const existingTag = tagsBySlug.get(tagName.slug);

    if (existingTag) {
      tagIds.push(existingTag.id);
      continue;
    }

    const createdTag = await tagsRepository.insertWithGeneratedId({
      userId,
      name: tagName.name,
      slug: tagName.slug,
    });
    tagsBySlug.set(createdTag.slug, createdTag);
    tagIds.push(createdTag.id);
  }

  return tagIds;
};

const mapImportJobSummary = (job: FirestoreDocument<ImportJobDocument>): ImportJobSummary => ({
  id: job.id,
  status: job.status,
  totalCount: job.totalCount,
  importedCount: job.importedCount,
  failedCount: job.failedCount,
  totalChunkCount: job.totalChunkCount,
  processedChunkCount: job.processedChunkCount,
  lastError: job.lastError ?? null,
  createdAt: job.createdAt.toDate().toISOString(),
  updatedAt: job.updatedAt.toDate().toISOString(),
  completedAt: job.completedAt?.toDate().toISOString() ?? null,
});

const chunkBookmarks = (bookmarks: ImportBookmarkInput[]) => {
  const chunks: ImportBookmarkInput[][] = [];

  for (let index = 0; index < bookmarks.length; index += IMPORT_JOB_CHUNK_SIZE) {
    chunks.push(bookmarks.slice(index, index + IMPORT_JOB_CHUNK_SIZE));
  }

  return chunks;
};

const startImportJobProcessing = (jobId: string) => {
  if (activeImportJobIds.has(jobId)) {
    return;
  }

  activeImportJobIds.add(jobId);
  setTimeout(() => {
    void processImportJobById(jobId)
      .catch((error) => {
        console.error("Import job processing failed.", { jobId, error });
      })
      .finally(() => {
        activeImportJobIds.delete(jobId);
      });
  }, 0);
};

export const createImportJob = createServerFn({
  method: "POST",
})
  .validator((data) => importBookmarksSchema.parse(data))
  .handler(async ({ data }): Promise<ImportJobSummary> => {
    const user = await getSessionUser();
    const chunks = chunkBookmarks(
      data.bookmarks.map((bookmark) => ({
        title: bookmark.title.trim(),
        url: bookmark.url,
        tags: bookmark.tags,
      })),
    );
    const job = await importJobsRepository.insertWithGeneratedId({
      userId: user.id,
      userEmail: user.email,
      status: "queued",
      totalCount: data.bookmarks.length,
      importedCount: 0,
      failedCount: 0,
      totalChunkCount: chunks.length,
      processedChunkCount: 0,
      startedAt: null,
      completedAt: null,
    });

    for (const [index, bookmarks] of chunks.entries()) {
      await importJobChunksRepository.insertWithGeneratedId({
        jobId: job.id,
        userId: user.id,
        index,
        status: "queued",
        bookmarks,
        totalCount: bookmarks.length,
        importedCount: 0,
        failedCount: 0,
        startedAt: null,
        completedAt: null,
        emailedAt: null,
      });
    }

    startImportJobProcessing(job.id);

    return mapImportJobSummary(job);
  });

export const getImportJob = createServerFn({
  method: "GET",
})
  .validator((data) => importJobSchema.parse(data))
  .handler(async ({ data }): Promise<ImportJobSummary> => {
    const user = await getSessionUser();
    const job = await importJobsRepository.findById(data.jobId);

    if (!job || job.userId !== user.id || job.deleted) {
      throw new Response("NOT_FOUND", { status: 404 });
    }

    if (job.status === "queued") {
      startImportJobProcessing(job.id);
    }

    return mapImportJobSummary(job);
  });

export async function processImportJobById(jobId: string) {
  const job = await importJobsRepository.findById(jobId);

  if (!job || job.deleted || job.status === "succeeded" || job.status === "failed") {
    return;
  }

  await importJobsRepository.update(job.id, {
    status: "processing",
    startedAt: job.startedAt ?? Timestamp.now(),
  });

  const chunks = await importJobChunksRepository.findMany([
    { field: "jobId", operator: "==", value: job.id },
    { field: "userId", operator: "==", value: job.userId },
    { field: "deleted", operator: "==", value: false },
  ]);
  const queuedChunks = chunks
    .filter((chunk) => chunk.status === "queued" || chunk.status === "failed")
    .sort((firstChunk, secondChunk) => firstChunk.index - secondChunk.index);
  const existingTags = await tagsRepository.findMany([
    { field: "userId", operator: "==", value: job.userId },
    { field: "deleted", operator: "==", value: false },
  ]);
  const tagsBySlug = new Map(existingTags.map((tag) => [tag.slug || getTagSlug(tag.name), tag]));

  for (const chunk of queuedChunks) {
    await processImportJobChunk(job, chunk, tagsBySlug);
  }

  const refreshedChunks = await importJobChunksRepository.findMany([
    { field: "jobId", operator: "==", value: job.id },
    { field: "userId", operator: "==", value: job.userId },
    { field: "deleted", operator: "==", value: false },
  ]);
  const importedCount = refreshedChunks.reduce((count, chunk) => count + chunk.importedCount, 0);
  const failedCount = refreshedChunks.reduce((count, chunk) => count + chunk.failedCount, 0);
  const processedChunkCount = refreshedChunks.filter((chunk) => chunk.status === "succeeded").length;
  const failedChunk = refreshedChunks.find((chunk) => chunk.status === "failed");

  await importJobsRepository.update(job.id, {
    status: failedChunk ? "failed" : "succeeded",
    importedCount,
    failedCount,
    processedChunkCount,
    lastError: failedChunk?.error,
    completedAt: Timestamp.now(),
  });
}

async function processImportJobChunk(
  job: FirestoreDocument<ImportJobDocument>,
  chunk: FirestoreDocument<ImportJobChunkDocument>,
  tagsBySlug: Map<string, FirestoreDocument<TagDocument>>,
) {
  await importJobChunksRepository.update(chunk.id, {
    status: "processing",
    startedAt: Timestamp.now(),
    error: undefined,
  });

  try {
    for (const bookmarkInput of chunk.bookmarks) {
      const tagIds = await resolveImportedTagIds(job.userId, bookmarkInput.tags, tagsBySlug);

      await bookmarksRepository.insertWithGeneratedId({
        userId: job.userId,
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

    await importJobChunksRepository.update(chunk.id, {
      status: "succeeded",
      importedCount: chunk.bookmarks.length,
      failedCount: 0,
      completedAt: Timestamp.now(),
    });

    try {
      await sendImportChunkSuccessEmail(job, chunk, chunk.bookmarks.length);
      await importJobChunksRepository.update(chunk.id, {
        emailedAt: Timestamp.now(),
      });
    } catch (caughtError) {
      const emailError = caughtError instanceof Error ? caughtError.message : "Could not send import success email.";

      await importJobChunksRepository.update(chunk.id, {
        emailError,
      });
    }
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : "Could not import this bookmark chunk.";

    await importJobChunksRepository.update(chunk.id, {
      status: "failed",
      importedCount: 0,
      failedCount: chunk.bookmarks.length,
      error: message,
      completedAt: Timestamp.now(),
    });
  }
}

async function sendImportChunkSuccessEmail(
  job: FirestoreDocument<ImportJobDocument>,
  chunk: FirestoreDocument<ImportJobChunkDocument>,
  importedCount: number,
) {
  const chunkNumber = chunk.index + 1;
  const subject = `Bookmark import chunk ${chunkNumber} completed`;
  const text = [
    `Your bookmark import chunk ${chunkNumber} of ${job.totalChunkCount} completed successfully.`,
    `Imported bookmarks in this chunk: ${importedCount}`,
    `Total bookmarks in the import job: ${job.totalCount}`,
  ].join("\n");

  await sendEmail({
    to: job.userEmail,
    subject,
    text,
    html: `<p>Your bookmark import chunk ${chunkNumber} of ${job.totalChunkCount} completed successfully.</p><p>Imported bookmarks in this chunk: ${importedCount}</p><p>Total bookmarks in the import job: ${job.totalCount}</p>`,
  });
}
