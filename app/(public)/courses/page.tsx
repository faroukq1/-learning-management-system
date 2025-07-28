import { getAllCourses } from '@/app/data/course/get-all-courses';
import {
  PublicCourseCard,
  PublicCourseCardSkelaton,
} from '../_components/PublicCourseCard';
import { Suspense } from 'react';

export default function PublicCourseRoute() {
  return (
    <div className="mt-5">
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Explore Courses
        </h1>
        <p className="text-muted-foreground">
          Discover our wide range designed course to help you achieve your
          learning goals.
        </p>
      </div>
      <Suspense fallback={<LoadingSkelatonLayout />}>
        <RenderCourses />
      </Suspense>
    </div>
  );
}

async function RenderCourses() {
  const courses = await getAllCourses();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <PublicCourseCard data={course} key={course.id} />
      ))}
    </div>
  );
}

function LoadingSkelatonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <PublicCourseCardSkelaton key={index} />
      ))}
    </div>
  );
}
