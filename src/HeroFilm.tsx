import React from 'react';

// Só carrega o MP4 no desktop, quando há movimento habilitado e sem economia de dados.
// O Hero original permanece como fallback visual em celulares e navegadores incompatíveis.
const SOURCE = '/cinematic/wuniflow_video_sem_audio%20(online-video-cutter.com).mp4';

export default function HeroFilm() {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [enabled,setEnabled] = React.useState(false);
  const [inView,setInView] = React.useState(true);

  React.useEffect(() => {
    const desktop = window.matchMedia('(min-width: 850px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const connection = (navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
      setEnabled(desktop.matches && !reduce.matches && !connection?.saveData);
    };
    update();
    desktop.addEventListener('change',update);
    reduce.addEventListener('change',update);
    return () => {desktop.removeEventListener('change',update);reduce.removeEventListener('change',update)};
  }, []);

  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const hero = video.closest('.cinematicHero');
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry=>entry.isIntersecting)),{threshold:0.01});
    if (hero) observer.observe(hero);
    return () => {observer.disconnect();hero?.classList.remove('isHeroFilmReady')};
  },[enabled]);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !enabled) return;
    if (inView) video.play().catch(()=>video.closest('.cinematicHero')?.classList.remove('isHeroFilmReady'));
    else video.pause();
  },[inView,enabled]);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      className="heroFullVideo"
      src={SOURCE}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onPlaying={event=>event.currentTarget.closest('.cinematicHero')?.classList.add('isHeroFilmReady')}
      onError={event=>event.currentTarget.closest('.cinematicHero')?.classList.remove('isHeroFilmReady')}
    />
  );
}
