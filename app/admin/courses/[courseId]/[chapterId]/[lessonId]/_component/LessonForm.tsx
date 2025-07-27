'use client';

import { AdminLessonType } from '@/app/data/admin/admin-get-lesson';
import Uploader from '@/components/file-uploader/Uploader';
import RichTextEditor from '@/components/rich-text-editor/Editor';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { tryCatch } from '@/hooks/try-catch';
import { lessonSchema, LessonSchemaType } from '@/lib/zodSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { updateLesson } from '../action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface iAppProps {
  data: AdminLessonType;
  chapterId: string;
  courseId: string;
}
export default function LessonForm({ data, chapterId, courseId }: iAppProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema as any),
    defaultValues: {
      name: data.title,
      chapterId: chapterId,
      courseId: courseId,
      description: data.description ?? undefined,
      videoKey: data.videoKey ?? undefined,
      thumbnailKey: data.thumbnailKey ?? undefined,
    },
  });

  function onSubmit(values: LessonSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateLesson(values, data.id)
      );
      if (error) {
        toast.error('An unexpected error occurred. Please try again.');
      }

      if (result?.status == 'success') {
        toast.success(result.message);
        form.reset();
        router.push(`/admin/courses/${courseId}/edit`);
      } else if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  return (
    <div>
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className={buttonVariants({ variant: 'outline', className: 'mb-6' })}
      >
        <ArrowLeft className="size-4" />
        <span>Go Back</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Configuration</CardTitle>
          <CardDescription>
            Configure the video and description for this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chatper xyz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <Uploader
                        onChange={field.onChange}
                        value={field.value}
                        fileTypeAccepted="image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <Uploader
                        onChange={field.onChange}
                        value={field.value}
                        fileTypeAccepted="video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={pending} type="submit">
                {pending ? 'Saving...' : 'Save Lesson'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
