import { auth } from "@/lib/firebase/firebase";
import { UserIcon } from "lucide-react";
import { useEffect } from "react";

const Avatar = () => {
  useEffect(() => {
    console.log(auth.currentUser);
  }, [auth.currentUser]);

  return (
    <div className="flex size-40 items-center justify-center rounded-full ring-2 ring-teal-700 ring-offset-2 ring-offset-neutral-0 dark:ring-offset-neutral-dark-800">
      {/* <img src="" alt="avatar" /> */}
      <UserIcon className="text-neutral-800 dark:text-neutral-0" />
    </div>
  );
};

export default Avatar;
