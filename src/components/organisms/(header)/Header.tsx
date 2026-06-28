import { PlusIcon, SearchIcon } from "lucide-react";
import { signOut as signOutFirebase } from "firebase/auth";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/atoms/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/atoms/input-group";
import { BookmarkDialog, type BookmarkFormValues } from "@/components/molecules/BookmarkDialog";
import Avatar from "@/components/molecules/Avatar";
import { BookmarkImportDialog } from "@/components/organisms/BookmarkImportDialog";
import ProfileMenu from "@/components/molecules/ProfileMenu";
import { authClient } from "@/lib/firebase/auth-client";
import { useBookmarkFilters } from "@/lib/contexts/bookmark-filters";
import { auth as firebaseAuth } from "@/lib/firebase/firebase";
import type { ParsedBookmarkImport } from "@/lib/bookmark-import";
import { createBookmark } from "@/server/bookmarks";
import { createImportJob, getImportJob } from "@/server/importJobs";

export default function Header() {
  const navigate = useNavigate();
  const router = useRouter();
  const { searchTerm, onSearchTermChange } = useBookmarkFilters();
  const { data: session } = authClient.useSession();
  const [activeImportJobId, setActiveImportJobId] = useState<string | null>(null);
  const createBookmarkMutation = useMutation({
    mutationFn: (values: BookmarkFormValues) => createBookmark({ data: values }),
    onSuccess: async () => {
      toast.success("Bookmark saved");
      await router.invalidate();
    },
    onError: () => {
      toast.error("Could not save bookmark");
    },
  });
  const importBookmarksMutation = useMutation({
    mutationFn: (bookmarks: ParsedBookmarkImport[]) => createImportJob({ data: { bookmarks } }),
    onSuccess: (job) => {
      setActiveImportJobId(job.id);
      toast.success(`Import queued for ${job.totalCount.toLocaleString("en")} bookmarks`);
    },
    onError: () => {
      toast.error("Could not queue bookmark import");
    },
  });

  useEffect(() => {
    if (!activeImportJobId) {
      return;
    }

    let isActive = true;
    const intervalId = window.setInterval(() => {
      void getImportJob({ data: { jobId: activeImportJobId } })
        .then(async (job) => {
          if (!isActive) {
            return;
          }

          if (job.status === "succeeded") {
            setActiveImportJobId(null);
            toast.success(`Imported ${job.importedCount.toLocaleString("en")} bookmarks`);
            await router.invalidate();
          }

          if (job.status === "failed") {
            setActiveImportJobId(null);
            toast.error(job.lastError ?? "Bookmark import failed");
            await router.invalidate();
          }
        })
        .catch(() => {
          if (isActive) {
            toast.error("Could not refresh import status");
            setActiveImportJobId(null);
          }
        });
    }, 6000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [activeImportJobId, router]);

  const handleLogout = async () => {
    await Promise.allSettled([authClient.signOut(), signOutFirebase(firebaseAuth)]);
    await navigate({ to: "/auth/sign-in" });
  };

  const handleCreateBookmark = async (values: BookmarkFormValues) => {
    await createBookmarkMutation.mutateAsync(values);
  };

  const handleImportBookmarks = async (bookmarks: ParsedBookmarkImport[]) => {
    return importBookmarksMutation.mutateAsync(bookmarks);
  };

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-neutral-300 bg-neutral-0 px-32 py-16 dark:border-neutral-dark-400 dark:bg-neutral-dark-800">
      <div className="max-w-xs w-full">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon className="size-20" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search bookmarks by title"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </InputGroup>
      </div>
      <div className="flex items-center gap-16">
        <BookmarkImportDialog onImport={handleImportBookmarks} />

        <BookmarkDialog
          title="Add a Bookmark"
          description="Save a link with details to keep your collection organized."
          submitLabel="Add Bookmark"
          onSubmit={handleCreateBookmark}
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
