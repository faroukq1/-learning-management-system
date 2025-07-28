import { getIndividualCourse } from '@/app/data/course/get-course';
import RenderDescription from '@/components/rich-text-editor/RenderDescription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import useConstructUrl from '@/hooks/use-construct-url';
import {
  IconBook,
  IconCategory,
  IconChartBar,
  IconChevronDown,
  IconClock,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { CheckIcon } from 'lucide-react';
import Image from 'next/image';
import { enrollInCourseAction } from './action';

type Params = Promise<{ slug: string }>;
export default async function SlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getIndividualCourse(slug);
  const thumbnailUrl = useConstructUrl(course.fileKey);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-5">
      <div className="order-1 lg:col-span-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src={thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
              {course.smallDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconChartBar className="size-4" />
              <span>{course.level}</span>
            </Badge>
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconCategory className="size-4" />
              <span>{course.category}</span>
            </Badge>
            <Badge className="flex items-center gap-1 px-3 py-1">
              <IconClock className="size-4" />
              <span>{course.duration}h</span>
            </Badge>
          </div>
          <Separator className="my-8" />

          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Course Description
            </h2>
          </div>
          <div>
            <RenderDescription json={JSON.parse(course.description)} />
          </div>
        </div>
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">
              Course Content
            </h2>
            <div>
              {course.chapter.length} chapters |{' '}
              {course.chapter.reduce(
                (total, chapter) => total + chapter.lesson.length,
                0
              ) || 0}{' '}
              Lessons
            </div>
          </div>

          <div className="space-y-4">
            {course.chapter.map((chapter, index) => (
              <Collapsible key={chapter.id} defaultOpen={index === 0}>
                <Card className="gap-2 p-0 overflow-hidden border-2 transition-all duration-200 hover:shadow-md">
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {index + 1}
                          </div>

                          <div className="flex flex-col">
                            <h3 className="text-xl font-semibold text-left">
                              {chapter.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 text-left">
                              {chapter.lesson.length} lesson
                              {chapter.lesson.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {chapter.lesson.length} lesson
                          {chapter.lesson.length !== 1 ? 's' : ''}
                          <IconChevronDown className="size-5 text-muted-foreground" />
                        </Badge>
                      </div>
                      <CollapsibleContent className="mt-4">
                        <div className="border-t bg-muted/20">
                          <div className="p-6 pt-4 space-y-3">
                            {chapter.lesson.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-4 rounded-lg p-3 hover:bg-accent transition-colors"
                              >
                                <div className="flex size-8 items-center justify-center rounded-full bg-background border-2 border-primary/20">
                                  <IconPlayerPlay className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Lesson {lessonIndex + 1}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </CollapsibleTrigger>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>

      {/* Enrollment Card */}
      <div className="order-2 lg:col-span-1">
        <div className="sticky top-20">
          <Card className="py-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Price:</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(course.price)}
                </span>
              </div>

              <div className="space-y-4 rounded-lg bg-muted p-4">
                <h4 className="font-medium">What you will get:</h4>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconClock className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Course Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {course.duration}h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconChartBar className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Difficulty Level</p>
                    <p className="text-sm text-muted-foreground">
                      {course.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconCategory className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Course Category</p>
                    <p className="text-sm text-muted-foreground">
                      {course.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconBook className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Total Lessons</p>
                    <p className="text-sm text-muted-foreground">
                      {course.chapter.reduce(
                        (total, chapter) => total + chapter.lesson.length,
                        0
                      ) || 0}{' '}
                      Lessons
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <h4>This course includes:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="rounded-full p-1 bg-green-500/10 text-green-500">
                      <CheckIcon className="size-3" />
                    </div>
                    <span>Full life time access</span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    <div className="rounded-full p-1 bg-green-500/10 text-green-500">
                      <CheckIcon className="size-3" />
                    </div>
                    <span>Access on mobile and desktop</span>
                  </li>

                  <li className="flex items-center gap-2 text-sm">
                    <div className="rounded-full p-1 bg-green-500/10 text-green-500">
                      <CheckIcon className="size-3" />
                    </div>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <form
                action={async () => {
                  'use server';
                  enrollInCourseAction(course.id);
                }}
              >
                <Button className="w-full">Enroll Now!</Button>
              </form>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
