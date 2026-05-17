import { useEffect, useRef, useState } from "react";
import { Mic, Square, Upload, Wand2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatMs } from "@/lib/utils";

interface AudioRecorderProps {
  onTranscribe: (text: string) => void;
}

export function AudioRecorder({ onTranscribe }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const lastElapsedFlushRef = useRef<number>(0);

  // Cleanup on unmount.
  useEffect(() => {
    return () => stopAll();
  }, []);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    analyserRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
  };

  useEffect(() => {
    if (!(recording || hasAudio)) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const loop = () => {
      tick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, hasAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (err) {
      console.warn("Mic permission denied, using simulated waveform.", err);
    }
    startedAtRef.current = performance.now();
    setRecording(true);
    setHasAudio(false);
    setFilename(null);
  };

  const stopRecording = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    analyserRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    setRecording(false);
    setHasAudio(true);
    setFilename("recording.wav");
  };

  const tick = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, canvas.clientWidth * dpr);
    const h = Math.max(1, canvas.clientHeight * dpr);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    let data: number[];
    if (analyser) {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      data = Array.from(buf);
    } else if (recording) {
      // Simulated bands when mic permission is denied.
      const t = performance.now() / 600;
      data = Array.from({ length: 64 }, (_, i) =>
        Math.abs(
          Math.sin(t + i * 0.3) * 0.5 +
            Math.sin(t * 1.7 + i * 0.13) * 0.3 +
            (Math.random() - 0.5) * 0.2,
        ) * 220,
      );
    } else {
      data = Array.from({ length: 64 }, (_, i) =>
        Math.abs(Math.sin(i * 0.4) * 0.6 + Math.sin(i * 0.13) * 0.3) * 180,
      );
    }

    ctx2d.clearRect(0, 0, w, h);
    const barCount = 48;
    const stride = Math.max(1, Math.floor(data.length / barCount));
    const gap = 2 * dpr;
    const barW = (w - gap * (barCount - 1)) / barCount;
    for (let i = 0; i < barCount; i++) {
      const v = (data[i * stride] ?? 0) / 255;
      const bh = Math.max(2 * dpr, v * (h * 0.85));
      const x = i * (barW + gap);
      const y = (h - bh) / 2;
      const grad = ctx2d.createLinearGradient(0, y, 0, y + bh);
      grad.addColorStop(0, "rgba(61, 184, 255, 0.95)");
      grad.addColorStop(1, "rgba(255, 138, 61, 0.95)");
      ctx2d.fillStyle = grad;
      const r = 1.5 * dpr;
      const path = new Path2D();
      if (typeof (path as unknown as { roundRect?: unknown }).roundRect === "function") {
        (path as Path2D & {
          roundRect: (x: number, y: number, w: number, h: number, r: number) => void;
        }).roundRect(x, y, barW, bh, r);
        ctx2d.fill(path);
      } else {
        ctx2d.fillRect(x, y, barW, bh);
      }
    }

    if (recording) {

      const now = performance.now();
      if (now - lastElapsedFlushRef.current >= 200) {
        lastElapsedFlushRef.current = now;
        setElapsed(now - startedAtRef.current);
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/^audio\//.test(file.type)) return;
    setFilename(file.name);
    setHasAudio(true);
  };

  const transcribe = async () => {
    setTranscribing(true);
    await new Promise((r) => setTimeout(r, 900));
    const candidates = [
      "We are shipping the Helix-M flagship build to us-east-1 today with a 25% canary on the new speculative decoding path.",
      "Summarize this customer call: latency on the new build feels noticeably faster, but tail TTFT still spikes around 600 ms once an hour.",
      "Draft release notes for v1.4 covering speculative decoding, per-region canary rollouts, and the new structured stream events API.",
    ];
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    setTranscribing(false);
    onTranscribe(choice);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative p-4 flex flex-col gap-3 transition-colors",
        dragging && "bg-accent/10",
      )}
    >
      <div
        className={cn(
          "h-24 rounded-md border border-line bg-bg/40 overflow-hidden relative",
          "grid place-items-center",
        )}
      >
        {recording || hasAudio ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-ink-subtle">
            <Mic className="h-4 w-4" />
            <span className="text-xs">
              Press record · or drop an audio file here
            </span>
          </div>
        )}
        {recording && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
            <span className="text-2xs font-mono text-danger uppercase tracking-tightish">
              REC · {formatMs(elapsed)}
            </span>
          </div>
        )}
        {hasAudio && !recording && filename && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="hx-chip">{filename}</span>
            <button
              type="button"
              onClick={() => {
                setHasAudio(false);
                setFilename(null);
              }}
              className="h-5 w-5 grid place-items-center rounded-md text-ink-subtle hover:text-ink hover:bg-ivory-soft"
              aria-label="Discard audio"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {recording ? (
          <Button
            size="sm"
            variant="danger"
            onClick={stopRecording}
            className="gap-1.5"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop recording
          </Button>
        ) : (
          <Button
            size="sm"
            variant="accent"
            onClick={startRecording}
            className="gap-1.5"
          >
            <Mic className="h-3.5 w-3.5" />
            Record
          </Button>
        )}

        <label
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-line",
            "bg-bg-surface text-xs text-ink-muted hover:text-ink hover:bg-bg-elevated",
            "cursor-pointer transition-colors",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFilename(file.name);
                setHasAudio(true);
              }
            }}
          />
        </label>

        <div className="flex-1" />

        <Button
          size="sm"
          variant="primary"
          disabled={!hasAudio || transcribing}
          onClick={transcribe}
          className="gap-1.5"
        >
          <Wand2 className="h-3.5 w-3.5" />
          {transcribing ? "Transcribing…" : "Transcribe with Echo"}
        </Button>
      </div>
    </div>
  );
}
