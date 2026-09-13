import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background overflow-hidden">
      <div className="halftone-pattern halftone-fade-corner absolute inset-0 opacity-30 pointer-events-none z-0" />
      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        <LoginForm />
      </div>
    </div>
  )
}