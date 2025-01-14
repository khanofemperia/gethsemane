// SignOutButton.tsx
"use client";

import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      // Sign out from Firebase
      await clientAuth.signOut();

      // Clear the session cookie
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push("/"); // Redirect to home page after signing out
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={signOut}
      disabled={isSigningOut}
      className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${
        isSigningOut ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
