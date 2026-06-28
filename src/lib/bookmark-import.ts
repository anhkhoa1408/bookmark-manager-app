export type ParsedBookmarkImport = {
  title: string;
  url: string;
  tags: string[];
};

export type BookmarkImportParseResult = {
  bookmarks: ParsedBookmarkImport[];
  skippedCount: number;
};

const topLevelContainerNames = new Set([
  "bookmarks bar",
  "favorites bar",
  "other bookmarks",
  "bookmarks menu",
  "mobile bookmarks",
]);

export function parseBookmarkHtmlExport(html: string): BookmarkImportParseResult {
  const document = new DOMParser().parseFromString(html, "text/html");
  const parserError = document.querySelector("parsererror");

  if (parserError) {
    throw new Error("Could not read this bookmark HTML file.");
  }

  const rootList = document.querySelector("dl");

  if (!rootList) {
    throw new Error("This file does not look like a browser bookmark export.");
  }

  const result = parseBookmarkList(rootList, []);

  if (result.bookmarks.length === 0) {
    throw new Error("No valid bookmarks were found in this file.");
  }

  return result;
}

function parseBookmarkList(list: Element, folderPath: string[]): BookmarkImportParseResult {
  const bookmarks: ParsedBookmarkImport[] = [];
  let skippedCount = 0;

  for (const term of getDirectTerms(list)) {
    const link = getDirectChild(term, "a");

    if (link instanceof HTMLAnchorElement) {
      const parsedBookmark = parseBookmarkLink(link, folderPath);

      if (parsedBookmark) {
        bookmarks.push(parsedBookmark);
      } else {
        skippedCount += 1;
      }

      continue;
    }

    const folderHeading = getDirectChild(term, "h3");

    if (!folderHeading) {
      continue;
    }

    const nestedList = getNestedList(term);

    if (!nestedList) {
      continue;
    }

    const folderName = normalizeText(folderHeading.textContent ?? "");
    const nextFolderPath = getNextFolderPath(folderPath, folderName);
    const nestedResult = parseBookmarkList(nestedList, nextFolderPath);
    bookmarks.push(...nestedResult.bookmarks);
    skippedCount += nestedResult.skippedCount;
  }

  return { bookmarks, skippedCount };
}

function parseBookmarkLink(link: HTMLAnchorElement, folderPath: string[]): ParsedBookmarkImport | null {
  const href = link.getAttribute("href")?.trim();

  if (!href || !isValidUrl(href)) {
    return null;
  }

  return {
    title: normalizeText(link.textContent ?? "") || href,
    url: href,
    tags: dedupeTagNames(folderPath),
  };
}

function getDirectTerms(list: Element) {
  return Array.from(list.querySelectorAll("dt")).filter((term) => term.parentElement?.closest("dl") === list);
}

function getDirectChild(parent: Element, tagName: string) {
  return Array.from(parent.children).find((child) => child.tagName.toLowerCase() === tagName) ?? null;
}

function getNestedList(term: Element) {
  const childList = getDirectChild(term, "dl");

  if (childList) {
    return childList;
  }

  const nextElement = term.nextElementSibling;
  return nextElement?.tagName.toLowerCase() === "dl" ? nextElement : null;
}

function getNextFolderPath(folderPath: string[], folderName: string) {
  if (!folderName) {
    return folderPath;
  }

  if (folderPath.length === 0 && topLevelContainerNames.has(folderName.toLowerCase())) {
    return folderPath;
  }

  return [...folderPath, folderName];
}

function dedupeTagNames(tagNames: string[]) {
  const tagsBySlug = new Map<string, string>();

  for (const tagName of tagNames) {
    const normalizedTagName = normalizeText(tagName);

    if (!normalizedTagName) {
      continue;
    }

    tagsBySlug.set(normalizedTagName.toLowerCase(), normalizedTagName);
  }

  return Array.from(tagsBySlug.values());
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
