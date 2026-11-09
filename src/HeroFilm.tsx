import React from 'react';

// A mesma experiência visual cinematográfica é disponibilizada em desktop e mobile.
// Em economizadores de dados, movimento reduzido ou falha de autoplay, permanece a capa do filme.
const SOURCE = '/cinematic/wuniflow-hero-v4.mp4';
const POSTER = '/cinematic/wuniflow-hero-v4-poster.webp';

export default function HeroFilm() {
  const ref = React.useRef<HTMLVideoElement>(null);
  const heroRef = React.useRef<HTMLElement | null>(null);
  const [playVideo, setPlayVideo] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [posterReady, setPosterReady] = React.useState(false);

  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const connection = (navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
      setPlayVideo(!reduce.matches && !connection?.saveData);
    };
    update();
    reduce.addEventListener('change',update);
    return () => reduce.removeEventListener('change',update);
  }, []);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    heroRef.current = hero;
    if (!hero || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      setInView(entries.some(entry => entry.isIntersecting));
    },{threshold:.01});
    observer.observe(hero);
    return () => {observer.disconnect();heroRef.current=null};
  }, []);

  React.useEffect(() => {
    const hero = heroRef.current || document.querySelector('.cinematicHero');
    hero?.classList.toggle('isHeroFilmReady',posterReady || playing);
    return () => {hero?.classList.remove('isHeroFilmReady')};
  },[posterReady,playing]);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !playVideo) return;
    if (inView) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  },[inView,playVideo]);

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
      {playVideo && <video
        ref={ref}
        className={'heroFullVideo'+(playing?' isPlaying':'')}
        src={SOURCE}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />}
    </>
  );
}
