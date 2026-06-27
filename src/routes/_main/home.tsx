import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { ActionDropdown, type ActionDropdownItem } from "@/components/molecules/ActionDropdown";

export const Route = createFileRoute("/_main/home")({
  component: RouteComponent,
});

const sortOptions = [
  { value: "recently-added", label: "Recently added" },
  { value: "recently-visited", label: "Recently visited" },
  { value: "most-visited", label: "Most visited" },
] satisfies ActionDropdownItem[];

function RouteComponent() {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0].value);
  const selectedSortLabel = sortOptions.find((option) => option.value === selectedSort)?.label;

  return (
    <main className="p-32">
      <div className="flex items-center justify-between gap-16">
        <div>
          <h1 className="text-preset-1 text-neutral-900 dark:text-neutral-0">Bookmarks</h1>
          <p className="text-preset-4m text-neutral-800 dark:text-neutral-dark-100">Manage your saved links.</p>
        </div>
        <ActionDropdown
          triggerLabel={
            <>
              {selectedSortLabel}
              <ChevronDownIcon className="size-16" aria-hidden="true" />
            </>
          }
          items={sortOptions.map((option) => ({
            ...option,
            checked: option.value === selectedSort,
          }))}
          onSelect={setSelectedSort}
        />
      </div>
    </main>
  );
}
