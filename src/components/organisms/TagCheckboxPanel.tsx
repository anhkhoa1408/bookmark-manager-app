import { Checkbox } from "@/components/atoms/checkbox";
import { cn } from "@/lib/utils";
import type { TagOption } from "@/server/tags";
import { useEffect, useMemo, useRef, useState } from "react";

type TagCheckboxPanelProps = {
  tags: TagOption[];
  selectedTagIds: string[];
  onTagCheckedChange: (tagId: string, checked: boolean) => void;
  className?: string;
};

export function TagCheckboxPanel({ tags, selectedTagIds, onTagCheckedChange, className }: TagCheckboxPanelProps) {
  return (
    <section className={cn("flex min-h-0 w-full flex-1 flex-col items-start", className)}>
      <div className="flex w-full items-center px-12 pb-4">
        <h2 className="text-preset-5 font-bold uppercase text-neutral-800 dark:text-neutral-dark-100">Tags</h2>
      </div>
      {tags.length > 0 ? (
        <VirtualTagList tags={tags} selectedTagIds={selectedTagIds} onTagCheckedChange={onTagCheckedChange} />
      ) : (
        <p className="px-12 py-8 text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
          No tags yet.
        </p>
      )}
    </section>
  );
}

type VirtualTagListProps = Pick<TagCheckboxPanelProps, "tags" | "selectedTagIds" | "onTagCheckedChange">;

const TAG_ROW_HEIGHT = 44;
const TAG_OVERSCAN_ROWS = 6;

function VirtualTagList({ tags, selectedTagIds, onTagCheckedChange }: VirtualTagListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedTagIdsSet = useMemo(() => new Set(selectedTagIds), [selectedTagIds]);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const startIndex = Math.max(0, Math.floor(scrollTop / TAG_ROW_HEIGHT) - TAG_OVERSCAN_ROWS);
  const visibleCount = Math.ceil(containerHeight / TAG_ROW_HEIGHT) + TAG_OVERSCAN_ROWS * 2;
  const endIndex = Math.min(tags.length, startIndex + visibleCount);
  const visibleTags = tags.slice(startIndex, endIndex);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });

    resizeObserver.observe(scrollElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="relative w-full" style={{ height: tags.length * TAG_ROW_HEIGHT }}>
        {visibleTags.map((tag, index) => {
          const checkboxId = `tag-${tag.id}`;
          const checked = selectedTagIdsSet.has(tag.id);

          return (
            <label
              key={tag.id}
              htmlFor={checkboxId}
              className="absolute left-0 flex w-full cursor-pointer items-center overflow-hidden py-2"
              style={{ height: TAG_ROW_HEIGHT, transform: `translateY(${(startIndex + index) * TAG_ROW_HEIGHT}px)` }}
            >
              <span className="flex min-w-0 flex-1 items-center gap-12 rounded-6 bg-neutral-0 px-12 py-8 hover:bg-neutral-100 dark:bg-neutral-dark-800 dark:hover:bg-neutral-dark-600">
                <span className="flex min-w-0 flex-1 items-center gap-8">
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    onCheckedChange={(nextChecked) => onTagCheckedChange(tag.id, nextChecked === true)}
                  />
                  <span className="min-w-0 truncate text-preset-3 text-neutral-800 dark:text-neutral-dark-100">
                    {tag.name}
                  </span>
                </span>
                <span className="shrink-0 rounded-full border border-neutral-300 bg-neutral-100 px-8 py-2 text-center text-preset-5 text-neutral-800 dark:border-neutral-dark-500 dark:bg-neutral-dark-600 dark:text-neutral-dark-100">
                  {tag.bookmarkCount ?? 0}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
