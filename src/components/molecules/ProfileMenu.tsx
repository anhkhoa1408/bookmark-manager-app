import { LogOutIcon, MoonIcon, PaletteIcon, SunIcon, UserIcon, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

type ProfileMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type ProfileMenuProps = {
  user?: ProfileMenuUser | null;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  onLogout?: () => void | Promise<void>;
};

const themeOptions: Array<{ value: Theme; label: string; Icon: LucideIcon }> = [
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
];

export default function ProfileMenu({ user, theme, onThemeChange, onLogout }: ProfileMenuProps) {
  const [localTheme, setLocalTheme] = useState<Theme>("light");
  const activeTheme = theme ?? localTheme;
  const name = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email ?? "";
  const avatarUrl = user?.image ?? undefined;

  useEffect(() => {
    if (theme) return;

    setLocalTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, [theme]);

  const handleThemeChange = (nextTheme: Theme) => {
    onThemeChange?.(nextTheme);

    if (!theme) {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      setLocalTheme(nextTheme);
    }
  };

  return (
    <div className="w-[248px] overflow-hidden rounded-8 border border-neutral-100 bg-neutral-0 shadow-[0_6px_14px_rgba(34,38,39,0.1)] dark:border-neutral-dark-400 dark:bg-neutral-dark-800">
      <div className="border-b border-neutral-100 px-16 py-12 dark:border-neutral-dark-400">
        <div className="flex items-center gap-12">
          <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-neutral-800 dark:bg-neutral-dark-600 dark:text-neutral-dark-100">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <UserIcon className="size-20" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-preset-4 text-neutral-900 dark:text-neutral-0">{name}</p>
            <p className="truncate text-preset-4m text-neutral-800 dark:text-neutral-dark-100">{email}</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="flex h-48 items-center gap-10 rounded-6 p-8 text-neutral-800 dark:text-neutral-dark-100">
          <PaletteIcon className="size-16 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-preset-4">Theme</span>
          <div className="flex shrink-0 items-center overflow-hidden rounded-4 bg-neutral-300 p-2 dark:bg-neutral-dark-600">
            {themeOptions.map(({ value, label, Icon }) => (
              <ThemeButton
                key={value}
                Icon={Icon}
                isActive={activeTheme === value}
                label={label}
                onClick={() => handleThemeChange(value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-8 py-4 dark:border-neutral-dark-400">
        <button
          type="button"
          className="flex h-40 w-full items-center gap-10 rounded-6 p-8 text-left text-neutral-800 outline-hidden transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:text-neutral-dark-100 dark:hover:bg-neutral-dark-600 dark:focus-visible:bg-neutral-dark-600"
          onClick={() => {
            void onLogout?.();
          }}
        >
          <LogOutIcon className="size-16 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-preset-4">Logout</span>
        </button>
      </div>
    </div>
  );
}

function ThemeButton({
  Icon,
  isActive,
  label,
  onClick,
}: {
  Icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "flex items-center justify-center rounded-4 px-8 py-6 text-neutral-900 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-teal-700 dark:text-neutral-0 dark:focus-visible:ring-neutral-dark-100",
        isActive
          ? "bg-neutral-0 dark:bg-neutral-dark-300"
          : "text-neutral-800 hover:bg-neutral-0/60 dark:text-neutral-dark-100 dark:hover:bg-neutral-dark-500",
      )}
      onClick={onClick}
    >
      <Icon className="size-[14px]" aria-hidden="true" />
    </button>
  );
}
