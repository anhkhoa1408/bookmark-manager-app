import type { TagOption } from "@/server/tags";
import { IndexedDbStoreService } from "@/lib/index-db/indexed-db";

class TagIndexedDbService extends IndexedDbStoreService {
  async getAllTags() {
    return this.getAll<TagOption>("tags");
  }

  async upsertTags(tags: TagOption[]) {
    await this.putMany("tags", tags);
  }

  async deleteTags(tagIds: string[]) {
    await this.deleteMany("tags", tagIds);
  }

  async clearTags() {
    await this.clear("tags");
  }
}

export const tagIndexedDbService = new TagIndexedDbService();
