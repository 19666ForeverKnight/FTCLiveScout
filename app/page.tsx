'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">FTC Live Scout</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Live scouting system for FTC competitions
          </p>
        </div>

        {!loading && (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            {user ? (
              <>
                <div className="text-center sm:text-left mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Signed in as <span className="font-semibold">{user.name || user.email}</span>
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
