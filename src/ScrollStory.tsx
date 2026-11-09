import React from 'react';
import './scroll-story.css';

const frames = [
  { step: '01 / ESTRATÉGIA', title: 'Entendemos o desafio.', text: 'Antes de propor tecnologia, investigamos processos, pessoas e oportunidades reais.' },
  { step: '02 / CRIAÇÃO', title: 'Projetamos a experiência.', text: 'Transformamos a estratégia em interfaces elegantes, acessíveis e orientadas à conversão.' },
  { step: '03 / EVOLUÇÃO', title: 'Conectamos o negócio.', text: 'Unimos sistemas, dados e automação para gerar resultados que podem ser acompanhados.' }
];
const mediaUrl = import.meta.env.VITE_CINEMATIC_SCROLL_VIDEO as string | undefined;

export default function ScrollStory() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [motion, setMotion] = React.useState(false);
  const [desktop, setDesktop] = React.useState(false);

  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 768px)');
    const update = () => { setMotion(!reduced.matches); setDesktop(wide.matches); };
    update();
    reduced.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); wide.removeEventListener('change', update); };
  }, []);

  React.useEffect(() => {
    if (!motion || !desktop) { setProgress(0); return; }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const next = Math.max(0, Math.min(1, -rect.top / total));
      setProgress(old => Math.abs(old - next) > 0.002 ? next : old);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (frame) cancelAnimationFrame(frame); };
  }, [motion, desktop]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready || !motion || !desktop || !Number.isFinite(video.duration)) return;
    const target = Math.min(Math.max(0, video.duration - 0.05), progress * video.duration);
    if (Math.abs(video.currentTime - target) > 0.055 && !video.seeking) video.currentTime = target;
  }, [progress, ready, motion, desktop]);

  const active = motion && desktop ? Math.min(frames.length - 1, Math.floor(progress * frames.length)) : 0;
  return (
    <section ref={sectionRef} className={`wfStory ${motion && desktop ? 'wfStoryAnimated' : ''}`} aria-label="Como transformamos ideias em experiências digitais">
      <div className="wfStorySticky">
        <div className="wfStoryMedia" aria-hidden="true">
          {mediaUrl && motion && desktop && <video ref={videoRef} muted playsInline preload="metadata" tabIndex={-1} onLoadedMetadata={() => setReady(true)} onError={() => setReady(false)} className={ready ? 'wfStoryVideo isReady' : 'wfStoryVideo'}><source src={mediaUrl} type="video/mp4" /></video>}
          <img src="/assets/portfolio-gpstrade.webp" width="1536" height="1272" loading="lazy" decoding="async" alt="" className="wfStoryPoster" />
          <div className="wfStoryShade"/>
        </div>
        <div className="wfStoryInner">
          <p className="wfStoryKicker">WUNIFLOW / EXPERIÊNCIAS QUE MOVEM NEGÓCIOS</p>
          <div className="wfStoryCopy" aria-live="off">
            <span className="wfStoryIndex">{frames[active].step}</span>
            <h2 key={active}>{frames[active].title}</h2>
            <p key={`text-${active}`}>{frames[active].text}</p>
            <a href="/diagnostico" className="wfStoryLink">Começar meu projeto <span aria-hidden="true">↗</span></a>
          </div>
          <div className="wfStoryProgress" aria-hidden="true"><span style={{ transform: `scaleX(${motion && desktop ? progress : 1})` }} /></div>
        </div>
      </div>
    </section>
  );
}
