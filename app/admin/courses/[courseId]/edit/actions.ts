'use server';

import { requireAdmin } from '@/app/data/admin/require-admin';
import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import {
  chapterSchema,
  ChapterSchemaType,
  courseSchema,
  CourseSchemaType,
  lessonSchema,
  LessonSchemaType,
} from '@/lib/zodSchemas';
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
      data: { ...result.data },
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
  await requireAdmin();
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
        data: { position: lesson.position },
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
export async function reorderChapters(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: 'error',
        message: 'No chapter provided for reordering.',
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId,
        },
        data: { position: chapter.position },
      })
    );

    await prisma.$transaction(updates);
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: 'success',
      message: 'Chapter reorder successfully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to reorder chapters.',
    };
  }
}

export async function createChapter(
  values: ChapterSchemaType
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = chapterSchema.safeParse(values);

    if (!result.success) {
      return {
        status: 'error',
        message: 'Invalid data',
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: { courseId: result.data.courseId },
        select: { position: true },
        orderBy: { position: 'desc' },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: 'success',
      message: 'Chapter created.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to create chapter.',
    };
  }
}

export async function createLesson(
  values: LessonSchemaType
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: 'error',
        message: 'Invalid data',
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: { chapterId: result.data.chapterId },
        select: { position: true },
        orderBy: { position: 'desc' },
      });

      await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description,
          videoKey: result.data.videoKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: 'success',
      message: 'Lesson created.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to create lesson.',
    };
  }
}

export async function deleteLesson(
  chapterId: string,
  courseId: string,
  lessonId: string
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const chapterWithLesson = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        lesson: {
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!chapterWithLesson) {
      return {
        status: 'error',
        message: 'Chapter not found.',
      };
    }

    const lessons = chapterWithLesson.lesson;
    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: 'error',
        message: 'Lesson not found in the chapter.',
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) => {
      return prisma.lesson.update({
        where: { id: lesson.id },
        data: { position: index + 1 },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({
        where: {
          id: lessonId,
          chapterId: chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: 'success',
      message: 'lesson deleted and positions updated successfully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to delete lesson.',
    };
  }
}

export async function deleteChapter(
  chapterId: string,
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const courseWithChapter = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapter: {
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapter) {
      return {
        status: 'error',
        message: 'Course not found.',
      };
    }

    const chapters = courseWithChapter.chapter;
    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId
    );

    if (!chapterToDelete) {
      return {
        status: 'error',
        message: 'chapter not found in the course.',
      };
    }

    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId
    );

    const updates = remainingChapters.map((chapter, index) => {
      return prisma.chapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: {
          id: chapterId,
          courseId: courseId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: 'success',
      message: 'Chapter deleted and positions updated successfully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to delete chapter.',
    };
  }
}
