"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await fetch(`/api/v1/invitations/${params.token}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to accept invitation:", error);
      }
    };

    acceptInvite();
  }, [params.token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h1 className="text-2xl font-bold">Accepting invitation...</h1>
        <p className="text-gray-600">You will be redirected shortly.</p>
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Go to login instead
        </Link>
      </div>
    </div>
  );
}
