import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { ChevronDown, MapPin, Gift, Church, PartyPopper, Wine, UtensilsCrossed } from 'lucide-react';

/* ─────────────────────────────────────────────
   Photo Album Intro Component
   ───────────────────────────────────────────── */
const ALBUM_PHOTOS = [
  '/photo-1.jpg', '/photo-2.jpg', '/photo-3.jpg',
  '/photo-4.jpg', '/photo-5.jpg', '/photo-6.jpg',
  '/photo-7.jpg', '/photo-8.jpg', '/photo-9.jpg',
];

// Each "page" has a front and back photo (like a real album spread)
function useAlbumPages() {
  return useMemo(() => {
    const pages: { front: string; back: string | null }[] = [];
    for (let i = 0; i < ALBUM_PHOTOS.length; i += 2) {
      pages.push({
        front: ALBUM_PHOTOS[i],
        back: ALBUM_PHOTOS[i + 1] ?? null,
      });
    }
    return pages;
  }, []);
}

const PAGE_FLIP_DELAY = 1.2;
const PAGE_FLIP_DURATION = 1.0;
const COVER_OPEN_DELAY = 0.8;

function useIsVertical() {
  const [v, setV] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const h = (e: MediaQueryListEvent) => setV(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

function AlbumPage({
  front,
  back,
  flipDelay,
  rightZIndex,
  leftZIndex,
  vertical,
}: {
  front: string;
  back: string | null;
  flipDelay: number;
  rightZIndex: number;
  leftZIndex: number;
  vertical: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const mid = (flipDelay + PAGE_FLIP_DURATION * 0.5) * 1000;
    const timer = setTimeout(() => setFlipped(true), mid);
    return () => clearTimeout(timer);
  }, [flipDelay]);

  const origin = vertical ? 'center bottom' : 'left center';
  const anim = vertical ? { rotateX: -180 } : { rotateY: -180 };
  const backTransform = vertical ? 'rotateX(180deg)' : 'rotateY(180deg)';

  // Border radius: outer edge only
  // Horizontal: front=right, back=left | Vertical: front=top, back=bottom
  const frontRadius = vertical ? 'rounded-t-lg' : 'rounded-r-lg';
  const backRadius = vertical ? 'rounded-b-lg' : 'rounded-l-lg';

  // Spine shadow position
  const frontShadow = vertical
    ? 'absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent'
    : 'absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent';
  const backShadow = vertical
    ? 'absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/10 to-transparent'
    : 'absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent';

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: origin,
        zIndex: flipped ? leftZIndex : rightZIndex,
      }}
      initial={vertical ? { rotateX: 0 } : { rotateY: 0 }}
      animate={anim}
      transition={{
        delay: flipDelay,
        duration: PAGE_FLIP_DURATION,
        ease: [0.645, 0.045, 0.355, 1],
      }}
    >
      {/* Front of page */}
      <div
        className={`absolute inset-0 ${frontRadius} overflow-hidden`}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <img src={front} alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
        <div className={frontShadow} />
      </div>
      {/* Back of page */}
      <div
        className={`absolute inset-0 ${backRadius} overflow-hidden`}
        style={{ backfaceVisibility: 'hidden', transform: backTransform }}
      >
        {back ? (
          <img src={back} alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#f5f0e8] flex items-center justify-center">
            <p className="text-[#5D8AA8]/40 serif text-2xl md:text-3xl italic">S&ZF</p>
          </div>
        )}
        <div className={backShadow} />
      </div>
    </motion.div>
  );
}

