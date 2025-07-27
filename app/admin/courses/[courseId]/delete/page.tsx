'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tryCatch } from '@/hooks/try-catch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteCourse } from './action';
import { Loader2, Trash2 } from 'lucide-react';

export default function DeleteCourseRoute() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteCourse(courseId));
      if (error) {
        toast.error('An unexpected error occurred. Please try again.');
      }

      if (result?.status == 'success') {
        toast.success(result.message);
        router.push('/admin/courses');
      } else if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="max-xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>This action can not be undone.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <Link
            href="/admin/courses"
            className={buttonVariants({
              variant: 'outline',
            })}
          >
            Cancel
          </Link>

          <Button
            className={buttonVariants({
              variant: 'destructive',
            })}
            disabled={pending}
            onClick={onSubmit}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
