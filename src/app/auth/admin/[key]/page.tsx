"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminGoogleSignInButton from "@/components/auth/AdminGoogleSignInButton";

export default function AdminEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryKey = params.key as string;

  useEffect(() => {
    // If someone tries to access /admin directly without a key
    if (!entryKey) {
      router.replace("/");
    }
  }, [entryKey, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your authorized admin Google account
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <AdminGoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
