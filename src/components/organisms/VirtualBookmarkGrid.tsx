import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { BookmarkListItem } from "@/server/bookmarks";

type VirtualBookmarkGridProps = {
  bookmarks: BookmarkListItem[];
  renderBookmarkCard: (bookmark: BookmarkListItem) => ReactNode;
};

const CARD_HEIGHT = 280;
const ROW_GAP = 16;
const OVERSCAN_ROWS = 3;

export function VirtualBookmarkGrid({ bookmarks, renderBookmarkCard }: VirtualBookmarkGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const columnCount = getColumnCount(containerWidth);
  const rowCount = Math.ceil(bookmarks.length / columnCount);
  const rowStride = CARD_HEIGHT + ROW_GAP;
  const totalHeight = Math.max(0, rowCount * CARD_HEIGHT + Math.max(0, rowCount - 1) * ROW_GAP);
  const startRow = Math.max(0, Math.floor(scrollTop / rowStride) - OVERSCAN_ROWS);
  const visibleRowCount = Math.ceil(containerHeight / rowStride) + OVERSCAN_ROWS * 2;
  const endRow = Math.min(rowCount, startRow + visibleRowCount);
  const visibleRows = useMemo(() => {
    return Array.from({ length: endRow - startRow }, (_, index) => startRow + index);
  }, [endRow, startRow]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
      setContainerWidth(entry.contentRect.width);
    });

    resizeObserver.observe(scrollElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
      <div className="relative w-full" style={{ height: totalHeight }}>
        {visibleRows.map((rowIndex) => {
          const rowBookmarks = bookmarks.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount);

          return (
            <div
              key={rowIndex}
              className="absolute left-0 grid w-full gap-16"
              style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, transform: `translateY(${rowIndex * rowStride}px)` }}
            >
              {rowBookmarks.map((bookmark) => renderBookmarkCard(bookmark))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getColumnCount(containerWidth: number) {
  if (containerWidth >= 1240) {
    return 3;
  }

  if (containerWidth >= 768) {
    return 2;
  }

  return 1;
}
