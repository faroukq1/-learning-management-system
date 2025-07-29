'use server';

import { requireUser } from '@/app/data/user/require-user';
import arcjet, { fixedWindow } from '@/lib/arcjet';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { ApiResponse } from '@/lib/types';
import { request } from '@arcjet/next';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '1m',
    max: 5,
  })
);

export async function enrollInCourseAction(
  courseId: string
): Promise<ApiResponse | never> {
  const user = await requireUser();
  let checkoutUrl: string = '';

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: 'error',
        message: 'You have been blocked.',
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: 'error',
        message: 'Course not found.',
      };
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const userRecord = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
        email: true,
        name: true,
      },
    });

    if (userRecord?.stripeCustomerId) {
      stripeCustomerId = userRecord.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: userRecord?.email || '',
        name: userRecord?.name || '',
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Transaction for enrollment + Stripe checkout
    const { checkoutUrl: sessionUrl } = await prisma.$transaction(
      async (tx) => {
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (existingEnrollment?.status === 'Active') {
          throw new Error('Already enrolled.');
        }

        let enrollment;
        if (existingEnrollment) {
          enrollment = await tx.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              amount: course.price,
              status: 'Pending',
              updatedAt: new Date(),
            },
          });
        } else {
          enrollment = await tx.enrollment.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: course.price,
              status: 'Pending',
            },
          });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          line_items: [
            {
              price: 'price_1RqE9vEs8Wiyf3i6ry2Si6Fb',
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${env.BETTER_AUTH_URL}/payment/success`,
          cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
          metadata: {
            userId: user.id,
            courseId: course.id,
            enrollmentId: enrollment.id,
          },
        });

        return {
          checkoutUrl: checkoutSession.url!,
        };
      }
    );

    checkoutUrl = sessionUrl;
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof Stripe.errors.StripeError ||
      error?.type === 'StripeInvalidRequestError'
    ) {
      return {
        status: 'error',
        message: 'Payment system error. Please try again later.',
      };
    }

    if (error.message === 'Already enrolled.') {
      return {
        status: 'success',
        message: 'You are already enrolled in this course.',
      };
    }

    return {
      status: 'error',
      message: 'Failed to enroll in the course.',
    };
  }

  redirect(checkoutUrl);
}
