'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Hook to require authentication for a page
 * Automatically checks auth status and redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { user, loading, initialCheckDone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for initial auth check, then redirect if not authenticated
    if (initialCheckDone && !user && !loading) {
      router.push('/login');
    }
  }, [user, loading, initialCheckDone, router]);

  // Return loading as true if initial check is not done yet
  return { user, loading: loading || !initialCheckDone };
}
