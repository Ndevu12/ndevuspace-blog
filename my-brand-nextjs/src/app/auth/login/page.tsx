"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormValidation } from "../../../lib/authUtils";
import { useGuestGuard } from "../../../hooks/useAuthGuard";
import { LoginCredentials } from "../../../types/auth";
import Button from "@/components/atoms/Button/Button";
import Typography from "@/components/atoms/Typography/Typography";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const { errors, validateForm, clearFieldError } = useFormValidation();

  // Use guest guard to redirect authenticated users
  const { isLoading: guestLoading } = useGuestGuard();

  const [formData, setFormData] = useState<LoginCredentials>({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      clearFieldError(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData);
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      // Manually redirect after successful login
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-black to-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Typography
              variant="h1"
              className="text-accent font-bold text-3xl mb-2"
            >
              NdevuSpace
            </Typography>
          </Link>
          <Typography variant="p" className="text-gray-300">
            Sign in to your dashboard
          </Typography>
        </div>

        {/* Login Form */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <Typography variant="small" className="text-red-400">
                  {error}
                </Typography>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  errors.username
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-accent"
                }`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {errors.username && (
                <Typography
                  variant="small"
                  className="text-red-400 animate-pulse"
                >
                  {errors.username}
                </Typography>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/20 focus:border-accent"
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <Typography
                  variant="small"
                  className="text-red-400 animate-pulse"
                >
                  {errors.password}
                </Typography>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-accent bg-white/5 border-white/20 rounded focus:ring-accent/50 focus:ring-2"
                />
                <Typography variant="small" className="text-gray-300">
                  Remember me
                </Typography>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-accent to-yellow-400 hover:from-accent/90 hover:to-yellow-400/90 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
