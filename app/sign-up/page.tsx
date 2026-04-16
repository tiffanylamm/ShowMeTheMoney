"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authClient.signUp.email(
        {
          name,
          email,
          password,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message ?? "Sign up failed");
          },
          onSuccess: () => {
            router.replace("/");
          },
        },
      );
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#131314] flex items-center justify-center">
      <div className="w-full max-w-xs flex flex-col justify-center items-center">
        {/* Header */}
        <h1 className="pb-5 text-2xl font-semibold text-gray-900 dark:text-foreground">
          Create your account
        </h1>
        {/* Connect With */}
        <div className="w-full flex flex-col justify-center text-center">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[11px] mb-5">
            <div className="h-px w-full bg-gray-600 dark:bg-gray-400"></div>{" "}
            <p className="text-nowrap">Connect to ShowMeTheMoney with</p>
            <div className="h-px w-full bg-gray-600 dark:bg-gray-400"></div>{" "}
          </div>
          <button
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              })
            }
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-1 text-[11px] font-medium text-gray-900 dark:text-foreground border border-gray-400 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Google
          </button>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full py-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[11px] mb-2">
            <div className="h-px w-full bg-gray-600 dark:bg-gray-400"></div>{" "}
            <p className="text-nowrap">Or continue with Email</p>
            <div className="h-px w-full bg-gray-600 dark:bg-gray-400"></div>{" "}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-900 dark:text-foreground font-medium">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-3 py-1 text-[11px] text-gray-900 dark:text-foreground bg-transparent dark:bg-neutral-900 border border-gray-400 dark:border-gray-500 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-foreground transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-900 dark:text-foreground font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-1 text-[11px] text-gray-900 dark:text-foreground bg-transparent dark:bg-neutral-900 border border-gray-400 dark:border-gray-500 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-foreground transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-900 dark:text-foreground font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter a unique password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-1 pr-10 text-[11px] text-gray-900 dark:text-foreground bg-transparent dark:bg-neutral-900 border border-gray-400 dark:border-gray-500 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-foreground transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-foreground transition-colors"
              >
                {showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-1 text-[11px] font-medium text-gray-900 dark:text-foreground bg-transparent border border-gray-400 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Please wait…" : "Continue"}
          </button>

          <p className="text-[10px]">
            By creating an account you agree to the{" "}
            <a href="" className="underline">
              Terms of Service
            </a>{" "}
            and our{" "}
            <a href="" className="underline">
              Privacy Policy
            </a>
            .
          </p>

          <p className="text-[14px]">
            Already have an account?{" "}
            <a href="/sign-in" className="text-blue-400">
              Login
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path
        d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87Z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.71 5.29-1.93l-2.57-2a4.8 4.8 0 0 1-7.16-2.52H.9v2.07A8 8 0 0 0 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.56 9.55A4.82 4.82 0 0 1 3.3 8c0-.54.09-1.06.25-1.55V4.38H.9A8.01 8.01 0 0 0 0 8c0 1.29.31 2.51.9 3.62l2.66-2.07Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.94 7.94 0 0 0 8 0 8 8 0 0 0 .9 4.38l2.66 2.07A4.77 4.77 0 0 1 8 3.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}
