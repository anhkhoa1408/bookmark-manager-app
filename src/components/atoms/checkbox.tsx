import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "size-16 shrink-0 rounded-4 border border-neutral-500 hover:bg-neutral-300 data-[state=checked]:bg-teal-700 data-[state=checked]:hover:bg-teal-800 dark:border-neutral-dark-300 dark:hover:bg-neutral-dark-600 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:data-[state=checked]:border-teal-800 dark:focus-visible:ring-offset-neutral-dark-800 dark:focus-visible:ring-neutral-100",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon color="white" className="size-12" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
