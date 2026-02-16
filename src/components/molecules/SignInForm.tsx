"use client";

import { auth } from "@/lib/firebase";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import * as z from "zod";
import { Button } from "../atoms/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../atoms/card";
import { Field, FieldError, FieldLabel } from "../atoms/field";
import { Input } from "../atoms/input";
import { Logo } from "./Logo";

const signInFormSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const SignInForm: React.FC = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInFormSchema,
      onBlur: signInFormSchema,
    },
    onSubmit: async (values) => {
      const { email, password } = values.value;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      const idToken = await user.getIdToken();
      await fetch("/api/auth/firebase/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
    },
  });

  return (
    <div className="w-full md:w-4/12">
      <Card>
        <Logo />
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>Welcome back! Please enter your details.</CardDescription>
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
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                  Log in
                </Button>
              )}
            </form.Subscribe>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col items-center gap-12">
          <p className="inline-flex gap-6">
            <span>Forgot password?</span>
            <Link to="/auth/sign-up" className="font-bold">
              Reset it
            </Link>
          </p>
          <p className="inline-flex gap-6">
            <span>Don’t have an account?</span>
            <Link to="/auth/sign-up" className="font-bold">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
