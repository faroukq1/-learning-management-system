'use server';
import { requireAdmin } from '@/app/data/admin/require-admin';
import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { courseSchema, CourseSchemaType } from '@/lib/zodSchemas';
import { request } from '@arcjet/next';

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

export async function createCourse(
  values: CourseSchemaType
): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
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
    const validation = courseSchema.safeParse(values);
    if (!validation.success) {
      return {
        status: 'error',
        message: 'Invalid Form Data',
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string,
      },
    });

    return {
      status: 'success',
      message: 'Course created succesfully.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Failed to create course.',
    };
  }
}
