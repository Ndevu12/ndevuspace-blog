import { createClient } from "@/lib/supabase/client";
import type { LoginCredentials, AuthResponse, User } from "@/types/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ─── Error Handling ───

function getAuthErrorMessage(error: string | null): string {
  if (!error) {
    return "Authentication failed";
  }

  // Supabase returns free-form messages; normalize only common credential failures.
  const normalized = error.toLowerCase();
  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("email not confirmed")
  ) {
    return "Invalid email or password";
  }

  return error;
}

function mapSupabaseUser(user: SupabaseUser): User {
  const metadata = user.user_metadata ?? {};
  return {
    _id: user.id,
    username: metadata.username ?? user.email ?? "",
    email: user.email ?? "",
    firstName: metadata.firstName ?? "",
    lastName: metadata.lastName ?? "",
    role: metadata.role ?? "user",
    createdAt: user.created_at ?? new Date().toISOString(),
    updatedAt: user.updated_at ?? user.created_at ?? new Date().toISOString(),
  };
}

// ─── Auth Service ───

class AuthService {
  /** Login user with credentials */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user) {
      throw new Error(getAuthErrorMessage(error?.message ?? null));
    }

    return {
      message: "Login successful",
      user: mapSupabaseUser(data.user),
    };
  }

  /** Logout current user */
  async logout(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(getAuthErrorMessage(error.message ?? null));
    }
  }

  /** Get current user (check if authenticated) */
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return mapSupabaseUser(data.user);
  }
}

export const authService = new AuthService();
