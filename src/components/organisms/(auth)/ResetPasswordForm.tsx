import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "../../atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../atoms/card";
import { Field, FieldError, FieldLabel } from "../../atoms/field";
import { Input } from "../../atoms/input";
import { Logo } from "../../molecules/Logo";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { oobCode } = useSearch({
    from: "/auth/_auth/reset-password",
  });

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordFormSchema,
      onBlur: resetPasswordFormSchema,
    },
    onSubmit: async (values) => {
      try {
        if (!oobCode) {
          toast.error("Invalid or missing password reset code.");
          return;
        }

        toast.loading("Resetting password...");
        const { password } = values.value;
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, password);
        toast.dismiss();
        toast.success("Password has been reset successfully.");
        navigate({ to: "/auth/sign-in" });
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to reset password. Please try again later.");
      }
    },
  });

  return (
    <div className="w-full md:w-4/12">
      <Card>
        <Logo />
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below. Make sure it’s strong and secure.</CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <CardContent>
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>New Password *</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Confirm password *</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Subscribe>
              {({ isSubmitting }) => (
                <Button type="submit" disabled={isSubmitting}>
                  Reset password
                </Button>
              )}
            </form.Subscribe>
          </CardContent>
        </form>

        <Link to="/auth/sign-in" className="font-bold text-preset-4 mx-auto">
          Back to login
        </Link>
      </Card>
    </div>
  );
};
