import { createClient } from "@/lib/supabase/client";
import type { LoginCredentials, AuthResponse, User } from "@/types/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function getAuthErrorMessage(error: string | null): string {
  if (!error) return "Authentication failed";

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
  return {
    id: user.id,
    username: user.email ?? "",
    email: user.email ?? "",
    firstName: "",
    lastName: "",
    role: "user",
    createdAt: user.created_at ?? new Date().toISOString(),
    updatedAt: user.updated_at ?? user.created_at ?? new Date().toISOString(),
  };
}

type UserProfileRow = {
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
};

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "user").trim().toLowerCase();
}

class AuthService {
  private async loadUserProfile(userId: string): Promise<UserProfileRow | null> {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_profiles")
      .select("username, first_name, last_name, role, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle<UserProfileRow>();

    return data ?? null;
  }

  private async buildAppUser(user: SupabaseUser): Promise<User> {
    const baseUser = mapSupabaseUser(user);
    const profile = await this.loadUserProfile(user.id);
    if (!profile) {
      return baseUser;
    }

    return {
      ...baseUser,
      username: profile.username,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: normalizeRole(profile.role),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

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
      user: await this.buildAppUser(data.user),
    };
  }

  async logout(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(getAuthErrorMessage(error.message ?? null));
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return await this.buildAppUser(data.user);
  }
}

export const authService = new AuthService();

