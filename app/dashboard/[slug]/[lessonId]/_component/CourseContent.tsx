'use client';

import { LessonContentType } from '@/app/data/course/get-lesson-content';
import RenderDescription from '@/components/rich-text-editor/RenderDescription';
import { Button } from '@/components/ui/button';
import { tryCatch } from '@/hooks/try-catch';
import { useConfetti } from '@/hooks/use-confetti';
import useConstructUrl from '@/hooks/use-construct-url';
import { BookIcon, CheckCircle, CheckCircle2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { MarkLessonComplete } from '../action';

interface iAppProps {
  data: LessonContentType;
}

export default function CourseContent({ data }: iAppProps) {
  const [pending, startTransition] = useTransition();
  const { triggerConfetti } = useConfetti();
  const router = useRouter();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        MarkLessonComplete(data.id, data.Chapter.course.slug)
      );

      if (error) {
        toast.error('An unexpected error occurred. Please try again.');
        return;
      }

      if (result?.status === 'success') {
        toast.success(result.message || 'Lesson marked as complete!');
        triggerConfetti();
        router.refresh();
      } else if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  const VideoPlayer = ({
    thumbnailKey,
    videoKey,
  }: {
    thumbnailKey: string;
    videoKey: string;
  }) => {
    const videoUrl = useConstructUrl(videoKey);
    const thumbnailUrl = useConstructUrl(thumbnailKey);

    if (!videoKey)
      return (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
          <BookIcon className="size-16 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            This lesson does not have a video yet
          </p>
        </div>
      );

    return (
      <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
        <video
          className="w-full h-full object-cover"
          controls
          poster={thumbnailUrl}
          src={videoUrl}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer
        thumbnailKey={data.thumbnailKey ?? ''}
        videoKey={data.videoKey ?? ''}
      />
      <div className="py-4 border-b">
        {data.lessonProgress.length > 0 ? (
          <Button
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:text-green-600"
          >
            <CheckCircle className="size-4 mr-2 text-green-500" />
            Completed
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            onClick={onSubmit}
            disabled={pending}
          >
            <CheckCircle2Icon className="size-4 mr-2 text-green-500" />
            {pending ? 'Marking...' : 'Mark as complete'}
          </Button>
        )}
      </div>

      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {data.title}
        </h1>
        {data.description && (
          <RenderDescription json={JSON.parse(data.description)} />
        )}
      </div>
    </div>
  );
}
