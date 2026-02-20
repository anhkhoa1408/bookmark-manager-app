import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex items-center justify-center gap-4 text-preset-3 whitespace-nowrap rounded-8 border-2 outline-none shadow-button transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "text-neutral-0 bg-teal-700 hover:bg-teal-800 border-button-border focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-2 focus-visible:ring-teal-700",
        secondary:
          "text-neutral-900 bg-neutral-0 hover:bg-neutral-100 border-neutral-400 focus-visible:text-neutral-dark-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-2 focus-visible:ring-teal-700 active:text-teal-700 active:border-teal-700 dark:text-neutral-0 dark:bg-neutral-dark-800 dark:border-neutral-dark-400 dark:hover:bg-neutral-dark-600 dark:hover:border-neutral-dark-500 dark:focus-visible:ring-offset-teal-800 dark:focus-visible:ring-neutral-dark-100 dark:active:bg-neutral-dark-800 dark:active:border-neutral-0",
        error:
          "text-neutral-0 bg-red-800 border-button-border focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-2 focus-visible:ring-red-800",
      },
      size: {
        default: "px-16 py-12",
        icon: "min-w-32 h-32 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
