import { useEffect, useRef, useState } from 'react';
import { Clock, Loader2, MapPin, PlayCircle, StopCircle, UserCheck, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { attendanceService, getStudentLocation } from '@/services/attendance.service';
import { getSocket } from '@/lib/socket';

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

function formatAttemptStatus(status?: string) {
  switch (status) {
    case 'location_invalid': return 'Out of range';
    case 'face_mismatch': return 'Face not verified';
    case 'present': return 'Present';
    default: return 'Attempted';
  }
}

// Shape returned by GET /api/attendance/sessions/:sessionId/results
interface PresentStudent {
  _id?: string;
  id?: string;
  matricNumber?: string;
  user?: { firstName?: string; lastName?: string };
  attempts?: number;
}

interface AttemptedStudent {
  _id?: string;
  matricNumber?: string;
  user?: { firstName?: string; lastName?: string };
  attempts: number;
  lastStatus?: string;
  lastAttemptAt?: string;
}

export function GeofencedSessionPanel({ courseId, courseLabel }: Props) {
  const { toast } = useToast();
  const [duration, setDuration] = useState(10);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [presentStudents, setPresentStudents] = useState<PresentStudent[]>([]);
  const [attemptedNotPresent, setAttemptedNotPresent] = useState<AttemptedStudent[]>([]);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [now, setNow] = useState(Date.now());
  const pollRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!session) return;

    const sid = session._id ?? session.id ?? session.sessionId;

    const tick = window.setInterval(() => setNow(Date.now()), 1000);

    const fetchResults = async () => {
      try {
        if (!sid) return;
        const r = await attendanceService.getSessionResults(sid);
        const data = r.data?.data ?? {};

        const list: PresentStudent[] = Array.isArray(data.presentStudents)
          ? data.presentStudents
          : [];
        setPresentStudents(list);
        setAttemptedNotPresent(
          Array.isArray(data.attemptedNotPresent) ? data.attemptedNotPresent : []
        );
        setTotalEnrolled(data.totalEnrolled ?? list.length);
      } catch {
        /* ignore poll/push failures */
      }
    };

    fetchResults();
    // 10s poll stays as a fallback — if the socket is ever disconnected,
    // results still arrive, just a little slower.
    pollRef.current = window.setInterval(fetchResults, 10_000);

    // Live push: refetch immediately when a student submits, instead of
    // waiting for the next poll tick. Purely a trigger — the actual data
    // always comes from the same fetchResults() call above, so there's one
    // source of truth either way.
    const socket = getSocket();
    const onSessionUpdate = (payload: { sessionId?: string }) => {
      if (!sid || payload?.sessionId === sid) fetchResults();
    };
    socket?.on('attendance:session-update', onSessionUpdate);

    return () => {
      window.clearInterval(tick);
      if (pollRef.current) window.clearInterval(pollRef.current);
      socket?.off('attendance:session-update', onSessionUpdate);
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
      setAttemptedNotPresent([]);
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
      setAttemptedNotPresent([]);
      setTotalEnrolled(0);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    }
    setEnding(false);
  };

  const getStudentName = (s: { user?: { firstName?: string; lastName?: string } }) =>
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Attempted, not present</p>
                <p className="text-2xl font-bold">{attemptedNotPresent.length}</p>
              </div>
              <div className="rounded-lg border p-3">
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
                      {!!s.attempts && s.attempts > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {s.attempts} attempts
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {attemptedNotPresent.length > 0 && (
              <div className="rounded-lg border">
                <div className="border-b px-3 py-2">
                  <p className="text-sm font-medium">
                    Attempted, not marked present ({attemptedNotPresent.length})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    These students tried but weren't verified — worth a manual check.
                  </p>
                </div>
                <ul className="divide-y max-h-64 overflow-y-auto">
                  {attemptedNotPresent.map((s, idx) => (
                    <li
                      key={s._id ?? idx}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        <div>
                          <p className="font-medium">{getStudentName(s)}</p>
                          {s.matricNumber && (
                            <p className="text-xs text-muted-foreground">{s.matricNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatAttemptStatus(s.lastStatus)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {s.attempts} {s.attempts === 1 ? 'attempt' : 'attempts'}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}