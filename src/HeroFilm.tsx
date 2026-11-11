import React from 'react';

// A imagem estática é a experiência padrão nesta versão experimental.
// O filme anterior permanece acessível para comparação com ?hero=video.
const SOURCE = '/cinematic/wuniflow-hero-v4.mp4';
const POSTER = '/cinematic/wuniflow-hero-v4-poster.webp';

export default function HeroFilm() {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [posterReady, setPosterReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [motionAllowed, setMotionAllowed] = React.useState(false);
  const [videoAccepted, setVideoAccepted] = React.useState(false);
  const preferVideo = new URLSearchParams(window.location.search).get('hero') === 'video';

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
      setMotionAllowed(!media.matches && !connection?.saveData);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero) return;
    const observer = new IntersectionObserver(entries => {
      setInView(entries.some(entry => entry.isIntersecting));
    }, { threshold: .01 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const showVideo = preferVideo && motionAllowed && videoAccepted;
  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero) return;
    hero.classList.toggle('isHeroFilmReady', posterReady || playing);
    hero.classList.toggle('isHeroStill', !preferVideo || !showVideo);
    return () => {
      hero.classList.remove('isHeroFilmReady');
      hero.classList.remove('isHeroStill');
    };
  }, [posterReady, playing, preferVideo, showVideo]);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !showVideo) return;
    if (inView) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [inView, showVideo]);

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
      {preferVideo && motionAllowed && <video
        ref={ref}
        className={'heroFullVideo' + (playing && videoAccepted ? ' isPlaying' : '')}
        src={SOURCE}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onLoadedMetadata={(event) => {
          // Evita que uma mídia comprovadamente abaixo de HD amplie borrões em tela cheia.
          const video = event.currentTarget;
          setVideoAccepted(video.videoWidth >= 1280 && video.videoHeight >= 720);
        }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { setVideoAccepted(false); setPlaying(false); }}
      />}
    </>
  );
}
