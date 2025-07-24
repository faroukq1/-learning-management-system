'use server';

import { requireAdmin } from '@/app/data/admin/require-admin';
import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { courseSchema, CourseSchemaType } from '@/lib/zodSchemas';
import { request } from '@arcjet/next';
import { revalidatePath } from 'next/cache';

const aj = arcjet
  .withRule(
    detectBot({
      mode: 'LIVE',
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 5,
    })
  );

export async function editCourse(
  data: CourseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: 'error',
          message: 'Too Many Requests',
        };
      } else {
        return {
          status: 'error',
          message: 'Malicous user',
        };
      }
    }
    const result = courseSchema.safeParse(data);
    if (!result.success)
      return {
        status: 'error',
        message: 'Invalid data.',
      };

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      },
    });

    return {
      status: 'success',
      message: 'Course updated successfully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to update the course.',
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> {
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: 'error',
        message: 'no lessons provided for reordering.',
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapterId,
        },
        data: {
          position: lesson.position,
        },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: 'success',
      message: 'Lessons reordered successufully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to reorder lessons.',
    };
  }
}
