'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'An interactive area chart';

interface ChartAreaInteractiveProps {
  data: {
    date: string;
    enrollments: number;
  }[];
}

const chartConfig = {
  enrollments: {
    label: 'Enrollments',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const totalEnrollment = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.enrollments, 0),
    []
  );
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total enrollment for the last 30 days : {totalEnrollment}
          </span>
          <span className="@[540px]/card:hidden">
            Last 30 days : {totalEnrollment}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar dataKey="enrollments" fill={chartConfig.enrollments.color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
