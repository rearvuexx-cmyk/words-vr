import { useEffect, useState } from "react";
import { Headphones, Play, Tv, X } from "lucide-react";
import { TRACKS, filmOpenUrl, filmSrc } from "@/lib/tracks";
import { useFloor } from "./session";
import { enterVRSession } from "./xr";
import { MoveStick } from "./stick";

export function Overlay() {
  const entered = useFloor((s) => s.entered);
  const cinema = useFloor((s) => s.cinema);
  const trackId = useFloor((s) => s.trackId);
  const vrSupported = useFloor((s) => s.vrSupported);
  const enter = useFloor((s) => s.enter);
  const setCinema = useFloor((s) => s.setCinema);
  const setTrack = useFloor((s) => s.setTrack);
  const setVrSupported = useFloor((s) => s.setVrSupported);
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0];
  const [vrBusy, setVrBusy] = useState(false);
  const [vrError, setVrError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const xr = navigator.xr;
    if (!xr?.isSessionSupported) return;
    xr.isSessionSupported("immersive-vr")
      .then((ok) => {
        if (!cancelled) setVrSupported(!!ok);
      })
      .catch(() => {
        if (!cancelled) setVrSupported(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setVrSupported]);

  const enterVr = async () => {
    setVrError(null);
    setVrBusy(true);
    try {
      enter();
      await enterVRSession();
    } catch (err) {
      const message = err instanceof Error ? err.message : "VR session failed";
      setVrError(
        message.includes("WebXR") || message.includes("not support")
          ? "Headset VR needs Quest / PCVR on the published link. Drag to look and use the stick to walk here."
          : message,
      );
    } finally {
      setVrBusy(false);
    }
  };

  return (
    <>
      {!entered && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end">
          <img
            src="/media/screen.jpg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/25" />
          <div className="relative z-10 max-w-3xl px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:px-10">
            <p className="text-[10px] font-medium tracking-[0.32em] text-muted uppercase">
              RearVuez × Al3X MiX
            </p>
            <h1 className="font-display mt-2 text-[clamp(4.5rem,18vw,9rem)] leading-[0.82] font-semibold tracking-[-0.04em] text-balance text-fg">
              WORDS
            </h1>
            <p className="mt-3 text-[11px] font-medium tracking-[0.28em] text-accent uppercase">
              Sir, yes sir · Built for the floor
            </p>
            <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-muted">
              Walk the club, put on a headset, or watch the complete films in cinema.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={enter}
                className="relative z-20 inline-flex min-h-11 items-center gap-2 bg-fg px-5 text-[11px] font-semibold tracking-[0.22em] text-bg uppercase transition-opacity duration-150 hover:opacity-90"
              >
                <Play className="size-3.5" strokeWidth={2} />
                Enter the floor
              </button>
              <button
                type="button"
                onClick={() => {
                  enter();
                  setCinema(true);
                }}
                className="relative z-20 inline-flex min-h-11 items-center gap-2 border border-border bg-transparent px-5 text-[11px] font-semibold tracking-[0.22em] text-fg uppercase transition-colors duration-150 hover:border-fg"
              >
                <Tv className="size-3.5" strokeWidth={2} />
                Watch the film
              </button>
              <button
                type="button"
                onClick={enterVr}
                disabled={vrBusy}
                className="relative z-20 inline-flex min-h-11 items-center gap-2 border border-accent/50 bg-accent/10 px-5 text-[11px] font-semibold tracking-[0.22em] text-fg uppercase transition-colors duration-150 hover:border-accent disabled:opacity-50"
              >
                <Headphones className="size-3.5" strokeWidth={2} />
                Enter VR
              </button>
            </div>
            {vrError && <p className="mt-3 max-w-md text-xs text-accent">{vrError}</p>}
            {!vrSupported && (
              <p className="mt-3 max-w-md text-xs text-muted">
                No headset here — tap Enter the floor, drag to look, use the stick to walk.
              </p>
            )}
          </div>
        </div>
      )}

      {entered && !cinema && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="flex items-start justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
            <div>
              <p className="text-[10px] tracking-[0.28em] text-muted uppercase">RearVuez</p>
              <p className="font-display text-3xl leading-none font-semibold tracking-tight text-fg">
                {track.title}
              </p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-accent uppercase">{track.kicker}</p>
            </div>
            <p className="hidden text-[10px] tracking-[0.18em] text-muted uppercase sm:block">
              Drag to look · WASD or stick
            </p>
          </div>
          <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between gap-3 px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <MoveStick />
            <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:items-end">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:justify-end">
                {TRACKS.map((t) => {
                  const active = t.id === trackId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTrack(t.id)}
                      className={
                        "pointer-events-auto min-h-11 shrink-0 border px-3 text-left transition-colors duration-150 " +
                        (active
                          ? "border-fg bg-fg text-bg"
                          : "border-border bg-surface/80 text-fg hover:border-fg")
                      }
                    >
                      <span className="block text-[10px] tracking-[0.18em] uppercase opacity-70">
                        {t.duration}
                      </span>
                      <span className="block text-sm font-medium">{t.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCinema(true)}
                  className="pointer-events-auto inline-flex min-h-11 items-center gap-2 bg-fg px-4 text-[11px] font-semibold tracking-[0.2em] text-bg uppercase"
                >
                  <Tv className="size-3.5" />
                  Cinema
                </button>
                <button
                  type="button"
                  onClick={enterVr}
                  disabled={vrBusy}
                  className="pointer-events-auto inline-flex min-h-11 items-center gap-2 border border-border bg-surface/80 px-4 text-[11px] font-semibold tracking-[0.2em] text-fg uppercase hover:border-fg disabled:opacity-50"
                >
                  <Headphones className="size-3.5" />
                  Enter VR
                </button>
              </div>
              {vrError && (
                <p className="pointer-events-none max-w-sm text-right text-xs text-accent">{vrError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {cinema && (
        <div className="absolute inset-0 z-30 flex flex-col bg-bg">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div>
              <p className="text-[10px] tracking-[0.24em] text-muted uppercase">{track.artist}</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">{track.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setCinema(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border text-fg hover:border-fg"
              aria-label="Close cinema"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="relative mx-4 mb-4 min-h-0 flex-1 border border-border bg-black sm:mx-6">
            {filmSrc(track) ? (
              <iframe
                title={track.title}
                src={filmSrc(track)}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Film unavailable
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs text-muted sm:px-6">
            <span>{track.duration} · complete cut</span>
            <a
              className="text-fg underline decoration-border underline-offset-4 hover:decoration-fg"
              href={filmOpenUrl(track)}
              target="_blank"
              rel="noreferrer"
            >
              Open source file
            </a>
          </div>
        </div>
      )}
    </>
  );
}
