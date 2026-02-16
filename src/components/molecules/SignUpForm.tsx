import { auth } from "@/lib/firebase";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateCurrentUser } from "firebase/auth";
import React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "../atoms/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../atoms/card";
import { Field, FieldError, FieldLabel } from "../atoms/field";
import { Input } from "../atoms/input";
import { Logo } from "./Logo";

const signUpFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpFormSchema,
      onBlur: signUpFormSchema,
    },
    onSubmit: async (values) => {
      try {
        toast.loading("Creating account...");
        const { fullName, email, password } = values.value;
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateCurrentUser(auth, Object.assign(credential.user, { displayName: fullName }));
        await sendEmailVerification(credential.user);
        await signOut(auth);
        toast.dismiss();
        toast.success(
          "Account created successfully! Please check your email to verify your account before logging in.",
        );
        navigate({ to: "/auth/sign-in" });
      } catch (error) {
        toast.dismiss();
        if (error instanceof FirebaseError) {
          if (error.code === "auth/email-already-in-use") {
            toast.error("This email is already in use. Please use a different email or log in.");
            return;
          }
        }

        toast.error("Failed to create account. Please check your details and try again.");
      }
    },
  });

  return (
    <div className="w-full md:w-4/12">
      <Card>
        <Logo />
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Join us and start saving your favorite links — organized, searchable, and always within reach.
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
              name="fullName"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Full name *</FieldLabel>
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
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email address *</FieldLabel>
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
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password *</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
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
                  Create account
                </Button>
              )}
            </form.Subscribe>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col items-center gap-12">
          <p className="inline-flex gap-6">
            <span>Already have an account?</span>
            <Link to="/auth/sign-in" className="font-bold">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
