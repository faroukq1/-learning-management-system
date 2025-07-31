import { getLessonContent } from '@/app/data/course/get-lesson-content';
import CourseContent from './_component/CourseContent';
import { Suspense } from 'react';
import LessonSkelaton from './_component/LessonSkelaton';

type Params = Promise<{ lessonId: string }>;

export default async function LessonPageRoute({ params }: { params: Params }) {
  const { lessonId } = await params;
  await getLessonContent(lessonId);

  return (
    <Suspense fallback={<LessonSkelaton />}>
      <LessonContentLoader lessonId={lessonId} />
    </Suspense>
  );
}

async function LessonContentLoader({ lessonId }: { lessonId: string }) {
  const data = await getLessonContent(lessonId);
  return <CourseContent data={data} />;
}
