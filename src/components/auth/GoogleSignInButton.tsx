"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleSignInButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(clientAuth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Send the ID token to your backend to create a session cookie
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const { isAdmin } = await response.json();
        
        // Handle the sign-in based on the admin status
        if (isAdmin) {
          // Admin signed in through admin portal
          router.push(callbackUrl || "/admin");
        } else {
          // Non-admin tried to sign in through admin portal
          router.push("/");
        }
        return;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-50"
    >
      Sign in with Google
    </button>
  );
}
