import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "../atoms/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../atoms/input-group";
import Avatar from "../molecules/Avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../atoms/dropdown-menu";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-32 py-16 bg-neutral-0 ">
      <div className="max-w-xs w-full">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon className="size-20" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search by title..." />
        </InputGroup>
      </div>
      <div className="flex items-center gap-16">
        <Button asChild>
          <button>
            <PlusIcon className="size-20" />
            Add Bookmark
          </button>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <div className="flex items-start gap-12">
                <Avatar />
                <div>
                  <p className="text-preset-4">name</p>
                  <p className="text-preset-4m">email</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
