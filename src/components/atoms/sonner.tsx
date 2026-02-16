import { CheckIcon, CircleXIcon, InfoIcon, Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset={{
        top: 100,
        right: 40,
      }}
      toastOptions={{
        classNames: {
          default:
            "flex items-center gap-8! px-12! py-10! rounded-8! border! border-[1px]! border-neutral-300! bg-neutral-0! shadow-[0_6px_9px_0_rgba(21,21,21,0.08)]!",
          title: "text-preset-4m! text-neutral-900!",
          icon: "m-0! shrink-0! text-neutral-900!",
          closeButton:
            "relative! order-1! shrink-0! m-0! size-20! text-neutral-900! bg-transparent! transform-none! border-0!",
        },
      }}
      closeButton
      icons={{
        success: <CheckIcon className="size-20!" />,
        info: <InfoIcon className="size-20!" />,
        warning: <TriangleAlertIcon className="size-20!" />,
        error: <CircleXIcon className="size-20!" />,
        loading: <Loader2Icon className="size-20! animate-spin" />,
        close: <XIcon className="size-20!" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
