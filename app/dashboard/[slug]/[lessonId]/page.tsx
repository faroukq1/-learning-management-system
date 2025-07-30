import { getLessonContent } from '@/app/data/course/get-lesson-content';
import CourseContent from './_component/CourseContent';

type Params = Promise<{ lessonId: string }>;

export default async function LessonPageRoute({ params }: { params: Params }) {
  const { lessonId } = await params;
  const data = await getLessonContent(lessonId);
  return <CourseContent data={data} />;
}