function PhotoAlbum() {
  const pages = useAlbumPages();
  const vertical = useIsVertical();
  const totalLayers = pages.length + 1;
  const [coverFlipped, setCoverFlipped] = useState(false);

  useEffect(() => {
    const mid = (COVER_OPEN_DELAY + PAGE_FLIP_DURATION * 0.5) * 1000;
    const timer = setTimeout(() => setCoverFlipped(true), mid);
    return () => clearTimeout(timer);
  }, []);

  const origin = vertical ? 'center bottom' : 'left center';
  const coverAnim = vertical ? { rotateX: -180 } : { rotateY: -180 };
  const coverInit = vertical ? { rotateX: 0 } : { rotateY: 0 };
  const backTransform = vertical ? 'rotateX(180deg)' : 'rotateY(180deg)';

  // Border radius per mode
  const frontRadius = vertical ? 'rounded-t-lg' : 'rounded-r-lg';
  const backRadius = vertical ? 'rounded-b-lg' : 'rounded-l-lg';
  const coverBorderInner = vertical ? 'rounded-t' : 'rounded-r';

  return (
    <div
      className="relative w-[220px] h-[300px] md:w-[400px] md:h-[540px]"
      style={{ perspective: '1500px' }}
    >
      {/* Book shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/15 rounded-full blur-xl" />

      {/* Back cover (static) */}
      <div className={`absolute inset-0 ${frontRadius} bg-gradient-to-br from-[#5D8AA8] to-[#3E6B8A] shadow-xl`}>
        <div className={`absolute inset-2 ${coverBorderInner} border border-[#8BB8D4]/30`} />
      </div>

      {/* Album pages */}
      {pages.map((page, i) => (
        <AlbumPage
          key={i}
          front={page.front}
          back={page.back}
          flipDelay={COVER_OPEN_DELAY + PAGE_FLIP_DURATION + i * PAGE_FLIP_DELAY}
          rightZIndex={totalLayers - i}
          leftZIndex={totalLayers + i + 2}
          vertical={vertical}
        />
      ))}

      {/* Front cover */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: origin,
          zIndex: coverFlipped ? 1 : totalLayers + 1,
        }}
        initial={coverInit}
        animate={coverAnim}
        transition={{
          delay: COVER_OPEN_DELAY,
          duration: PAGE_FLIP_DURATION,
          ease: [0.645, 0.045, 0.355, 1],
        }}
      >
        {/* Cover front */}
        <div
          className={`absolute inset-0 ${frontRadius} bg-gradient-to-br from-[#6B9DBF] to-[#4A7A9B] shadow-2xl flex flex-col items-center justify-center`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`absolute inset-2 ${coverBorderInner} border border-[#8BB8D4]/40`} />
          <div className={`absolute inset-4 ${coverBorderInner} border border-[#8BB8D4]/20`} />
          <p className="serif text-[#f5f0e8] text-3xl md:text-5xl font-bold tracking-wide">S&ZF</p>
          <div className="w-16 h-px bg-[#f5f0e8]/40 my-3" />
          <p className="text-[#f5f0e8]/70 text-sm md:text-base tracking-[0.3em] font-light">27 · 06 · 2026</p>
        </div>
        {/* Cover back (inside) */}
        <div
          className={`absolute inset-0 ${backRadius} bg-[#f5f0e8]`}
          style={{ backfaceVisibility: 'hidden', transform: backTransform }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[#5D8AA8]/30 serif text-xl md:text-2xl italic">bem-vindos</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Reusable scroll-reveal wrapper
   ───────────────────────────────────────────── */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Section heading component
   ───────────────────────────────────────────── */
function SectionHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <Reveal>
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold serif text-center mb-4 ${light ? 'text-white' : 'text-[#5D8AA8]'}`}>
        {children}
      </h2>
      <div className={`w-16 h-[2px] mx-auto mb-12 ${light ? 'bg-white/30' : 'bg-[#5D8AA8]/30'}`} />
    </Reveal>
  );
}

/* ─────────────────────────────────────────────
   Countdown hook
   ───────────────────────────────────────────── */
const WEDDING_DATE = new Date('2026-06-27T15:00:00');

function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ═════════════════════════════════════════════
   MAIN LANDING PAGE
   ═════════════════════════════════════════════ */
const LandingPage: React.FC<{ skipIntro?: boolean }> = ({ skipIntro = false }) => {
  const [introDone, setIntroDone] = useState(skipIntro);
  const [showNav, setShowNav] = useState(false);
  const countdown = useCountdown();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Parallax values for hero decorative elements
  const heroParallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.08]);

  // Lock scroll during intro
  useEffect(() => {
    if (skipIntro) return;
    document.body.classList.add('intro-active');
    const timer = setTimeout(() => {
      setIntroDone(true);
      document.body.classList.remove('intro-active');
    }, 8500);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('intro-active');
    };
  }, [skipIntro]);

  // Show nav after intro
  useEffect(() => {
    if (introDone) {
      const t = setTimeout(() => setShowNav(true), 600);
      return () => clearTimeout(t);
    }
  }, [introDone]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FCFBF7] text-stone-700 overflow-x-hidden">
      {/* ───── INTRO OVERLAY ───── */}
      <AnimatePresence>
        {!introDone && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-50 bg-[#FCFBF7] flex items-center justify-center"
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Photo album — offset right so spine stays centered when pages flip left */}
            <motion.div
              className="-translate-y-[150px] md:translate-y-0 md:translate-x-[200px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <PhotoAlbum />
            </motion.div>

            {/* Couple names tease */}
            <motion.p
              className="absolute bottom-8 text-[#5D8AA8]/60 text-lg tracking-[0.3em] uppercase font-light hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1.0 }}
            >
              Sofia & Zé Francisco
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── FLOATING NAV ───── */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-sm bg-[#FCFBF7]/60"
          >
            <button
              onClick={() => scrollTo('mapa')}
              className="text-sm tracking-[0.2em] uppercase text-stone-600 hover:text-[#5D8AA8] transition-colors font-light flex items-center gap-1.5"
            >
              <MapPin size={14} />
              Mapa
            </button>
            <button
              onClick={() => scrollTo('presentes')}
              className="text-sm tracking-[0.2em] uppercase text-stone-600 hover:text-[#5D8AA8] transition-colors font-light flex items-center gap-1.5"
            >
              <Gift size={14} />
              Presentes
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ───── HERO SECTION ───── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Parallax decorative blobs */}
        <motion.div
          style={{ y: heroParallaxY }}
          className="absolute top-10 -right-20 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-[#5D8AA8]/8 blur-3xl pointer-events-none"
        />
        <motion.div
          style={{ y: heroParallaxY }}
          className="absolute -bottom-10 -left-20 w-96 h-96 md:w-[550px] md:h-[550px] rounded-full bg-[#768D5D]/8 blur-3xl pointer-events-none"
        />

        {/* Logo background */}
        <motion.img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          style={{ y: heroParallaxY }}
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply pointer-events-none select-none"
          initial={{ opacity: 0 }}
          animate={introDone ? { opacity: 0.15 } : {}}
          transition={{ duration: 1.2, delay: 0.5 }}
        />

        <motion.div
          style={{ scale: heroScale }}
          className="text-center relative z-10"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#5D8AA8] serif leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={introDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          >
            Sofia
            <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-stone-400 my-2">&</span>
            Zé Francisco
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-stone-500 tracking-[0.35em] uppercase font-light"
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            27 . 06 . 2026
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 animate-bounce-slow"
          initial={{ opacity: 0 }}
          animate={introDone ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown className="text-stone-400" size={28} />
        </motion.div>
      </section>

      {/* ───── COUNTDOWN ───── */}
      <section className="py-20 md:py-28 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">

          {/* Top rule */}
          <Reveal>
            <div className="flex items-center gap-4 mb-12 md:mb-16">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#5D8AA8]/50 to-transparent" />
              <span className="text-[#5D8AA8] text-xs tracking-[0.5em] uppercase font-medium">faltam</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#5D8AA8]/50 to-transparent" />
            </div>
          </Reveal>

          {/* Numbers */}
          <div className="grid grid-cols-4 gap-2 md:gap-6 text-center">
            {([
              { value: countdown.days, label: 'Dias' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Minutos' },
              { value: countdown.seconds, label: 'Segundos' },
            ] as const).map((unit, i) => (
              <Reveal key={unit.label} delay={i * 0.1}>
                <div className="relative">
                  {/* Separator pipe — hidden on first */}
                  {i > 0 && (
                    <div className="absolute -left-1 md:-left-3 top-1/2 -translate-y-[60%] h-8 md:h-12 w-px bg-[#5D8AA8]/30" />
                  )}
                  <div className="flex justify-center text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold serif text-[#5D8AA8] tabular-nums leading-none">
                    {String(unit.value).padStart(2, '0').split('').map((digit, digitIndex) => (
                      <span
                        key={digitIndex}
                        className="relative inline-block overflow-hidden"
                        style={{ width: '0.58em', height: '1.05em' }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={digit}
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ y: '100%' }}
                            animate={{ y: '0%' }}
                            exit={{ y: '-100%' }}
                            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                          >
                            {digit}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    ))}
                  </div>
                  <span className="mt-2 md:mt-3 block text-[10px] md:text-xs tracking-[0.35em] uppercase text-stone-500 font-medium">
                    {unit.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Bottom rule */}
          <Reveal delay={0.4}>
            <div className="flex items-center gap-4 mt-12 md:mt-16">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#768D5D]/50 to-transparent" />
              <span className="text-[#768D5D] text-xs tracking-[0.5em] uppercase font-medium">27 · 06 · 2026</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#768D5D]/50 to-transparent" />
            </div>
          </Reveal>

        </div>
      </section>

      {/* ───── O DIA (TIMELINE) ───── */}
      <section className="py-24 md:py-32 px-6 bg-white/50 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <SectionHeading>O Dia</SectionHeading>

          {/* Horizontal timeline */}
          <div className="relative flex items-start justify-between px-4 md:px-12">

            {/* Swirl connectors between icons */}
            <svg
              className="absolute left-0 right-0 w-full pointer-events-none z-0"
              style={{ top: 20, height: 50 }}
              viewBox="0 0 800 50"
              fill="none"
            >
              {[0, 1, 2].map((seg) => {
                // Each icon center is at 100, 300, 500, 700 in an 800-wide viewBox
                const x1 = seg * 200 + 130;
                const x2 = (seg + 1) * 200 + 70;
                const span = x2 - x1;
                const lx1 = x1 + span * 0.33;
                const lx2 = x1 + span * 0.67;
                const r = 5;
                return (
                  <path
                    key={seg}
                    d={[
                      `M${x1},28`,
                      `Q${(x1 + lx1) / 2},46 ${lx1},28`,
                      `a${r},${r} 0 1,0 0.01,0`,
                      `Q${(lx1 + lx2) / 2},46 ${lx2},28`,
                      `a${r},${r} 0 1,0 0.01,0`,
                      `Q${(lx2 + x2) / 2},46 ${x2},28`,
                    ].join(' ')}
                    stroke="#5D8AA8"
                    strokeOpacity={0.3}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    fill="none"
                  />
                );
              })}
            </svg>

            {([
              {
                time: '16:00',
                title: 'Cerimónia',
                icon: <Church size={52} className="md:hidden" />,
                iconLg: <Church size={72} className="hidden md:block" />,
              },
              {
                time: '18:30',
                title: 'Cocktails',
                icon: <Wine size={52} className="md:hidden" />,
                iconLg: <Wine size={72} className="hidden md:block" />,
              },
              {
                time: '20:30',
                title: 'Jantar',
                icon: <UtensilsCrossed size={52} className="md:hidden" />,
                iconLg: <UtensilsCrossed size={72} className="hidden md:block" />,
              },
              {
                time: '23:00',
                title: 'Festa',
                icon: <PartyPopper size={52} className="md:hidden" />,
                iconLg: <PartyPopper size={72} className="hidden md:block" />,
              },
            ] as const).map((event, i) => (
              <Reveal key={i} delay={i * 0.15} className="flex flex-col items-center text-center flex-1 relative z-10">
                {/* Icon */}
                <div className="text-[#5D8AA8]">
                  {event.icon}
                  {event.iconLg}
                </div>
                {/* Time */}
                <span className="mt-3 text-[#5D8AA8] font-bold text-lg md:text-xl serif tabular-nums">
                  {event.time}
                </span>
                {/* Title */}
                <span className="mt-1 text-stone-700 text-xs md:text-sm font-medium tracking-wide">
                  {event.title}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── IGREJA ───── */}
      <section id="mapa" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>Igreja</SectionHeading>

          {/* Image + Map side by side */}
          <Reveal>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-stretch">
              {/* Church image */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm">
                <img
                  src="/igreja-pastel.png"
                  alt="Igreja de Nossa Senhora da Salvação"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent pt-10 pb-4 px-4 text-center">
                  <h3 className="text-white text-lg md:text-xl font-bold serif drop-shadow-md">
                    Igreja de Nossa Senhora da Salvação
                  </h3>
                  <p className="text-white/80 text-sm mt-1 drop-shadow-md">Arruda dos Vinhos</p>
                </div>
              </div>
              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex flex-col">
                <div className="flex-1 min-h-[280px] md:min-h-0 bg-stone-100">
                  <iframe
                    title="Igreja de Nossa Senhora da Salvação"
                    src="https://www.google.com/maps?q=Igreja+de+Nossa+Senhora+da+Salvação+Arruda+dos+Vinhos&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-4 text-center">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Igreja+de+Nossa+Senhora+da+Salvação+Arruda+dos+Vinhos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5D8AA8] text-white rounded-lg font-medium text-sm shadow-sm hover:bg-[#4A6E86] hover:scale-105 transition-all duration-300"
                  >
                    <MapPin size={16} />
                    Como Chegar
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Onde estacionar */}
          <Reveal delay={0.2}>
            <h3 className="text-xl md:text-2xl font-bold serif text-[#5D8AA8] text-center mt-14 mb-3">
              Onde estacionar?
            </h3>
            <p className="text-stone-500 text-sm md:text-base text-center mb-6 max-w-xxl mx-auto">
              A igreja tem difícil acesso de carro, recomendamos que estacionem neste parque gratuito.
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm">
              <div className="w-full h-56 md:h-72 bg-stone-100">
                <iframe
                  title="Estacionamento perto da Igreja"
                  src="https://www.google.com/maps?q=Estacionamento+gratuito,+R.+Irene+Lisboa,+2630-243+Arruda+dos+Vinhos&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 text-center">
                <a
                  href="https://maps.app.goo.gl/EGQrCAZTSYnLXhwD9?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#5D8AA8] hover:underline font-medium"
                >
                  <MapPin size={14} />
                  Ver no Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── QUINTA DA SARDINHA ───── */}
      <section className="py-24 md:py-32 px-6 bg-[#5D8AA8] text-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeading light>Cocktail e Jantar</SectionHeading>

          <Reveal>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-stretch">
              {/* Quinta image */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm">
                <img
                  src="/quinta-pastel.png"
                  alt="Quinta da Sardinha"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent pt-10 pb-4 px-4 text-center">
                  <h3 className="text-white text-lg md:text-xl font-bold serif drop-shadow-md">
                    Quinta da Sardinha
                  </h3>
                  <p className="text-white/80 text-sm mt-1 drop-shadow-md">Marinhais</p>
                </div>
              </div>
              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex flex-col">
                <div className="flex-1 min-h-[280px] md:min-h-0 bg-stone-100">
                  <iframe
                    title="Quinta da Sardinha"
                    src="https://www.google.com/maps?q=Quinta+da+Sardinha+Marinhais&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-4 text-center">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Quinta+da+Sardinha+Marinhais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5D8AA8] text-white rounded-lg font-medium text-sm shadow-sm hover:bg-[#4A6E86] hover:scale-105 transition-all duration-300"
                  >
                    <MapPin size={16} />
                    Como Chegar
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ───── ROTA ALTERNATIVA ───── */}
      <section className="py-16 md:py-20 px-6 bg-[#E8E0D4]">
        <div className="max-w-xl mx-auto text-center">
          <Reveal>
            <p className="text-2xl mb-3">⚠️</p>
            <p className="text-stone-700 font-semibold text-base md:text-lg leading-relaxed">
              Neste dia estarão a decorrer as festas da Sardinha Assada, em Benavente, e a estrada EN118 em direção à quinta estará cortada até perto das 21h.
            </p>
            <p className="text-stone-500 text-sm mt-4 mb-5">Rota alternativa sugerida:</p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Quinta+da+Sardinha+Marinhais&travelmode=driving"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-block"
            >
              <img
                src="/mapa-alternativa.png"
                alt="Mapa com rota alternativa para a Quinta da Sardinha"
                className="w-64 h-auto group-hover:scale-[1.02] transition-transform duration-500"
              />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───── ACCOMMODATION ───── */}
      <section className="py-24 md:py-32 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>Alojamento</SectionHeading>
          <Reveal>
            <p className="text-center text-stone-500 leading-relaxed mb-12 max-w-lg mx-auto -mt-6">
              Sugestões de alojamento perto da Quinta da Sardinha em Marinhais.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Casa do Massapez',
                tag: '★ 4/5 · TripAdvisor',
                tagColor: 'bg-[#5D8AA8]/10 text-[#5D8AA8]',
                desc: 'Quinta rural em Salvaterra de Magos com piscina, equitação e bicicletas. 5 quartos, estacionamento gratuito e vistas campestres.',
                url: 'https://www.visitribatejo.pt/en/catalogue/where-to-sleep/rural-tourism/casa-do-massapez/',
                img: 'https://www.visitribatejo.pt/fotos/produtos/r_ht_0024_p.jpg',
              },
              {
                name: 'Sítio do Chíron',
                tag: 'Casa Rural · Airbnb',
                tagColor: 'bg-[#768D5D]/10 text-[#768D5D]',
                desc: 'Quinta privada com piscina, jacuzzi, jardim com árvores de fruto e sala de jogos. A 4 minutos de supermercados e restaurantes.',
                url: 'https://www.airbnb.com/rooms/1125992685191588164',
                img: 'https://www.mybesthotel.eu/pic/_0cd1e10a_dddb_4e63_ab1b_691d1898e99b_658059d9ed778.jpg',
              },
              {
                name: 'Quinta da Lagoa',
                tag: 'Em Marinhais',
                tagColor: 'bg-[#768D5D]/10 text-[#768D5D]',
                desc: 'Alojamento local no coração de Marinhais, a poucos minutos da quinta. Piscina exterior e interior aquecida, 4 quartos para até 8 hóspedes.',
                url: 'https://www.booking.com/hotel/pt/wunderschones-landhaus-mit-pool-in-der-nahe-von-santarem.html',
                img: 'https://www.visitribatejo.pt/fotos/produtos/quinta_da_lagoa_3__19512886005caf56866ed2c.jpg',
              },
              {
                name: 'Sete Quintas Country House',
                tag: '★ 9.5 · Excelente',
                tagColor: 'bg-[#5D8AA8]/10 text-[#5D8AA8]',
                desc: 'Casa de campo em Salvaterra de Magos com piscina, jardim e estacionamento gratuito. Classificação de 9.5/10 em mais de 100 avaliações.',
                url: 'https://www.pt-ribatejo.com/pt/property/7-quintas-country-house.html',
                img: 'https://www.pt-ribatejo.com/data/Photos/OriginalPhoto/13884/1388450/1388450960/photo-sete-quintas-country-house-salvaterra-de-magos-1.JPEG',
              },
              {
                name: 'Salvaterra Country House & Spa',
                tag: 'Guia Michelin',
                tagColor: 'bg-amber-50 text-amber-700',
                desc: 'Retiro verde no coração do Ribatejo com spa, piscina e jardim tropical. A 35 minutos de Lisboa e perto da quinta.',
                url: 'https://salvaterracountryhouse.com',
                img: 'https://www.pt-ribatejo.com/data/Photos/OriginalPhoto/13424/1342454/1342454603/photo-salvaterra-country-house-spa-salvaterra-de-magos-1.JPEG',
              },
              {
                name: 'Chalés do Tejo',
                tag: 'Junto ao Rio Tejo',
                tagColor: 'bg-[#5D8AA8]/10 text-[#5D8AA8]',
                desc: 'Chalés modernos em Porto do Sabugueiro, Muge, junto ao Tejo. Várias tipologias para 3 a 7 pessoas, em pleno coração do Ribatejo.',
                url: 'https://chalesdotejo.pt',
                img: 'https://chalesdotejo.pt/public/uploads/62e32128-92dc-430a-a3df-47bdeeee551a.jpg',
              },
            ].map((place, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={place.img}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 self-start ${place.tagColor}`}>
                      {place.tag}
                    </span>
                    <h3 className="font-semibold text-stone-700 mb-2 group-hover:text-[#5D8AA8] transition-colors">{place.name}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed flex-1">{place.desc}</p>
                    <p className="mt-4 text-xs text-[#5D8AA8] font-medium">Ver alojamento →</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DRESS CODE ───── */}
      <section className="py-24 md:py-32 px-6 bg-white/50">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading>Dress Code</SectionHeading>
          <Reveal>
            <p className="text-2xl md:text-3xl serif text-stone-700 mb-4">Formal e Elegante</p>
            <p className="text-stone-500 leading-relaxed max-w-lg mx-auto">
              Queremos os nossos familiares e amigos no seu melhor para celebrar connosco este dia especial.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───── GIFTS ───── */}
      <section id="presentes" className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading>Lista de Presentes</SectionHeading>
          <Reveal>
            <p className="text-stone-500 leading-relaxed mb-8 max-w-lg mx-auto">
              A vossa presença é o maior presente que nos podem dar.
              Mas se quiserem contribuir para a nossa nova vida a dois,
              ficaremos muito gratos.
            </p>
            <a
              href="https://revolut.me/franciuk7d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#5D8AA8] text-white rounded-xl font-medium shadow-md hover:bg-[#4A6E86] hover:scale-105 transition-all duration-300"
            >
              <Gift size={18} />
              Contribuir via Revolut
            </a>
          </Reveal>
        </div>
      </section>


      {/* ───── FOOTER ───── */}
      <footer className="py-12 text-center border-t border-stone-200">
        <p className="serif text-xl text-[#5D8AA8] mb-2">Sofia & Zé Francisco</p>
        <p className="text-stone-400 text-sm tracking-wider">27 . 06 . 2026</p>
        <p className="text-stone-300 text-xs mt-4">Feito com amor</p>
      </footer>
    </div>
  );
};

export default LandingPage;
