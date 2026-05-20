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

// Shape returned by GET /api/attendance/sessions/:sessionId/results
// data: { sessionId, status, totalEnrolled, presentCount, absentCount, presentStudents, expiresAt }
// Each item in presentStudents: { _id, matricNumber, user: { firstName, lastName } }
interface PresentStudent {
  _id?: string;
  id?: string;
  matricNumber?: string;
  user?: { firstName?: string; lastName?: string };
}

export function GeofencedSessionPanel({ courseId, courseLabel }: Props) {
  const { toast } = useToast();
  const [duration, setDuration] = useState(10);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [presentStudents, setPresentStudents] = useState<PresentStudent[]>([]);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [now, setNow] = useState(Date.now());
  const pollRef = useRef<number | null>(null);

  // Detect existing active session on mount / course change
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
    return () => { cancelled = true; };
  }, [courseId]);

  // Tick + poll while session is active
  useEffect(() => {
    if (!session) return;

    const tick = window.setInterval(() => setNow(Date.now()), 1000);

    const fetchResults = async () => {
      try {
        const sid = session._id ?? session.id ?? session.sessionId;
        if (!sid) return;
        const r = await attendanceService.getSessionResults(sid);
        const data = r.data?.data ?? {};

        // Backend returns presentStudents array and totalEnrolled
        const list: PresentStudent[] = Array.isArray(data.presentStudents)
          ? data.presentStudents
          : [];
        setPresentStudents(list);
        setTotalEnrolled(data.totalEnrolled ?? list.length);
      } catch {
        /* ignore poll failures */
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
      setPresentStudents([]);
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
      await attendanceService.endSession(session._id ?? session.id ?? session.sessionId);
      toast({ title: 'Session ended', description: `${presentStudents.length} students marked present.` });
      setSession(null);
      setPresentStudents([]);
      setTotalEnrolled(0);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    }
    setEnding(false);
  };

  const getStudentName = (s: PresentStudent) =>
    [s.user?.firstName, s.user?.lastName].filter(Boolean).join(' ') || 'Student';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Geofenced Attendance
            </CardTitle>
            <CardDescription>
              Start a location-locked session — students within range submit a selfie to be marked present.
              {courseLabel && <> · <span className="font-medium">{courseLabel}</span></>}
            </CardDescription>
          </div>
          {session && !expired && (
            <Badge variant="default" className="gap-1 flex-shrink-0">
              <Clock className="h-3 w-3" /> {formatTimeLeft(timeLeft)}
            </Badge>
          )}
          {session && expired && <Badge variant="secondary">Expired</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!session ? (
          /* ── Start Form ── */
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
          /* ── Active Session ── */
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Time left</p>
                <p className="text-2xl font-bold tabular-nums">{formatTimeLeft(timeLeft)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">
                  {presentStudents.length}
                  {totalEnrolled > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}/ {totalEnrolled}
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-lg border p-3 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{expired ? 'Expired' : 'Open'}</p>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-medium">
                  Marked present ({presentStudents.length})
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={end}
                  disabled={ending}
                  className="gap-1"
                >
                  {ending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <StopCircle className="h-4 w-4" />
                  )}
                  End Session
                </Button>
              </div>

              {presentStudents.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No submissions yet — share the session with your class.
                </p>
              ) : (
                <ul className="divide-y max-h-64 overflow-y-auto">
                  {presentStudents.map((s, idx) => (
                    <li
                      key={s._id ?? s.id ?? idx}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{getStudentName(s)}</p>
                          {s.matricNumber && (
                            <p className="text-xs text-muted-foreground">{s.matricNumber}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}