import React from 'react';

const VIDEO = '/cinematic/wuniflow-hero-v4.mp4';
const POSTER = '/cinematic/wuniflow-hero-v4-poster.webp';
const FRAME_COUNT = 180;
const frameUrl = (index: number) =>
  '/cinematic/scroll-180/frame_' + String(index + 1).padStart(3, '0') + '.webp';

/** Scroll-controlled, progressive Canvas renderer with native video fallback. */
export default function HeroFilm() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const framesRef = React.useRef<Map<number, HTMLImageElement>>(new Map());
  const loadingRef = React.useRef<Set<number>>(new Set());
  const lastDrawnRef = React.useRef(-1);
  const requestedRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const readyRef = React.useRef(false);
  const [useFrames, setUseFrames] = React.useState(false);
  const [frameReady, setFrameReady] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [posterReady, setPosterReady] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [allowVideo, setAllowVideo] = React.useState(true);

  React.useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh = () => {
      const network = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
      const conserve = !!network?.saveData;
      setUseFrames(wide.matches && !reduce.matches && !conserve && !!HTMLCanvasElement.prototype.getContext);
      setAllowVideo(!reduce.matches && !conserve);
    };
    refresh();
    wide.addEventListener('change', refresh);
    reduce.addEventListener('change', refresh);
    return () => { wide.removeEventListener('change', refresh); reduce.removeEventListener('change', refresh); };
  }, []);

  React.useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.wfScrollSequence');
    shell?.classList.toggle('is-active', useFrames);
    return () => shell?.classList.remove('is-active');
  }, [useFrames]);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      setInView(entries.some(e => e.isIntersecting));
    }, {threshold: 0.01});
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    hero?.classList.toggle('isHeroFilmReady', posterReady || frameReady || videoPlaying);
    hero?.classList.toggle('isHeroScrollReady', useFrames && frameReady);
    return () => {
      hero?.classList.remove('isHeroFilmReady');
      hero?.classList.remove('isHeroScrollReady');
    };
  }, [posterReady, frameReady, videoPlaying, useFrames]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowVideo || useFrames) return;
    if (inView) video.play().catch(() => setVideoPlaying(false));
    else video.pause();
  }, [inView, allowVideo, useFrames]);

  React.useEffect(() => {
    if (!useFrames) {
      framesRef.current.clear();
      loadingRef.current.clear();
      lastDrawnRef.current = -1;
      readyRef.current = false;
      setFrameReady(false);
      return;
    }

    const canvas = canvasRef.current;
    const shell = document.querySelector<HTMLElement>('.wfScrollSequence');
    if (!canvas || !shell) return;
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) { setUseFrames(false); return; }

    let disposed = false;
    const cache = framesRef.current;
    const pending = loadingRef.current;
    let activeLoads = 0;
    const queue: number[] = [];

    const draw = (index: number) => {
      const img = cache.get(index);
      if (!img || !img.naturalWidth || !img.naturalHeight) return false;
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
      }
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const sw = img.naturalWidth * scale, sh = img.naturalHeight * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
      lastDrawnRef.current = index;
      return true;
    };

    const schedule = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || cache.has(index) || pending.has(index) || queue.includes(index)) return;
      queue.push(index);
    };
    const startQueued = () => {
      while (!disposed && activeLoads < 5 && queue.length) {
        const index = queue.shift()!;
        if (cache.has(index) || pending.has(index)) continue;
        activeLoads++;
        pending.add(index);
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          activeLoads--;
          pending.delete(index);
          if (disposed) return;
          cache.set(index, image);
          // Keep the most relevant 52 decoded frames to bound memory on long scroll pages.
          if (cache.size > 52) {
            const candidates = [...cache.keys()].filter(n => n !== 0 && n !== requestedRef.current);
            candidates.sort((a,b) => Math.abs(b-requestedRef.current) - Math.abs(a-requestedRef.current));
            for (let k=0; cache.size>48 && k<candidates.length; k++) cache.delete(candidates[k]);
          }
          if (!readyRef.current) {
            readyRef.current = true;
            setFrameReady(true);
          }
          if (index === requestedRef.current || lastDrawnRef.current === -1) draw(index);
          startQueued();
        };
        image.onerror = () => {
          activeLoads--;
          pending.delete(index);
          if (disposed) return;
          if (index === 0 && !readyRef.current) {
            setUseFrames(false);
          } else startQueued();
        };
        image.src = frameUrl(index);
      }
    };

    const update = () => {
      rafRef.current = 0;
      if (disposed) return;
      const rect = shell.getBoundingClientRect();
      const track = Math.max(1, shell.offsetHeight - window.innerHeight + 78);
      const progress = Math.max(0, Math.min(1, -rect.top / track));
      const index = Math.min(FRAME_COUNT-1, Math.round(progress * (FRAME_COUNT-1)));
      requestedRef.current = index;
      if (lastDrawnRef.current !== index) draw(index);
      // Priority neighbors in both scroll directions; progressive loading, no 180-image startup request.
      for (let n=0; n<=10; n++) {
        schedule(index+n); schedule(index-n);
      }
      startQueued();
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };
    const onResize = () => {
      lastDrawnRef.current = -1;
      onScroll();
    };
    schedule(0);
    startQueued();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onResize, {passive: true});
    update();
    return () => {
      disposed = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      rafRef.current=0;
    };
  }, [useFrames]);

  return (
    <>
      <img
        className="heroFullPoster"
        src={POSTER}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setPosterReady(true)}
        onError={() => setPosterReady(false)}
      />
      {!useFrames && allowVideo && <video
        ref={videoRef}
        className={'heroFullVideo'+(videoPlaying?' isPlaying':'')}
        src={VIDEO}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlaying={() => setVideoPlaying(true)}
        onPause={() => setVideoPlaying(false)}
        onError={() => setVideoPlaying(false)}
      />}
      {useFrames && <canvas ref={canvasRef} className={'heroScrollCanvas'+(frameReady?' isReady':'')} aria-hidden="true" />}
    </>
  );
}
