import { CheckIcon, type LucideIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/atoms/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/atoms/dropdown-menu";
import { cn } from "@/lib/utils";

export type ActionDropdownItem = {
  value: string;
  label: React.ReactNode;
  Icon?: LucideIcon;
  checked?: boolean;
  showCheck?: boolean;
  disabled?: boolean;
};

type ActionDropdownProps = {
  triggerLabel: React.ReactNode;
  triggerAriaLabel?: string;
  items: ActionDropdownItem[];
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
  className?: string;
  contentClassName?: string;
  onSelect?: (value: string) => void;
};

export function ActionDropdown({
  triggerLabel,
  triggerAriaLabel,
  items,
  align = "end",
  className,
  contentClassName,
  onSelect,
}: ActionDropdownProps) {
  const renderActionDropdownItem = (item: ActionDropdownItem) => (
    <ActionDropdownMenuItem key={item.value} item={item} onSelect={onSelect} />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" className={className} aria-label={triggerAriaLabel}>
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn(
          "min-w-[200px] rounded-8 border border-neutral-100 bg-neutral-0 p-8 shadow-[0_10px_18px_rgba(34,38,39,0.16)] dark:border-neutral-dark-400 dark:bg-neutral-dark-800",
          contentClassName,
        )}
      >
        {items.map(renderActionDropdownItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionDropdownMenuItem({
  item,
  onSelect,
}: {
  item: ActionDropdownItem;
  onSelect?: (value: string) => void;
}) {
  const { Icon, checked = false, disabled = false, label, showCheck = true, value } = item;
  const handleSelect = () => {
    onSelect?.(value);
  };

  return (
    <DropdownMenuItem
      disabled={disabled}
      aria-checked={showCheck ? checked : undefined}
      className={cn(
        "min-h-40 cursor-pointer rounded-6 px-8 py-10 text-preset-4 text-neutral-800 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 dark:text-neutral-dark-100 dark:focus:bg-neutral-dark-600 dark:focus:text-neutral-0",
        Icon ? "gap-10" : "gap-0",
      )}
      onSelect={handleSelect}
    >
      {Icon ? <Icon className="size-16 shrink-0" aria-hidden="true" /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {showCheck && checked ? (
        <CheckIcon className="size-16 shrink-0 text-neutral-800 dark:text-neutral-dark-100" aria-hidden="true" />
      ) : null}
    </DropdownMenuItem>
  );
}
