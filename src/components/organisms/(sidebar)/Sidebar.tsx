import { ArchiveIcon, HomeIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/molecules/Logo";
import { TagCheckboxPanel } from "@/components/organisms/TagCheckboxPanel";
import type { TagOption } from "@/server/tags";

type SidebarProps = {
  tags: TagOption[];
  selectedTagIds: string[];
  onTagCheckedChange: (tagId: string, checked: boolean) => void;
};

const navItems = [
  { label: "Home", Icon: HomeIcon, to: "/home" },
  { label: "Archived", Icon: ArchiveIcon, to: "/archived" },
];

export default function Sidebar({ tags, selectedTagIds, onTagCheckedChange }: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col items-start border-r border-neutral-300 bg-neutral-0 dark:border-neutral-dark-500 dark:bg-neutral-dark-800">
      <nav className="flex min-h-0 w-full flex-1 flex-col gap-16">
        <div className="flex w-full flex-col items-start justify-center gap-20 px-20 pb-10 pt-20">
          <Logo />
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-16 overflow-hidden px-16 pb-20">
          <div className="flex w-full flex-col items-start">
            {navItems.map(({ label, Icon, to }) => (
              <Link key={label} to={to} className="flex w-full items-center overflow-hidden py-2 text-left">
                {({ isActive }) => (
                  <span
                    className={
                      isActive
                        ? "flex min-w-0 flex-1 items-center gap-12 rounded-6 border border-neutral-100 bg-neutral-100 px-12 py-8 text-neutral-900 dark:border-neutral-dark-600 dark:bg-neutral-dark-600 dark:text-neutral-0"
                        : "flex min-w-0 flex-1 items-center gap-12 rounded-6 bg-neutral-0 px-12 py-8 text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-dark-800 dark:text-neutral-dark-100 dark:hover:bg-neutral-dark-600"
                    }
                  >
                    <Icon className="size-20 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 truncate text-preset-3">{label}</span>
                  </span>
                )}
              </Link>
            ))}
          </div>

          <TagCheckboxPanel
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagCheckedChange={onTagCheckedChange}
          />
        </div>
      </nav>
    </aside>
  );
}
