import React from 'react';

// Fonte local já existente no repositório; os quadros WebP são derivados dela no CI.
// Ao falhar o carregamento dos quadros, o vídeo original assume a apresentação.
const SOURCE = '/cinematic/wuniflow_video_sem_audio%20(online-video-cutter.com).mp4';
const TOTAL_FRAMES = 12;
const framePath = (index: number) => '/cinematic/frames/frame_' + String(index+1).padStart(3,'0') + '.webp';
const clamp = (value: number) => Math.max(0,Math.min(1,value));

export default function HeroFilm() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [enabled,setEnabled] = React.useState(false);
  const [frameReady,setFrameReady] = React.useState(false);
  const [progress,setProgress] = React.useState(0);
  const [inView,setInView] = React.useState(true);

  React.useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
      setEnabled(desktop.matches && !reduced.matches && !connection?.saveData);
    };
    update();
    desktop.addEventListener('change',update);
    reduced.addEventListener('change',update);
    return () => {desktop.removeEventListener('change',update);reduced.removeEventListener('change',update)};
  },[]);

  React.useEffect(() => {
    if (!enabled) {setFrameReady(false);return;}
    let valid = true;
    const images: HTMLImageElement[] = [];
    const preload = Array.from({length:TOTAL_FRAMES},(_,index) => new Promise<void>((resolve,reject)=>{
      const img = new Image();
      images.push(img);
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Frame indisponível: '+index));
      img.src = framePath(index);
    }));
    Promise.all(preload).then(()=>{if(valid)setFrameReady(true)}).catch(()=>{if(valid)setFrameReady(false)});
    return () => {valid=false;images.forEach(image=>{image.onload=null;image.onerror=null})};
  },[enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    let scheduled = 0;
    const sync = () => {
      scheduled=0;
      const shell = document.querySelector('.wfHeroScrollShell');
      if (!shell) return;
      const bounds = shell.getBoundingClientRect();
      const available = Math.max(1,bounds.height-window.innerHeight);
      const next = clamp(-bounds.top/available);
      setProgress(previous => Math.abs(previous-next)>0.001?next:previous);
    };
    const schedule=()=>{if(!scheduled)scheduled=requestAnimationFrame(sync)};
    sync();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    return ()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(scheduled)cancelAnimationFrame(scheduled)};
  },[enabled]);

  React.useEffect(() => {
    const hero = document.querySelector('.cinematicHero');
    if (enabled && frameReady) hero?.classList.add('isHeroFilmReady');
    return () => {if(frameReady)hero?.classList.remove('isHeroFilmReady')};
  },[enabled,frameReady]);

  React.useEffect(() => {
    const video=videoRef.current;
    if (!enabled || frameReady || !video) return;
    const hero=video.closest('.cinematicHero');
    const observer=new IntersectionObserver(entries=>setInView(entries.some(entry=>entry.isIntersecting)),{threshold:.01});
    if(hero)observer.observe(hero);
    return ()=>observer.disconnect();
  },[enabled,frameReady]);

  React.useEffect(() => {
    const video=videoRef.current;
    if(!video || !enabled || frameReady)return;
    if(inView)video.play().catch(()=>video.closest('.cinematicHero')?.classList.remove('isHeroFilmReady'));
    else video.pause();
  },[enabled,frameReady,inView]);

  if (!enabled) return null;

  const position=progress*(TOTAL_FRAMES-1);
  const current=Math.min(TOTAL_FRAMES-1,Math.floor(position));
  const following=Math.min(TOTAL_FRAMES-1,current+1);
  const fade=position-current;

  return (
    <>
      {!frameReady && <video
        ref={videoRef}
        className="heroFullVideo"
        src={SOURCE}
        muted loop playsInline preload="metadata"
        aria-hidden="true"
        onPlaying={event=>event.currentTarget.closest('.cinematicHero')?.classList.add('isHeroFilmReady')}
        onError={event=>event.currentTarget.closest('.cinematicHero')?.classList.remove('isHeroFilmReady')}
      />}
      {frameReady && <div className="wfHeroFrameCanvas" aria-hidden="true">
        <img className="wfHeroFrame" src={framePath(current)} alt="" draggable={false}/>
        {following!==current && <img className="wfHeroFrame wfHeroFrameNext" src={framePath(following)} alt="" style={{opacity:fade}} draggable={false}/>}
      </div>}
      {frameReady && <div className="wfHeroFrameProgress" aria-hidden="true"><span style={{transform:'scaleX('+progress+')'}} /></div>}
    </>
  );
}
