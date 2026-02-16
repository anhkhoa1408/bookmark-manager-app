import { auth } from "@/lib/firebase";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "../atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../atoms/card";
import { Field, FieldError, FieldLabel } from "../atoms/field";
import { Input } from "../atoms/input";
import { Logo } from "./Logo";

const forgotPasswordFormSchema = z.object({
  email: z.email("Invalid email"),
});

export const ForgotPasswordForm: React.FC = () => {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordFormSchema,
      onBlur: forgotPasswordFormSchema,
    },
    onSubmit: async (values) => {
      try {
        toast.loading("Sending password reset email...");
        const { email } = values.value;
        await sendPasswordResetEmail(auth, email, {
          url: `${import.meta.env.VITE_DOMAIN}/auth/reset-password`,
        });
        toast.dismiss();
        toast.success("Password reset email sent. Please check your inbox.");
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to send password reset email. Please try again later.");
      }
    },
  });

  return (
    <div className="w-full md:w-4/12">
      <Card>
        <Logo />
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address below and we’ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <CardContent>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email *</FieldLabel>
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
                  Send reset link
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
