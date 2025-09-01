
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // The main dashboard page should always redirect to the overview.
    router.replace('/dashboard/overview');
  }, [router]);

  // Return a loading state or null while redirecting
  return null;
}
