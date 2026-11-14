import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCROLL_VIDEO = import.meta.env.VITE_CINEMATIC_SCROLL_VIDEO?.trim();
const POSTER = '/cinematic/wuniflow-hero-real-desktop.webp';

export default function CinematicScrollEnhancer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useGSAP(() => {
    const hero = document.querySelector<HTMLElement>('.cinematicHero');
    if (!hero) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const poster = hero.querySelector<HTMLElement>('.heroFullPoster');
      const product = hero.querySelector<HTMLElement>('.cinematicVisual');
      const video = videoRef.current;
      const camera = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top+=82',
          end: 'bottom top',
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      });

      if (poster) {
        camera.to(poster, { scale: 1.075, yPercent: -3, transformOrigin: '50% 44%', ease: 'none' }, 0);
      }
      if (product) {
        camera.to(product, { yPercent: -5, rotateY: -2, rotateX: 0, ease: 'none' }, 0);
      }

      let videoTrigger: ScrollTrigger | undefined;
      if (video && videoReady && Number.isFinite(video.duration) && video.duration > 0) {
        const endTime = Math.max(0, video.duration - 0.04);
        videoTrigger = ScrollTrigger.create({
          trigger: hero,
          start: 'top top+=82',
          end: 'bottom top',
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!video.seeking) video.currentTime = endTime * self.progress;
          },
        });
        hero.classList.add('hasScrollVideoReady');
      } else {
        hero.classList.remove('hasScrollVideoReady');
      }

      return () => {
        videoTrigger?.kill();
        camera.scrollTrigger?.kill();
        camera.kill();
        hero.classList.remove('hasScrollVideoReady');
      };
    });

    return () => media.revert();
  }, { dependencies: [videoReady], revertOnUpdate: true });

  if (!SCROLL_VIDEO) return null;

  return (
    <video
      ref={videoRef}
      className="heroScrollVideo"
      src={SCROLL_VIDEO}
      poster={POSTER}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onLoadedMetadata={(event) => {
        const duration = event.currentTarget.duration;
        setVideoReady(Number.isFinite(duration) && duration > 0);
      }}
      onError={() => setVideoReady(false)}
    />
  );
}
