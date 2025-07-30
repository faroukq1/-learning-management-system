import { getCourseSidebarData } from '@/app/data/course/get-course-sidebar-data';
import CourseSidebar from '../_component/CourseSidebar';

interface iAppProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function CourseLayout({ children, params }: iAppProps) {
  const { slug } = await params;
  // server-side security check and lightweight data fetching
  const course = await getCourseSidebarData(slug);
  return (
    <div className="flex flex-1">
      {/* sidebar 30% */}
      <div className="w-80 border-r border-border shrink-0">
        <CourseSidebar course={course.course} />
      </div>
      {/* main content 70% */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
