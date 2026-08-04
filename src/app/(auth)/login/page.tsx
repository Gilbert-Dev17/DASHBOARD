import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 mesh-gradient overflow-hidden">
      <div className="absolute inset-0 noise-overlay mix-blend-overlay z-0"></div>
      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        <LoginForm />
      </div>
    </div>
  )
}