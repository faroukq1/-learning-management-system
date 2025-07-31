import { getCourseSidebarData } from '@/app/data/course/get-course-sidebar-data';
import { redirect } from 'next/navigation';

interface iAppProps {
  params: Promise<{ slug: string }>;
}
export default async function CourseSlugRoute({ params }: iAppProps) {
  const { slug } = await params;
  const course = await getCourseSidebarData(slug);
  const firstChapter = course.course.chapter[0];
  const firstLesson = firstChapter.lesson[0];
  if (firstLesson) redirect(`/dashboard/${slug}/${firstLesson.id}`);
  return (
    <div className="flex flex-col h-screen items-center justify-center text-center">
      <h2 className="text-4xl font-bold mb-2">No lesson available</h2>
      <p className="text-xl text-muted-foreground">
        This course does not have any lessons yet!
      </p>
    </div>
  );
}
