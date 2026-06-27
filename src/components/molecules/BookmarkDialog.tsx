import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import * as z from "zod";

import { Button } from "@/components/atoms/button";
import { Field, FieldError, FieldLabel } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { cn } from "@/lib/utils";

const bookmarkFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(280, "Description must be 280 characters or less"),
  url: z.url("Please enter a valid URL"),
  tags: z.string().min(1, "Tags are required"),
});

export type BookmarkFormValues = z.infer<typeof bookmarkFormSchema>;

type BookmarkDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  triggerLabel: React.ReactNode;
  defaultValues?: BookmarkFormValues;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (values: BookmarkFormValues) => void | Promise<void>;
};

const defaultBookmarkValues: BookmarkFormValues = {
  title: "",
  description: "",
  url: "",
  tags: "",
};

export function BookmarkDialog({
  title,
  description,
  submitLabel,
  triggerLabel,
  defaultValues,
  defaultOpen,
  open,
  onOpenChange,
  onSubmit,
}: BookmarkDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const resolvedOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    defaultValues: {
      ...defaultBookmarkValues,
      ...defaultValues,
    },
    validators: {
      onChange: bookmarkFormSchema,
      onBlur: bookmarkFormSchema,
    },
    onSubmit: async (values) => {
      await onSubmit?.(values.value);
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog.Root open={resolvedOpen} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button">{triggerLabel}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[1px] dark:bg-neutral-dark-900/55" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[min(92vw,570px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-32 overflow-auto rounded-16 border border-transparent bg-neutral-0 p-32 shadow-[0_24px_64px_rgba(5,21,19,0.18)] outline-none",
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
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-20 top-20 size-32 shrink-0 rounded-8 border border-neutral-400 p-0 shadow-none dark:border-neutral-dark-500 dark:bg-neutral-dark-800"
              aria-label="Close dialog"
            >
              <XIcon className="size-20" />
            </Button>
          </Dialog.Close>

          <form
            className="flex flex-col gap-32"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-20">
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <RequiredFieldLabel htmlFor={field.name}>Title</RequiredFieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        className="h-[45px] shadow-xs"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <RequiredFieldLabel htmlFor={field.name}>Description</RequiredFieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        maxLength={280}
                        className="h-[92px] shadow-xs"
                      />
                      <p className="text-right text-preset-5 text-neutral-800 dark:text-neutral-dark-100">
                        {field.state.value.length}/280
                      </p>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="url"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <RequiredFieldLabel htmlFor={field.name}>Website URL</RequiredFieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        inputMode="url"
                        autoComplete="url"
                        className="h-[45px] shadow-xs"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="tags"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <RequiredFieldLabel htmlFor={field.name}>Tags</RequiredFieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="e.g. design, learning, tools"
                        className="h-[45px] shadow-xs"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </div>

            <div className="flex flex-col-reverse gap-16 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" className="border">
                  Cancel
                </Button>
              </Dialog.Close>
              <form.Subscribe>
                {({ isSubmitting }) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {submitLabel}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RequiredFieldLabel({ children, ...props }: React.ComponentProps<typeof FieldLabel>) {
  return (
    <FieldLabel className="gap-2 text-neutral-900 dark:text-neutral-0" {...props}>
      {children}
      <span className="text-teal-700 dark:text-neutral-dark-100">*</span>
    </FieldLabel>
  );
}
