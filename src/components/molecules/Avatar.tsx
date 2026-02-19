import { auth } from "@/lib/firebase";
import { UserIcon } from "lucide-react";
import { useEffect } from "react";

const Avatar = () => {
  useEffect(() => {
    console.log(auth.currentUser);
  }, [auth.currentUser]);

  return (
    <div className="flex items-center justify-center rou  nded-full size-40 ring-offset-2 ring-offset-neutral-0 ring-2 ring-teal-700">
      {/* <img src="" alt="avatar" /> */}
      <UserIcon />
    </div>
  );
};

export default Avatar;
