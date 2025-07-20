'use client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/themeToggle';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const sigout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          toast.success('logout');
        },
      },
    });
  };
  return (
    <div>
      <ThemeToggle />
      {session ? (
        <div>
          <p>{session.user.name}</p>
          <Button onClick={sigout}>Logout</Button>
        </div>
      ) : (
        <Button>LogIn</Button>
      )}
    </div>
  );
}
