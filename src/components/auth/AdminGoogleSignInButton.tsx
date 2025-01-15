"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminGoogleSignInButton() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, loading } = useAuth();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      // Store the entry point before sign in
      const entryPoint = currentPath;

      const result = await signInWithPopup(clientAuth, googleProvider);
      if (!result?.user) return;

      const idToken = await result.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Entry-Point": entryPoint, // Use stored entry point
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data.success:", data.success);
      router.push("/admin");
    } catch (error) {
      console.error("Error during admin sign-in:", error);
      await clientAuth.signOut();
      if (
        error instanceof Error &&
        error.message === "Invalid authentication path"
      ) {
        alert("You are not authorized to access the admin area.");
      } else {
        alert(error instanceof Error ? error.message : "Sign in failed");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="opacity-50 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow"
      >
        Loading...
      </button>
    );
  }

  if (user) return null;

  return (
    <button
      onClick={signInWithGoogle}
      disabled={isSigningIn}
      className={`flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 ${
        isSigningIn ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      {isSigningIn ? "Signing in..." : "Sign in as Admin"}
    </button>
  );
}
