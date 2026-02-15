import { useMemo } from "react";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="field" className={cn(["flex flex-col gap-6"], className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("text-preset-4", className)} {...props} />;
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="field-description" className={cn(["text-preset-4m text-neutral-800"], className)} {...props} />;
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="flex flex-col gap-6">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && (
              <li key={index} className="text-red-800 text-preset-4m">
                {error.message}
              </li>
            ),
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div role="alert" data-slot="field-error" className="text-red-800 text-preset-4m" {...props}>
      {content}
    </div>
  );
}

export { Field, FieldDescription, FieldError, FieldLabel };
