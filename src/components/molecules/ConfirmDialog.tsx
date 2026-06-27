import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  danger?: boolean;
};

export function ConfirmDialog({
  title,
  description,
  ctaLabel,
  onConfirm,
  trigger,
  danger = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[1px] dark:bg-neutral-dark-900/55" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[min(92vw,450px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-24 overflow-auto rounded-12 border border-transparent bg-neutral-0 p-24 shadow-[0_24px_64px_rgba(5,21,19,0.18)] outline-none",
            "dark:border-neutral-dark-500 dark:bg-neutral-dark-800 dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)]",
          )}
        >
          <div className="flex w-full flex-col gap-8 pr-48 dark:gap-10">
            <Dialog.Title className="text-preset-1 text-neutral-900 dark:text-neutral-0">{title}</Dialog.Title>
            <Dialog.Description className="text-preset-4m text-neutral-800 dark:text-neutral-dark-100">
              {description}
            </Dialog.Description>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-14 top-14 flex size-20 cursor-pointer items-center justify-center text-neutral-900 outline-none transition-colors hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-teal-700 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-0 dark:hover:text-neutral-dark-100 dark:focus-visible:ring-neutral-dark-100"
              aria-label="Close dialog"
              disabled={isConfirming}
            >
              <XIcon className="size-20" aria-hidden="true" />
            </button>
          </Dialog.Close>

          <div className="flex w-full flex-col-reverse gap-16 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" className="border" disabled={isConfirming}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant={danger ? "error" : "primary"}
              disabled={isConfirming}
              onClick={handleConfirm}
            >
              {ctaLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
