import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        // Base layout.
        "p-12 relative flex items-center gap-8 w-full rounded-8 border border-neutral-500 dark:border-neutral-dark-300 shadow-xs transition-[color,box-shadow] outline-none",

        // Focus state.
        "has-[>input:focus-visible]:ring-2 has-[>input:focus-visible]:ring-teal-700 has-[>input:focus-visible]:ring-offset-2 has-[>input:focus-visible]:ring-offset-white dark:has-[>input:focus-visible]:ring-offset-2 dark:has-[>input:focus-visible]:ring-offset-neutral-dark-800 dark:has-[>input:focus-visible]:ring-2 dark:has-[>input:focus-visible]:ring-neutral-dark-100",

        // Error state.
        "has-[>input[aria-invalid=true]]:border-red-800",

        // Moved from Input
        "bg-neutral-0 hover:bg-neutral-100 dark:bg-neutral-dark-600 dark:hover:bg-neutral-dark-500 p-12",

        // Child input baseline
        "[&>input]:w-full [&>input]:min-w-0 [&>input]:bg-transparent [&>input]:border-0 [&>input]:outline-none",
        "[&>input]:text-neutral-800 dark:[&>input]:text-neutral-100 [&>input]:placeholder:text-neutral-800",
        "has-[>input:disabled]:pointer-events-none has-[>input:disabled]:cursor-not-allowed has-[>input:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva("text-neutral-800 dark:text-neutral-dark-100", {
  variants: {
    align: {
      "inline-start": "order-first",
      "inline-end": "order-last",
    },
  },
  defaultVariants: {
    align: "inline-start",
  },
});

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
