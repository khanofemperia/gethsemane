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

    console.log("Starting Google sign-in");
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(clientAuth, googleProvider);

      // Check if admin is trying to sign in through regular flow
      if (result.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        await clientAuth.signOut(); // Sign out immediately
        alert("Please use your admin key to access the admin panel");
        setIsSigningIn(false);
        return;
      }

      console.log("Sign in successful:", result.user.email);

      if (result?.user) {
        const idToken = await result.user.getIdToken();
        console.log("Got ID token, creating session");

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add referrer for entry point verification
            "X-Entry-Point": window.location.pathname,
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Session creation response:", data);

        if (data.success) {
          console.log("Redirecting to:", callbackUrl || "/");
          router.push(callbackUrl || "/");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="opacity-50">
        Loading...
      </button>
    );
  }

  if (user) {
    return null;
  }

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
