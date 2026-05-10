import { useState } from 'react';
import { Camera, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/services/attendance.service';
import { CameraCaptureModal } from './CameraCaptureModal';

interface Props {
  faceImageUrl?: string | null;
  onRegistered?: (url: string) => void;
}

export function FaceRegistrationCard({ faceImageUrl, onRegistered }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(faceImageUrl ?? null);

  const handleCapture = async (file: File) => {
    setBusy(true);
    try {
      const r = await attendanceService.registerFace(file);
      const data = r.data?.data ?? r.data ?? {};
      const url = data.faceImageUrl ?? data.url ?? null;
      if (url) setCurrentImage(url);
      toast({
        title: 'Face registered',
        description: 'You can now use selfie attendance.',
      });
      onRegistered?.(url ?? '');
      setOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (/face/i.test(msg) && /detect|found/i.test(msg)) {
        toast({
          title: 'No face detected',
          description:
            'Please ensure your face is clearly visible in good lighting and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration failed',
          description: msg || 'Could not register your face.',
          variant: 'destructive',
        });
      }
    }
    setBusy(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Face Registration
          </CardTitle>
          <CardDescription>
            Register your face once so attendance can verify your identity from a selfie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
            {currentImage ? (
              <img src={currentImage} alt="Registered face" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {currentImage ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Face registered
              </Badge>
            ) : (
              <Badge variant="destructive">Face not registered</Badge>
            )}
            <p className="text-xs text-muted-foreground">
              Use a clear, front-facing photo in good lighting.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {currentImage ? 'Update Face' : 'Register Face'}
          </Button>
        </CardContent>
      </Card>

      <CameraCaptureModal
        open={open}
        onClose={() => setOpen(false)}
        onCapture={handleCapture}
        title="Register Your Face"
        description="Look directly at the camera and tap capture."
        captureLabel="Save"
        busy={busy}
      />
    </>
  );
}
