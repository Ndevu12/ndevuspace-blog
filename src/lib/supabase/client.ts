import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfigRequired } from "@/lib/config";

export const createClient = () => {
  try {
    const { url, anonKey } = getSupabasePublicConfigRequired();
    console.log("Creating Supabase client.");
    const client = createBrowserClient(url, anonKey);
    console.log("Supabase client created.");
    return client;
  } catch (error) {
    console.error("Error creating Supabase client.");
    throw error;
  }
};
