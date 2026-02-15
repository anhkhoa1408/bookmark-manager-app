import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-500 dark:border-neutral-dark-300 dark:hover:border-neutral-dark-400 w-full min-w-0 rounded-8 bg-neutral-0 hover:bg-neutral-100 dark:bg-neutral-dark-600 dark:hover:bg-neutral-dark-500 p-12 text-preset-4m transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-dark-800 dark:focus-visible:ring-2 dark:focus-visible:ring-neutral-dark-100",
        "aria-invalid:border-red-800 dark:aria-invalid:border-red-800",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
