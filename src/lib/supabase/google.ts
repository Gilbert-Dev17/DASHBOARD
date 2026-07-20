import { createBrowserClient } from '@supabase/ssr'

const handleGoogleLogin = async () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Redirect them to your app's callback route to securely establish the session
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}