import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, X, Headphones } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Button } from "@/components/ui/button";

const formatTime = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

/**
 * Lecteur audio flottant et persistant. Reste visible pendant la navigation
 * tant qu'une piste est jouée.
 */
const PersistentAudioPlayer = () => {
  const { current, close } = useAudioPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!current || !audioRef.current) return;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current?.id]);

  if (!current) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    const t = Number(e.target.value);
    el.currentTime = t;
    setProgress(t);
  };

  return (
    <div
      role="region"
      aria-label="Lecteur audio"
      className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:w-[420px] z-50 animate-slide-up"
    >
      <div
        className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border/60 shadow-elevated p-3 pr-4"
        style={{ borderRadius: "1.75rem 0.5rem 1.75rem 0.5rem" }}
      >
        {current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-cover shrink-0"
            style={{ borderRadius: "1rem 0.25rem 1rem 0.25rem" }}
          />
        ) : (
          <div
            className="h-12 w-12 flex items-center justify-center bg-primary/10 text-primary shrink-0"
            style={{ borderRadius: "1rem 0.25rem 1rem 0.25rem" }}
          >
            <Headphones className="h-5 w-5" aria-hidden="true" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {current.slug ? (
            <Link
              to={`/podcast/${current.slug}`}
              className="block truncate text-sm font-medium hover:text-primary transition-colors"
            >
              {current.title}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium">{current.title}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={seek}
              aria-label="Position de lecture"
              className="flex-1 h-1 accent-primary cursor-pointer"
            />
            <span className="text-[10px] tabular-nums text-muted-foreground w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <Button
          size="icon"
          variant="default"
          onClick={toggle}
          aria-label={playing ? "Mettre en pause" : "Lire"}
          className="rounded-full h-10 w-10 shrink-0 shadow-natural"
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" aria-hidden="true" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={close}
          aria-label="Fermer le lecteur"
          className="rounded-full h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={current.audioUrl}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="metadata"
      />
    </div>
  );
};

export default PersistentAudioPlayer;