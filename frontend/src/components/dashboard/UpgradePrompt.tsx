import { Lock, ArrowUpCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '@/hooks/useSubscription';
import { getPlanLabel } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredPlan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  upgradeHref?: string;
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan,
  currentPlan,
  upgradeHref = '/dashboard/admin/subscription',
}: UpgradePromptProps) {
  const { user } = useAuth();

  // Students should never see upgrade prompts — redirect them to their dashboard
  if (user?.role === 'student') {
    return <Navigate to="/dashboard/student" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{feature}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Your plan:</span>
            <Badge variant="secondary">{getPlanLabel(currentPlan)}</Badge>
            <span>→</span>
            <span>Requires:</span>
            <Badge>{getPlanLabel(requiredPlan)}</Badge>
          </div>
          <Button asChild className="w-full">
            <Link to={upgradeHref}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
