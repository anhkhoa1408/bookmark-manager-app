import { auth } from "@/lib/firebase/auth";
import { firestoreService, type BaseFirestoreDocument, type FirestoreDocument } from "@/lib/firebase/firestoreService";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

type TagDocument = BaseFirestoreDocument & {
  userId: string;
  name: string;
  slug: string;
};

export type Tag = FirestoreDocument<TagDocument>;

export type TagOption = {
  id: string;
  name: string;
  slug: string;
  bookmarkCount?: number;
};

const tagsRepository = firestoreService.repository<TagDocument>("tags");

export const getTags = createServerFn({
  method: "GET",
}).handler(async (): Promise<TagOption[]> => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) {
    throw new Response("UNAUTHORIZED", { status: 401 });
  }

  const tags = await tagsRepository.findMany([
    { field: "userId", operator: "==", value: session.user.id },
    { field: "deleted", operator: "==", value: false },
  ]);

  return tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug ?? tag.name.trim().replace(/\s+/g, " ").toLowerCase(),
    }))
    .sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name));
});
