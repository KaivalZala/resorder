import { createBrowserClient } from "@supabase/ssr"

/**
 * Read environment variables **once** at module load so Webpack/Next.js
 * can statically replace them. These are automatically injected when the
 * variable name starts with `NEXT_PUBLIC_` in the browser bundle.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Make it obvious if the required env-vars are missing. This prevents the
 * generic “Your project’s URL and API key are required” error coming from
 * `@supabase/ssr`.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    [
      "❌ Supabase environment variables are missing!",
      "Make sure BOTH `NEXT_PUBLIC_SUPABASE_URL` and",
      "`NEXT_PUBLIC_SUPABASE_ANON_KEY` are defined.",
      "You can add them in your Vercel project settings or",
      "a local `.env.local` file when developing locally.",
    ].join(" "),
  )
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
