import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApprovalPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-warning" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Account Pending Approval</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your account has been created successfully. A school administrator will review 
              and approve your account shortly.
            </p>
          </div>

          {user && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>Signed in as <span className="font-medium text-foreground">{user.email}</span></p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left p-3 rounded-lg border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">You'll be notified</p>
                <p className="text-xs text-muted-foreground">
                  We'll send you an email once your account has been approved.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
