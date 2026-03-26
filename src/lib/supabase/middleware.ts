import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserRoleById } from "@/features/auth/services/authRoleService";
import { getSupabasePublicConfigOptional } from "@/lib/config";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request,
  });
  const config = getSupabasePublicConfigOptional();
  if (!config) {
    return response;
  }

  try {
    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith("/dashboard")) {
      if (!user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const role = ((await getUserRoleById(supabase, user.id)) ?? "user").trim().toLowerCase();
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/blog?accessDenied=1", request.url));
      }
    }
  } catch {
    return response;
  }
  return response;
};
