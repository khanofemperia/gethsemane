"use client";

import { clientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    try {
      await clientAuth.signOut();

      // Clear the session cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/auth"); // Redirect to auth page after signing out
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={signOut}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}
