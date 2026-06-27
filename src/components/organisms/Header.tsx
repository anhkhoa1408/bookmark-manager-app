import { PlusIcon, SearchIcon } from "lucide-react";
import { signOut as signOutFirebase } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/atoms/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/atoms/input-group";
import { BookmarkDialog } from "@/components/molecules/BookmarkDialog";
import Avatar from "@/components/molecules/Avatar";
import ProfileMenu from "@/components/molecules/ProfileMenu";
import { authClient } from "@/lib/auth-client";
import { auth as firebaseAuth } from "@/lib/firebase";

export default function Header() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await Promise.allSettled([authClient.signOut(), signOutFirebase(firebaseAuth)]);
    await navigate({ to: "/auth/sign-in" });
  };

  return (
    <header className="flex items-center justify-between border-b border-neutral-300 bg-neutral-0 px-32 py-16 dark:border-neutral-dark-400 dark:bg-neutral-dark-800">
      <div className="max-w-xs w-full">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon className="size-20" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search by title..." />
        </InputGroup>
      </div>
      <div className="flex items-center gap-16">
        <BookmarkDialog
          title="Add a Bookmark"
          description="Save a link with details to keep your collection organized."
          submitLabel="Add Bookmark"
          triggerLabel={
            <>
              <PlusIcon className="size-20" />
              Add Bookmark
            </>
          }
        />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-0 border-0 bg-transparent p-0 shadow-none">
            <ProfileMenu user={session?.user} onLogout={handleLogout} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
