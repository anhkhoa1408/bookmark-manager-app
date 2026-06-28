import type { BookmarkListItem } from "@/server/bookmarks";
import { IndexedDbStoreService } from "@/lib/index-db/indexed-db";

class BookmarkIndexedDbService extends IndexedDbStoreService {
  async getAllBookmarks() {
    return this.getAll<BookmarkListItem>("bookmarks");
  }

  async upsertBookmarks(bookmarks: BookmarkListItem[]) {
    await this.putMany("bookmarks", bookmarks);
  }

  async deleteBookmarks(bookmarkIds: string[]) {
    await this.deleteMany("bookmarks", bookmarkIds);
  }

  async clearBookmarks() {
    await this.clear("bookmarks");
  }
}

export const bookmarkIndexedDbService = new BookmarkIndexedDbService();
