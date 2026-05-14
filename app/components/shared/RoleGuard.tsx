'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  required: 'operator' | 'citizen';
  children: React.ReactNode;
}

export default function RoleGuard({ required, children }: Props) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('namma_role');
    if (role !== required) {
      router.replace('/');
    } else {
      setVerified(true);
    }
  }, [required, router]);

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
