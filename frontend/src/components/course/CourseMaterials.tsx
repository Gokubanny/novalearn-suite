import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface CourseMaterialsProps {
  courseId: string;
  courseName: string;
  canUpload: boolean;
}

export function CourseMaterials({ courseName }: CourseMaterialsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
        <CardDescription>{courseName}</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={FileText}
          title="Materials coming soon"
          description="Course materials will be available here once your institution publishes them."
        />
      </CardContent>
    </Card>
  );
}
