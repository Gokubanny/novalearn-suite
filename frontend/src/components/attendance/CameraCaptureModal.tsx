import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X, RefreshCw, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void | Promise<void>;
  title?: string;
  description?: string;
  captureLabel?: string;
  busy?: boolean;
}

export function CameraCaptureModal({
  open,
  onClose,
  onCapture,
  title = 'Take Selfie',
  description = 'Position your face in the circle and tap Snap.',
  captureLabel = 'Snap',
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitElapsedMs, setSubmitElapsedMs] = useState(0);

  useEffect(() => {
    if (!open) return;

    setPreview(null);
    setCapturedFile(null);
    setCameraError(null);
    setCameraLoading(true);
    setSubmitting(false);

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        if (!cancelled) {
          setCameraError(
            e?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access and try again.'
              : e?.message || 'Could not access camera.'
          );
        }
      } finally {
        if (!cancelled) setCameraLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open]);

  // Tracks how long the current verify attempt has been running, so the
  // overlay can reassure the student during a legitimate cold-start wait
  // instead of just spinning silently.
  useEffect(() => {
    if (!submitting) {
      setSubmitElapsedMs(0);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => setSubmitElapsedMs(Date.now() - start), 1000);
    return () => window.clearInterval(id);
  }, [submitting]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const snap = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    setPreview(canvas.toDataURL('image/jpeg', 0.92));
    stopStream();

    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.92)
    );
    if (blob) {
      setCapturedFile(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
    }
  };

  const retake = async () => {
    setPreview(null);
    setCapturedFile(null);
    setCameraError(null);
    setCameraLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e: any) {
      setCameraError(e?.message || 'Could not access camera.');
    } finally {
      setCameraLoading(false);
    }
  };

  const submit = async () => {
    if (!capturedFile || submitting) return;
    setSubmitting(true);
    try {
      await onCapture(capturedFile);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    stopStream();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">

          {cameraLoading && !preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs text-white/70">Starting camera…</p>
            </div>
          )}

          {cameraError && !preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <X className="h-8 w-8 text-destructive" />
              <p className="text-sm text-white">{cameraError}</p>
            </div>
          )}

          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover [transform:scaleX(-1)] ${preview ? 'hidden' : ''}`}
          />

          {preview && (
            <img
              src={preview}
              alt="Your photo"
              className="h-full w-full object-cover"
            />
          )}

          {!preview && !cameraLoading && !cameraError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-52 w-52 rounded-full border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          )}

          {submitting && preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
              <div className="text-center text-white px-6">
                <p className="text-sm font-semibold">Verifying your face…</p>
                <p className="text-xs text-white/70 mt-1">
                  {submitElapsedMs > 15000
                    ? 'Still working — this can take a little longer if the service is waking up.'
                    : 'Checking GPS and face match'}
                </p>
              </div>
            </div>
          )}
        </div>

        {!preview ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-none">
              Cancel
            </Button>
            <Button
              onClick={snap}
              disabled={!!cameraError || cameraLoading}
              className="flex-1 gap-2"
            >
              <Camera className="h-4 w-4" />
              {captureLabel}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={retake}
              disabled={submitting}
              className="gap-2 flex-none"
            >
              <RefreshCw className="h-4 w-4" />
              Retake
            </Button>
            <Button
              onClick={submit}
              disabled={!capturedFile || submitting}
              className="flex-1 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Photo
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}