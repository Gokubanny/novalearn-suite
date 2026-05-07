import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface CourseDiscussionsProps {
  courseId: string;
  courseName: string;
}

export function CourseDiscussions({ courseName }: CourseDiscussionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussions</CardTitle>
        <CardDescription>{courseName}</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={MessageSquare}
          title="Discussions coming soon"
          description="Course discussion boards will be available here in a future update."
        />
      </CardContent>
    </Card>
  );
}
