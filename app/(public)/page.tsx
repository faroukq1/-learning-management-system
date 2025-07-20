import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface FeaturesProps {
  title: string;
  description: string;
  icon: string;
}

const features: FeaturesProps[] = [
  {
    title: 'Comprehensive Courses',
    description:
      'Explore an extensive library of expertly crafted courses across various domains, tailored to industry demands.',
    icon: '🎓',
  },
  {
    title: 'Interactive Learning',
    description:
      'Boost retention and understanding with hands-on activities, quizzes, and real-world assignments.',
    icon: '🧠',
  },
  {
    title: 'Progress Tracking',
    description:
      'Stay motivated with personalized dashboards, analytics, and milestone achievements that track your growth.',
    icon: '📊',
  },
  {
    title: 'Community Support',
    description:
      'Connect with fellow learners, share knowledge, and get help through active forums and peer discussions.',
    icon: '🤝',
  },
];

export default function Home() {
  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="outline">The Future of Online Education</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Elevate your Learning Experience
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Discovera new way to learn with our modern, interavtive learning
            management system. Access high-quality courses, anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/courses"
              className={buttonVariants({
                size: 'lg',
              })}
            >
              Explore Courses
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                size: 'lg',
                variant: 'outline',
              })}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
