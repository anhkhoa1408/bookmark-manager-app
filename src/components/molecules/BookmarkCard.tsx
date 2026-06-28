import {
  ArchiveIcon,
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  EyeIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  RefreshCcwIcon,
  Trash2Icon,
} from "lucide-react";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";

import { Card } from "@/components/atoms/card";
import { ActionDropdown, type ActionDropdownItem } from "@/components/molecules/ActionDropdown";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { BookmarkListItem } from "@/server/bookmarks";

type BookmarkCardProps = {
  bookmark: BookmarkListItem;
  onSelect: (bookmarkId: string) => void;
  onVisit: (bookmark: BookmarkListItem) => void;
  onCopyUrl: (bookmark: BookmarkListItem) => void | Promise<void>;
  onTogglePin: (bookmarkId: string) => void;
  onArchive: (bookmarkId: string) => void | Promise<void>;
  onUnarchive?: (bookmarkId: string) => void | Promise<void>;
  onDeletePermanently?: (bookmarkId: string) => void | Promise<void>;
  isTogglingPin?: boolean;
  isArchiving?: boolean;
  isUnarchiving?: boolean;
  isDeletingPermanently?: boolean;
};

enum BookmarkCardAction {
  Visit = "visit",
  CopyUrl = "copy-url",
  TogglePin = "toggle-pin",
  Edit = "edit",
  Archive = "archive",
  Unarchive = "unarchive",
  DeletePermanently = "delete-permanently",
}

