import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { attendanceService, getStudentLocation } from '@/services/attendance.service';
import { courseService } from '@/services/course.service';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ActiveSession {
  sessionId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  expiresAt: number;
}

function formatTimeLeft(ms: number) {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function StudentAttendanceAlert() {
  const { toast } = useToast();
  const [active, setActive] = useState<ActiveSession[]>([]);
  const [now, setNow] = useState(Date.now());
  const [target, setTarget] = useState<ActiveSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cRes = await courseService.getStudentCourses();
        const courses: any[] = cRes.data?.data ?? [];
        const checks = await Promise.all(
          courses.map(async (c) => {
            const cid = c._id ?? c.id;
            try {
              const r = await attendanceService.getActiveSession(cid);
              const data = r.data?.data ?? r.data;
              if (!data || !(data._id || data.id)) return null;
              return {
                sessionId: data._id ?? data.id,
                courseId: cid,
                courseTitle: c.title,
                courseCode: c.code,
                expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : 0,
              } as ActiveSession;
            } catch {
              return null;
            }
          })
        );
        if (!cancelled) {
          setActive(checks.filter(Boolean) as ActiveSession[]);
        }
      } catch {
        /* ignore */
      }
    })();
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, []);

  const live = active.filter((s) => s.expiresAt - now > 0);
  if (live.length === 0) return null;

  const beginSubmit = async (session: ActiveSession) => {
    setTarget(session);
    setCoords(null);
    setSubmitting(true);
    try {
      const loc = await getStudentLocation();
      setCoords(loc);
      setCameraOpen(true);
    } catch (err: any) {
      toast({
        title: 'Location required',
        description: err?.message || 'Please enable location access to submit attendance.',
        variant: 'destructive',
      });
      setTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCapture = async (file: File) => {
    if (!target || !coords) return;
    setSubmitting(true);
    try {
      const r = await attendanceService.submitSelfie(
        target.sessionId,
        file,
        coords.latitude,
        coords.longitude
      );
      const data = r.data?.data ?? r.data ?? {};
      const marked = data.marked_present ?? data.markedPresent ?? data.success;
      const locValid = data.location_valid ?? data.locationValid;
      const faceMatched = data.face_matched ?? data.faceMatched;
      const already = data.already_submitted ?? data.alreadySubmitted;

      if (already) {
        toast({
          title: 'Already submitted',
          description: 'You have already submitted attendance for this session.',
        });
      } else if (marked) {
        toast({
          title: 'Attendance marked',
          description: 'You have been marked present.',
        });
        setActive((prev) => prev.filter((s) => s.sessionId !== target.sessionId));
      } else if (locValid === false) {
        toast({
          title: 'Out of range',
          description: 'You are too far from the classroom. Move closer and try again.',
          variant: 'destructive',
        });
      } else if (faceMatched === false) {
        toast({
          title: 'Face not verified',
          description:
            'Face verification failed. Ensure your face is clearly visible and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Attendance submitted',
          description: data.message || 'Submission received.',
        });
      }
      setCameraOpen(false);
      setTarget(null);
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Could not submit attendance.',
        variant: 'destructive',
      });
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="space-y-3">
        {live.map((s) => {
          const left = s.expiresAt - now;
          return (
            <Card
              key={s.sessionId}
              className="border-primary/40 bg-primary/5"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Attendance is open — {s.courseCode}
                    </CardTitle>
                    <CardDescription>{s.courseTitle}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <Clock className="h-4 w-4" /> {formatTimeLeft(left)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  We'll use your location and camera to verify your attendance.
                </p>
                <Button onClick={() => beginSubmit(s)} disabled={submitting} className="gap-2">
                  {submitting && target?.sessionId === s.sessionId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Submit Attendance
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => {
          setCameraOpen(false);
          setTarget(null);
        }}
        onCapture={handleCapture}
        title="Verify Attendance"
        description="Take a clear selfie to confirm your presence."
        captureLabel="Submit Selfie"
        busy={submitting}
      />
    </>
  );
}
