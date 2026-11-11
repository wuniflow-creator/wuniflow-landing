import React from 'react';

const LEGACY_POSTER = '/cinematic/wuniflow-hero-v4-poster.webp';
const LEGACY_VIDEO = '/cinematic/wuniflow-hero-v4.mp4';
const NEW_DESKTOP = '/cinematic/wuniflow-hero-real-desktop.webp';
const NEW_MOBILE = '/cinematic/wuniflow-hero-real-mobile.webp';

// Progressive enhancement: if the new artwork is not yet deployed,
// retain the prior cover without removing the hero or its CTA.
export default function HeroFilm() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [imageReady, setImageReady] = React.useState(false);
  const [legacyFallback, setLegacyFallback] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [videoAllowed, setVideoAllowed] = React.useState(false);
  const [motionAllowed, setMotionAllowed] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [pageVisible, setPageVisible] = React.useState(!document.hidden);
  React.useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const requestedLegacyVideo = new URLSearchParams(window.location.search).get('hero') === 'video';

  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setMotionAllowed(!reduce.matches);
    };
    update();
    reduce.addEventListener('change', update);
    return () => reduce.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      setInView(entries.some(entry => entry.isIntersecting));
    }, { threshold: 0.01 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const showVideo = requestedLegacyVideo && motionAllowed && videoAllowed;
  React.useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero) return;
    hero.classList.toggle('isHeroFilmReady', imageReady || videoPlaying);
    hero.classList.toggle('isHeroStill', !showVideo);
    hero.classList.toggle('isHeroReal', imageReady && !legacyFallback);
    hero.classList.toggle('isHeroMotion', motionAllowed && !showVideo && inView && pageVisible);
    return () => {
      hero.classList.remove('isHeroFilmReady', 'isHeroStill', 'isHeroReal', 'isHeroMotion');
    };
  }, [imageReady, videoPlaying, showVideo, legacyFallback, motionAllowed, inView, pageVisible]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;
    if (inView && pageVisible) video.play().catch(() => setVideoPlaying(false));
    else video.pause();
  }, [inView, pageVisible, showVideo]);

  return (
    <>
      <picture>
        {!legacyFallback && <source media="(max-width: 800px)" srcSet={NEW_MOBILE} type="image/webp" />}
        <img
          className="heroFullPoster"
          src={legacyFallback ? LEGACY_POSTER : NEW_DESKTOP}
          alt=""
          aria-hidden="true"
          width={1672}
          height={941}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageReady(true)}
          onError={() => { if (!legacyFallback) { setLegacyFallback(true); setImageReady(false); } }}
        />
      </picture>
      {requestedLegacyVideo && motionAllowed && <video
        ref={videoRef}
        className={'heroFullVideo' + (videoPlaying && videoAllowed ? ' isPlaying' : '')}
        src={LEGACY_VIDEO}
        poster={LEGACY_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onLoadedMetadata={event => {
          const video = event.currentTarget;
          setVideoAllowed(video.videoWidth >= 1280 && video.videoHeight >= 720);
        }}
        onPlaying={() => setVideoPlaying(true)}
        onPause={() => setVideoPlaying(false)}
        onError={() => { setVideoAllowed(false); setVideoPlaying(false); }}
      />}

    </>
  );
}