export function BookmarkCard({
  bookmark,
  onSelect,
  onVisit,
  onCopyUrl,
  onTogglePin,
  onArchive,
  onUnarchive,
  onDeletePermanently,
  isTogglingPin = false,
  isArchiving = false,
  isUnarchiving = false,
  isDeletingPermanently = false,
}: BookmarkCardProps) {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const hostname = getHostname(bookmark.url);
  const faviconUrl = getFaviconUrl(bookmark.url);
  const createdAt = formatBookmarkDate(bookmark.createdAt);
  const updatedAt = formatBookmarkDate(bookmark.updatedAt);
  const description = bookmark.description.trim() || "No description";
  const PinStateIcon = bookmark.pinned ? PinIcon : PinOffIcon;
  const actionItems = useMemo(
    () =>
      bookmark.archived
        ? ([
            { value: BookmarkCardAction.Visit, label: "Visit", Icon: ExternalLinkIcon, showCheck: false },
            { value: BookmarkCardAction.CopyUrl, label: "Copy URL", Icon: CopyIcon, showCheck: false },
            {
              value: BookmarkCardAction.Unarchive,
              label: "Unarchive",
              Icon: RefreshCcwIcon,
              disabled: isUnarchiving || !onUnarchive,
              showCheck: false,
            },
            {
              value: BookmarkCardAction.DeletePermanently,
              label: "Delete Permanently",
              Icon: Trash2Icon,
              disabled: isDeletingPermanently || !onDeletePermanently,
              showCheck: false,
            },
          ] satisfies ActionDropdownItem[])
        : ([
            { value: BookmarkCardAction.Visit, label: "Visit", Icon: ExternalLinkIcon, showCheck: false },
            { value: BookmarkCardAction.CopyUrl, label: "Copy URL", Icon: CopyIcon, showCheck: false },
            {
              value: BookmarkCardAction.TogglePin,
              label: bookmark.pinned ? "Unpin" : "Pin",
              Icon: bookmark.pinned ? PinOffIcon : PinIcon,
              disabled: isTogglingPin,
              showCheck: false,
            },
            { value: BookmarkCardAction.Edit, label: "Edit", Icon: PencilIcon, showCheck: false },
            {
              value: BookmarkCardAction.Archive,
              label: "Archive",
              Icon: ArchiveIcon,
              disabled: isArchiving,
              showCheck: false,
            },
          ] satisfies ActionDropdownItem[]),
    [
      bookmark.archived,
      bookmark.pinned,
      isArchiving,
      isDeletingPermanently,
      isTogglingPin,
      isUnarchiving,
      onDeletePermanently,
      onUnarchive,
    ],
  );

  const handleActionSelect = useCallback(
    (value: string) => {
      switch (value) {
        case BookmarkCardAction.Visit:
          onVisit(bookmark);
          break;
        case BookmarkCardAction.CopyUrl:
          void onCopyUrl(bookmark);
          break;
        case BookmarkCardAction.TogglePin:
          onTogglePin(bookmark.id);
          break;
        case BookmarkCardAction.Edit:
          onSelect(bookmark.id);
          break;
        case BookmarkCardAction.Archive:
          setIsArchiveDialogOpen(true);
          break;
        case BookmarkCardAction.Unarchive:
          setIsUnarchiveDialogOpen(true);
          break;
        case BookmarkCardAction.DeletePermanently:
          setIsDeleteDialogOpen(true);
          break;
      }
    },
    [bookmark, onCopyUrl, onSelect, onTogglePin, onVisit],
  );
  const handleCardSelect = useCallback(() => {
    onSelect(bookmark.id);
  }, [bookmark.id, onSelect]);
  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(bookmark.id);
      }
    },
    [bookmark.id, onSelect],
  );
  const handleFaviconError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
  }, []);
  const stopCardEventPropagation = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);
  const handlePinClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onTogglePin(bookmark.id);
    },
    [bookmark.id, onTogglePin],
  );
  const handleArchiveConfirm = useCallback(() => onArchive(bookmark.id), [bookmark.id, onArchive]);
  const handleUnarchiveConfirm = useCallback(() => onUnarchive?.(bookmark.id), [bookmark.id, onUnarchive]);
  const handleDeleteConfirm = useCallback(
    () => onDeletePermanently?.(bookmark.id),
    [bookmark.id, onDeletePermanently],
  );
  const renderBookmarkTag = useCallback(
    (tag: BookmarkListItem["tags"][number]) => (
      <span
        key={tag.id}
        className="rounded-4 bg-neutral-100 px-8 py-2 text-center text-preset-5 text-neutral-800 dark:bg-neutral-dark-600 dark:text-neutral-dark-100"
      >
        {tag.name}
      </span>
    ),
    [],
  );

  return (
    <>
      <Card
        className="group h-[280px] gap-0 overflow-hidden border border-transparent bg-neutral-0 p-0 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-0 dark:bg-neutral-dark-800 dark:hover:border-neutral-dark-500 dark:hover:bg-neutral-dark-800"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${bookmark.title}`}
        onClick={handleCardSelect}
        onKeyDown={handleCardKeyDown}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col gap-16 rounded-10 p-16">
          <div className="flex w-full items-start gap-12">
            <div className="relative flex size-[44px] shrink-0 items-center justify-center overflow-hidden rounded-8 border border-neutral-100 bg-neutral-0 text-preset-4 text-neutral-800 dark:border-neutral-dark-500 dark:bg-neutral-dark-600 dark:text-neutral-dark-100">
              <span aria-hidden="true">{getBookmarkInitial(bookmark.title)}</span>
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="absolute left-1/2 top-1/2 size-[28px] -translate-x-1/2 -translate-y-1/2 object-contain"
                  onError={handleFaviconError}
                />
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h2 className="truncate text-preset-2 text-neutral-900 dark:text-neutral-0">{bookmark.title}</h2>
              <p className="truncate text-preset-5 text-neutral-800 dark:text-neutral-dark-100">{hostname}</p>
            </div>

            <div onClick={stopCardEventPropagation} onKeyDown={stopCardEventPropagation}>
              <ActionDropdown
                triggerLabel={<EllipsisVerticalIcon className="size-20" aria-hidden="true" />}
                triggerAriaLabel={`More actions for ${bookmark.title}`}
                className="size-32 shrink-0 gap-0 rounded-8 border border-neutral-400 bg-neutral-0 p-0 text-neutral-900 shadow-none hover:bg-neutral-100 dark:border-neutral-dark-400 dark:bg-neutral-dark-800 dark:text-neutral-0 dark:hover:bg-neutral-dark-600"
                contentClassName="min-w-[200px] dark:border-neutral-dark-500"
                items={actionItems}
                onSelect={handleActionSelect}
              />
            </div>
          </div>

          <div className="h-px w-full bg-neutral-300 dark:bg-neutral-dark-500" />

          <p className="line-clamp-2 text-preset-4m tracking-[0.14px] text-neutral-800 dark:text-neutral-dark-100">
            {description}
          </p>

          <div className="flex max-h-[52px] flex-wrap gap-8 overflow-hidden">
            {bookmark.tags.map(renderBookmarkTag)}
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center gap-8 border-t border-neutral-300 px-16 py-12 dark:border-neutral-dark-500">
          <div className="flex min-w-0 flex-1 items-center gap-16">
            <BookmarkMetric icon={EyeIcon} label="Views" value={bookmark.viewCount.toLocaleString("en")} />
            <BookmarkMetric icon={ClockIcon} label="Updated" value={updatedAt} />
            <BookmarkMetric icon={CalendarIcon} label="Created" value={createdAt} />
          </div>
          {bookmark.archived ? (
            <span className="flex shrink-0 items-center gap-6 rounded-4 bg-neutral-100 px-8 py-4 text-preset-5 text-neutral-800 dark:bg-neutral-dark-600 dark:text-neutral-dark-100">
              <ArchiveIcon className="size-12" aria-hidden="true" />
              Archived
            </span>
          ) : (
            <button
              type="button"
              className={cn(
                "flex size-32 shrink-0 items-center justify-center rounded-8 border transition-colors focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-neutral-dark-800",
                bookmark.pinned
                  ? "border-teal-700 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-500 dark:bg-neutral-dark-600 dark:text-teal-500"
                  : "border-neutral-400 bg-neutral-0 text-neutral-800 hover:bg-neutral-100 dark:border-neutral-dark-400 dark:bg-neutral-dark-800 dark:text-neutral-dark-100 dark:hover:bg-neutral-dark-600",
              )}
              aria-label={`${bookmark.pinned ? "Unpin" : "Pin"} ${bookmark.title}`}
              aria-pressed={bookmark.pinned}
              disabled={isTogglingPin}
              onClick={handlePinClick}
              onKeyDown={stopCardEventPropagation}
            >
              <PinStateIcon className={cn("size-16", bookmark.pinned && "fill-current")} aria-hidden="true" />
            </button>
          )}
        </div>
      </Card>
      <ConfirmDialog
        title="Archive bookmark"
        description="Are you sure you want to archive this bookmark?"
        ctaLabel="Archive"
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
      />
      <ConfirmDialog
        title="Unarchive bookmark"
        description="Move this bookmark back to your active list?"
        ctaLabel="Unarchive"
        open={isUnarchiveDialogOpen}
        onOpenChange={setIsUnarchiveDialogOpen}
        onConfirm={handleUnarchiveConfirm}
      />
      <ConfirmDialog
        title="Delete bookmark permanently?"
        description="This will permanently delete this bookmark and cannot be undone."
        ctaLabel="Delete Permanently"
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        danger
      />
    </>
  );
}

function BookmarkMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof EyeIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-6 text-neutral-800 dark:text-neutral-dark-100">
      <Icon className="size-12" aria-hidden="true" />
      <span className="text-preset-5" aria-label={label}>
        {value}
      </span>
    </div>
  );
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function getBookmarkInitial(title: string) {
  return title.trim().charAt(0).toUpperCase() || "?";
}

function formatBookmarkDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(parsedDate);
}
