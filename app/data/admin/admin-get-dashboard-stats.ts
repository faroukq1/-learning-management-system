import { prisma } from '@/lib/db';
import { requireAdmin } from './require-admin';

export async function adminGetDashboardStats() {
  await requireAdmin();

  const [totalSignUps, totalCustomers, totalCourses, totalLessons] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          enrollemnt: {
            some: {},
          },
        },
      }),
      prisma.course.count(),
      prisma.lesson.count(),
    ]);

  return {
    totalSignUps,
    totalCustomers,
    totalCourses,
    totalLessons,
  };
}
