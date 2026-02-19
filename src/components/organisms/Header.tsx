import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import Avatar from "../molecules/Avatar";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-32 py-16 bg-neutral-0 ">
      <div className="max-w-xs w-full">
        <Input placeholder="Search by title..." />
      </div>
      <div className="flex items-center gap-16">
        <Button>Add Bookmark</Button>
        <Avatar />
      </div>
    </header>
  );
}
