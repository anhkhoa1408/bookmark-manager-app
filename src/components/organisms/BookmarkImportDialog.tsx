import * as React from "react";
import { UploadIcon, XIcon } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/atoms/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/atoms/field";
import {
  parseBookmarkHtmlExport,
  type BookmarkImportParseResult,
  type ParsedBookmarkImport,
} from "@/lib/bookmark-import";
import { cn } from "@/lib/utils";
import type { ImportJobSummary } from "@/server/importJobs";

type BookmarkImportDialogProps = {
  onImport: (bookmarks: ParsedBookmarkImport[]) => Promise<ImportJobSummary>;
};

export function BookmarkImportDialog({ onImport }: BookmarkImportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parseResult, setParseResult] = React.useState<BookmarkImportParseResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const resetState = () => {
    setFileName(null);
    setParseResult(null);
    setError(null);
    setIsImporting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetState();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setFileName(file.name);
      setParseResult(null);
      setError(null);

      const html = await file.text();
      setParseResult(parseBookmarkHtmlExport(html));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not parse this bookmark file.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!parseResult?.bookmarks.length) {
      setError("Choose a valid bookmark HTML file first.");
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      await onImport(parseResult.bookmarks);
      handleOpenChange(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not import bookmarks.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary">
          <UploadIcon className="size-20" aria-hidden="true" />
          Import Bookmark
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[1px] dark:bg-neutral-dark-900/55" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-28 overflow-auto rounded-16 border border-transparent bg-neutral-0 p-32 shadow-[0_24px_64px_rgba(5,21,19,0.18)] outline-none",
            "dark:border-neutral-dark-500 dark:bg-neutral-dark-800 dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)]",
          )}
        >
          <div className="flex w-full flex-col gap-8 pr-48 dark:gap-10">
            <Dialog.Title className="text-preset-1 text-neutral-900 dark:text-neutral-0">
              Import bookmarks
            </Dialog.Title>
            <Dialog.Description className="text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
              Choose a Chrome, Edge, or browser bookmark HTML export.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-20 top-20 size-32 shrink-0 rounded-8 border border-neutral-400 p-0 shadow-none dark:border-neutral-dark-500 dark:bg-neutral-dark-800"
              aria-label="Close dialog"
              disabled={isImporting}
            >
              <XIcon className="size-20" aria-hidden="true" />
            </Button>
          </Dialog.Close>

          <form className="flex flex-col gap-24" onSubmit={handleSubmit}>
            <Field>
              <FieldLabel htmlFor="bookmark-import-file">Bookmark HTML file</FieldLabel>
              <input
                id="bookmark-import-file"
                type="file"
                accept=".html,.htm,text/html"
                onChange={handleFileChange}
                disabled={isImporting}
                className="text-preset-4m file:text-preset-4 file:mr-16 file:cursor-pointer file:rounded-8 file:border-2 file:border-neutral-400 file:bg-neutral-0 file:px-16 file:py-10 file:text-neutral-900 file:shadow-button file:transition-colors hover:file:bg-neutral-100 dark:text-neutral-dark-100 dark:file:border-neutral-dark-400 dark:file:bg-neutral-dark-800 dark:file:text-neutral-0 dark:hover:file:bg-neutral-dark-600"
              />
              <FieldDescription className="dark:text-neutral-dark-100">
                Folder levels become separate tags for each imported bookmark.
              </FieldDescription>
            </Field>

            {fileName ? (
              <div className="rounded-8 border border-neutral-300 bg-neutral-100 p-16 dark:border-neutral-dark-500 dark:bg-neutral-dark-600">
                <p className="text-preset-4 text-neutral-900 dark:text-neutral-0">{fileName}</p>
                {parseResult ? (
                  <p className="mt-6 text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
                    {parseResult.bookmarks.length.toLocaleString("en")} bookmarks ready
                    {parseResult.skippedCount > 0
                      ? `, ${parseResult.skippedCount.toLocaleString("en")} invalid entries skipped`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? <FieldError>{error}</FieldError> : null}

            <div className="flex flex-col-reverse gap-16 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="border" disabled={isImporting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isImporting || !parseResult?.bookmarks.length}>
                {isImporting ? "Queueing..." : "Start Import"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
