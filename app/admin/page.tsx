import { ChartAreaInteractive } from '@/components/sidebar/chart-area-interactive';
import { SectionCards } from '@/components/sidebar/section-cards';
import { adminGetEnrollmentStats } from '../data/admin/admin-get-enrollments-stats';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { adminGetRecentCourses } from '../data/admin/admin-get-recent-courses';
import EmptyState from '@/components/general/EmptyState';
import AdminCourseCard, {
  AdminCourseCardSkelaton,
} from './courses/_component/AdminCourseCard';
import { Suspense } from 'react';

export default async function AdminIndexPage() {
  const enrollmentData = await adminGetEnrollmentStats();
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive data={enrollmentData} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          <Link
            href="/admin/courses"
            className={buttonVariants({
              variant: 'outline',
            })}
          >
            View all courses
          </Link>
        </div>
        <Suspense fallback={<RenderRecentCoursesSkelatonLayout />}>
          <RenderRecentCourses />
        </Suspense>
      </div>
    </>
  );
}

async function RenderRecentCourses() {
  const data = await adminGetRecentCourses();

  if (data.length === 0)
    return (
      <EmptyState
        buttonText="Create new course"
        description="you do not have any courses. create some to see them here"
        title="You dont have any coures yet!"
        href="/admin/courses/create"
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((course) => (
        <AdminCourseCard key={course.id} data={course} />
      ))}
    </div>
  );
}

function RenderRecentCoursesSkelatonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <AdminCourseCardSkelaton key={index} />
      ))}
    </div>
  );
}
