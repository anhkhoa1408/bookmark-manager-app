import { UserIcon } from "lucide-react";

const Avatar = () => {
  return (
    <div className="flex size-40 items-center justify-center rounded-full ring-2 ring-teal-700 ring-offset-2 ring-offset-neutral-0 dark:ring-offset-neutral-dark-800">
      <UserIcon className="text-neutral-800 dark:text-neutral-0" />
    </div>
  );
};

export default Avatar;
