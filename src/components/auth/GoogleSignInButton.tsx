"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleSignInButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, loading } = useAuth();

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      const result = await signInWithPopup(clientAuth, googleProvider);
      if (!result?.user) return;

      const idToken = await result.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Entry-Point": window.location.pathname,
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch (error) {
      // Sign out on any error to ensure clean state
      await clientAuth.signOut();
      alert(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading)
    return (
      <button disabled className="opacity-50">
        Loading...
      </button>
    );
  if (user) return null;

  return (
    <button
      onClick={signInWithGoogle}
      disabled={isSigningIn}
      className={`flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-50 ${
        isSigningIn ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSigningIn ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
