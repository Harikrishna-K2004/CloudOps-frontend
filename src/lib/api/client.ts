import { supabase } from "@/src/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.access_token) {
    headers.set(
      "Authorization",
      `Bearer ${session.access_token}`,
    );
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}