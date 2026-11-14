type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  fbq?: Fbq;
  __wuniflowTrackingInitialized?: boolean;
};

const ga4Id = usableId(import.meta.env.VITE_GA4_ID, /^G-[A-Z0-9]+$/i);
const adsId = usableId(import.meta.env.VITE_GOOGLE_ADS_ID, /^AW-\d+$/i);
const metaPixelId = usableId(import.meta.env.VITE_META_PIXEL_ID, /^\d+$/);
const conversionLabel = usableLabel(import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL);

function usableId(value: string | undefined, format: RegExp): string | undefined {
  const id = value?.trim();
  if (!id || !format.test(id) || /X{3,}/i.test(id) || /^0+$/.test(id)) return undefined;
  return id;
}

function usableLabel(value: string | undefined): string | undefined {
  const label = value?.trim();
  if (!label || /ROTULO|LABEL|PLACEHOLDER/i.test(label)) return undefined;
  return label;
}

export function initializeTracking(): void {
  const trackingWindow = window as TrackingWindow;
  if (trackingWindow.__wuniflowTrackingInitialized) return;
  trackingWindow.__wuniflowTrackingInitialized = true;

  initializeGoogle(trackingWindow);
  initializeMeta(trackingWindow);

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest('a, button, [role="button"]');
      if (!control) return;

      const label = `${control.getAttribute('aria-label') || ''} ${control.textContent || ''}`
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase('pt-BR');

      if (
        ['agendar diagnóstico', 'mapear minha operação', 'iniciar diagnóstico'].some((cta) =>
          label.includes(cta),
        )
      ) {
        trackInitiateCheckout();
      }
    },
    true,
  );
}

function initializeGoogle(trackingWindow: TrackingWindow): void {
  const ids = [ga4Id, adsId].filter((id): id is string => Boolean(id));
  if (!ids.length) return;

  trackingWindow.dataLayer = trackingWindow.dataLayer || [];
  trackingWindow.gtag =
    trackingWindow.gtag ||
    function gtag() {
      trackingWindow.dataLayer?.push(arguments);
    };

  trackingWindow.gtag('js', new Date());
  ids.forEach((id) => trackingWindow.gtag?.('config', id));

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`;
  document.head.appendChild(script);
}

function initializeMeta(trackingWindow: TrackingWindow): void {
  if (!metaPixelId || trackingWindow.fbq) return;

  const fbq = ((...args: unknown[]) => {
    fbq.queue.push(args);
  }) as Fbq;
  fbq.queue = [];
  fbq.loaded = false;
  fbq.version = '2.0';
  trackingWindow.fbq = fbq;

  fbq('init', metaPixelId);
  fbq('track', 'PageView');

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
}

function trackInitiateCheckout(): void {
  const trackingWindow = window as TrackingWindow;
  if (ga4Id) trackingWindow.gtag?.('event', 'begin_checkout');
  if (metaPixelId) trackingWindow.fbq?.('track', 'InitiateCheckout');
}

export function trackLead(): void {
  const trackingWindow = window as TrackingWindow;
  if (ga4Id) trackingWindow.gtag?.('event', 'generate_lead');
  if (metaPixelId) trackingWindow.fbq?.('track', 'Lead');
  if (adsId && conversionLabel) {
    trackingWindow.gtag?.('event', 'conversion', {
      send_to: `${adsId}/${conversionLabel}`,
    });
  }
}
