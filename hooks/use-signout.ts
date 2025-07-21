'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useSignOut() {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success('Signed out Successfully');
        },
        onError: () => {
          toast.error('Failed to SignOut');
        },
      },
    });
  };

  return handleSignOut;
}
