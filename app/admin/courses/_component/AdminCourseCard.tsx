import { AdminCourseType } from '@/app/data/admin/admin-get-courses';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import useConstructUrl from '@/hooks/use-construct-url';
import {
  ArrowRight,
  Eye,
  MoreVertical,
  Pencil,
  School,
  TimerIcon,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface iAppProps {
  data: AdminCourseType;
}

export default function AdminCourseCard({ data }: iAppProps) {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  return (
    <Card className="group relative py-0 gap-0">
      {/* absolute dropdown */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/edit`}>
                <Pencil className="size-4 mr-2" /> Edit Course
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.slug}`}>
                <Eye className="size-4 mr-2" /> Preview
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/delete`}>
                <Trash2 className="size-4 mr-2 text-destructive" /> Delete
                Course
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Image
        src={thumbnailUrl}
        alt="thumbnail url"
        width={600}
        height={400}
        className="w-full rounded-t-lg aspect-video h-full object-cover"
      />
      <CardContent className="p-4">
        <Link
          className="font-medium font-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
          href={`/admin/courses/${data.id}/edit`}
        >
          {data.title}
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.smallDescription}
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.duration}h</p>
          </div>
          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-sm text-muted-foreground">{data.level}</p>
          </div>
        </div>
        <Link
          className={buttonVariants({
            className: 'w-full mt-4',
          })}
          href={`/admin/courses/${data.id}/edit`}
        >
          Edit Course <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export const AdminCourseCardSkelatonLayout = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
      {Array.from({ length: 4 }).map((_, index) => (
        <AdminCourseCardSkelaton key={index} />
      ))}
    </div>
  );
};

export function AdminCourseCardSkelaton() {
  return (
    <Card className="group relative p-4 space-y-4">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="size-8 rounded-md" />
      </div>

      <div className="relative w-full">
        <Skeleton className="w-full rounded-lg aspect-video h-[250px] object-cover" />
      </div>

      <CardContent className="w-full space-y-4 p-0 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>

        {/* Author / Meta */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full rounded" />
      </CardContent>
    </Card>
  );
}
