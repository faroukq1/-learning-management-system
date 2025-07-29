'use client';

import { Button } from '@/components/ui/button';
import { tryCatch } from '@/hooks/try-catch';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { enrollInCourseAction } from '../action';
import { useConfetti } from '@/hooks/use-confetti';
import { Loader2 } from 'lucide-react';

export default function EnrollmentButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { triggerConfetti } = useConfetti();
  function onSubmit(courseId: string) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        enrollInCourseAction(courseId)
      );
      if (error) {
        toast.error('An unexpected error occurred. Please try again.');
      }

      if (result?.status == 'success') {
        toast.success(result.message);
        triggerConfetti();
        router.push('/admin/courses');
      } else if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }
  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={() => onSubmit(courseId)}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Enroll Now'
      )}
    </Button>
  );
}
