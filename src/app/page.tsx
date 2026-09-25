'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem('admin_token') ? '/dashboard' : '/login');
  }, [router]);
  return null;
}
