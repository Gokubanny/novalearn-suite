import { useEffect, useRef, useState } from 'react';
import { Clock, Loader2, MapPin, PlayCircle, StopCircle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { attendanceService, getStudentLocation } from '@/services/attendance.service';

interface Props {
  courseId: string;
  courseLabel?: string;
}

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

function formatTimeLeft(ms: number) {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function GeofencedSessionPanel({ courseId, courseLabel }: Props) {
  const { toast } = useToast();
  const [duration, setDuration] = useState(10);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const pollRef = useRef<number | null>(null);

  // Detect existing active session for this course on mount / course change.
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await attendanceService.getActiveSession(courseId);
        const data = r.data?.data ?? r.data;
        if (!cancelled && data && (data._id || data.id)) {
          setSession(data);
        }
      } catch {
        /* no active session */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Tick + poll while session is active.
  useEffect(() => {
    if (!session) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const fetchResults = async () => {
      try {
        const sid = session._id ?? session.id;
        const r = await attendanceService.getSessionResults(sid);
        const list = r.data?.data?.records ?? r.data?.data ?? [];
        setResults(Array.isArray(list) ? list : []);
      } catch {
        /* ignore */
      }
    };
    fetchResults();
    pollRef.current = window.setInterval(fetchResults, 10_000);
    return () => {
      window.clearInterval(tick);
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [session]);

  const expiresAt = session?.expiresAt ? new Date(session.expiresAt).getTime() : 0;
  const timeLeft = expiresAt ? expiresAt - now : 0;
  const expired = !!session && timeLeft <= 0;

  const start = async () => {
    setStarting(true);
    try {
      const loc = await getStudentLocation();
      const r = await attendanceService.startSession(courseId, {
        latitude: loc.latitude,
        longitude: loc.longitude,
        durationMinutes: duration,
      });
      const data = r.data?.data ?? r.data;
      setSession(data);
      toast({ title: 'Session started', description: `Open for ${duration} minutes.` });
    } catch (err: any) {
      toast({
        title: 'Could not start session',
        description: err?.message || 'Please enable location access and try again.',
        variant: 'destructive',
      });
    }
    setStarting(false);
  };

  const end = async () => {
    if (!session) return;
    setEnding(true);
    try {
      await attendanceService.endSession(session._id ?? session.id);
      toast({ title: 'Session ended' });
      setSession(null);
      setResults([]);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    }
    setEnding(false);
  };

  const presentCount = results.filter(
    (r) => r.status === 'present' || r.markedPresent || r.marked_present
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Geofenced Attendance
            </CardTitle>
            <CardDescription>
              Start a location-locked session — students within range can submit a selfie to
              be marked present.
              {courseLabel && <> · <span className="font-medium">{courseLabel}</span></>}
            </CardDescription>
          </div>
          {session && !expired && (
            <Badge variant="default" className="gap-1">
              <Clock className="h-3 w-3" /> {formatTimeLeft(timeLeft)}
            </Badge>
          )}
          {session && expired && <Badge variant="secondary">Expired</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!session ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session duration</label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={start} disabled={starting || !courseId} className="gap-2">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Start Attendance Session
            </Button>
            <p className="text-xs text-muted-foreground">
              We'll request your location to anchor the session.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Time left</p>
                <p className="text-2xl font-bold tabular-nums">{formatTimeLeft(timeLeft)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{presentCount}</p>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-1 col-span-2">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{expired ? 'Expired' : 'Open'}</p>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-medium">Marked present</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={end}
                  disabled={ending}
                  className="gap-1"
                >
                  {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
                  End Session
                </Button>
              </div>
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No submissions yet — share the session with your class.
                </p>
              ) : (
                <ul className="divide-y">
                  {results.map((r, idx) => {
                    const name =
                      r.student?.user
                        ? `${r.student.user.firstName ?? ''} ${r.student.user.lastName ?? ''}`.trim()
                        : r.studentName ?? r.name ?? 'Student';
                    const matric = r.student?.matricNumber ?? r.matricNumber ?? '';
                    return (
                      <li
                        key={r._id ?? r.id ?? idx}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">{name}</p>
                            {matric && <p className="text-xs text-muted-foreground">{matric}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
