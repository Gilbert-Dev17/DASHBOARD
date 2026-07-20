"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { Spinner } from "./ui/spinner"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Controller } from 'react-hook-form'
import { GalleryVerticalEndIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { loginSchema , type LoginInput } from "@/lib/validations/login"
import { LogIn } from "@/app/(auth)/login/action"
import { toast } from "sonner";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    reset, handleSubmit, control, formState: { isSubmitting },
  }= useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const result = await LogIn(values);

      if (!result.ok) {
        toast.error(result.error ?? "Login Failed");
        return;
      }
      reset({
        email: "",
        password: "",
      });
      toast.success("Logged in successfully");
      router.replace("/home");

    } catch {
      toast.error("Something went wrong");
    }
}
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
          id="logIn-submit"
          onSubmit={handleSubmit(onSubmit)}
          aria-label="Login form" noValidate >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">DASHBOARD</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to DASHBOARD</h1>

          </div>
          <Controller
            name='email'
            control={control}
            render={({ field, fieldState }) =>(
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="m@example.com"
                  disabled={isSubmitting}
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
            </Field>
            )}>
          </Controller>

          <Controller
            name='password'
            control={control}
            render={({ field, fieldState}) => (
              <Field data-invalid={fieldState.invalid} >
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={fieldState.invalid}
                    placeholder="password"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                 {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}

              </Field>
            )}>
          </Controller>
          <Field>
            <Button type="submit" form='logIn-submit' disabled={isSubmitting}>
              {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Logging in...
                  </>
                ) : ("Login")}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
