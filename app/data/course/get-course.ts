import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export async function getIndividualCourse(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: true,
      smallDescription: true,
      chapter: {
        select: {
          id: true,
          title: true,
          lesson: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!course) return notFound();

  return course;
}
export type PublicCouresType = Awaited<ReturnType<typeof getIndividualCourse>>;
