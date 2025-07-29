import { ChartAreaInteractive } from '@/components/sidebar/chart-area-interactive';
import { SectionCards } from '@/components/sidebar/section-cards';
import { adminGetEnrollmentStats } from '../data/admin/admin-get-enrollments-stats';

export default async function AdminIndexPage() {
  const enrollmentData = await adminGetEnrollmentStats();
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive data={enrollmentData} />
    </>
  );
}
