import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { ChevronDown, MapPin, Gift, Phone } from 'lucide-react';

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
      <div className={`absolute inset-0 ${frontRadius} bg-gradient-to-br from-[#5D8AA8] to-[#3E6B8A] shadow-xl flex items-center justify-center`}>
        <div className={`absolute inset-2 ${coverBorderInner} border border-[#8BB8D4]/30`} />
        <motion.p
          className="relative z-10 serif text-[#f5f0e8]/70 text-3xl md:text-5xl italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: COVER_OPEN_DELAY + PAGE_FLIP_DURATION + (pages.length - 1) * PAGE_FLIP_DELAY + PAGE_FLIP_DURATION, duration: 0.8 }}
        >bem-vindos</motion.p>
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
        />

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

function ContactDropdown({ phone, label }: { phone: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const intl = `351${phone.replace(/\s/g, '')}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[#5D8AA8] text-sm hover:underline cursor-pointer"
      >
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50 min-w-[160px]"
          >
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Phone size={15} className="text-[#5D8AA8]" />
              Ligar
            </a>
            <a
              href={`https://wa.me/${intl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [menuOpen, setMenuOpen] = useState(false);
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
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-[#FCFBF7]/60"
          >
            {/* Desktop nav */}
            <div className="hidden md:flex items-center justify-center gap-10 px-10 py-4">
              {([
                { id: 'o-dia', label: 'O Dia' },
                { id: 'mapa', label: 'Igreja' },
                { id: 'jantar', label: 'Jantar' },
                { id: 'presentes', label: 'Lista de Presentes' },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-xs tracking-[0.25em] uppercase text-stone-500 hover:text-[#5D8AA8] transition-colors font-light"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile: burger */}
            <div className="md:hidden flex items-center justify-between px-6 py-4">
              <p className="serif text-[#5D8AA8] text-sm tracking-wide">S&ZF</p>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative w-6 h-4 flex flex-col justify-between"
                aria-label="Menu"
              >
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full h-[1.5px] bg-stone-500 origin-center"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block w-full h-[1.5px] bg-stone-500"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full h-[1.5px] bg-stone-500 origin-center"
                />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ───── MOBILE MENU OVERLAY ───── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 backdrop-blur-md bg-[#FCFBF7]/95 flex flex-col items-center justify-center gap-8"
          >
            {([
              { id: 'o-dia', label: 'O Dia' },
              { id: 'mapa', label: 'Igreja' },
              { id: 'jantar', label: 'Jantar' },
              { id: 'presentes', label: 'Lista de Presentes' },
            ] as const).map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                onClick={() => { setMenuOpen(false); scrollTo(item.id); }}
                className="serif text-2xl text-stone-600 hover:text-[#5D8AA8] transition-colors tracking-wide"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
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

      {/* ───── WELCOME MESSAGE ───── */}
      <section className="pt-10 md:pt-14 pb-6 md:pb-8 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <p className="serif text-[#5D8AA8] text-xl md:text-2xl italic leading-relaxed mb-6">
              Queridos amigos, tios e família,
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="serif text-[#5D8AA8] text-2xl md:text-3xl font-semibold mb-8">
              Bem-vindos ao nosso dia!
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-4">
              Estamos muito felizes por partilhar este momento especial convosco.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-4">
              Aqui encontrarão todas as informações sobre a celebração, o dress code e os detalhes para o grande dia.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed">
              Mal podemos esperar para vos ver e celebrar juntos esta nossa aventura!
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───── COUNTDOWN ───── */}
      <section className="pt-6 md:pt-8 pb-20 md:pb-28 px-6 overflow-hidden">
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
      <section id="o-dia" className="py-24 md:py-32 px-6 bg-white/50 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <SectionHeading>O Dia</SectionHeading>

          {/* Timeline illustration */}
          <Reveal>
            <div className="flex justify-center">
              <img
                src="/icons.png"
                alt="Church 16:00 · Toast 18:30 · Dinner 20:30 · Dance 23:00"
                className="w-full max-w-3xl mix-blend-multiply pointer-events-none select-none"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── DRESS CODE (nota) ───── */}
      <Reveal>
        <div className="max-w-lg mx-auto px-8 py-10 text-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#5D8AA8]/30" />
            <p className="serif text-[#5D8AA8] text-sm md:text-base tracking-[0.3em] uppercase">Dress Code</p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#5D8AA8]/30" />
          </div>
          <p className="serif text-stone-700 text-lg md:text-xl leading-loose">
            Cavalheiros: <span className="font-semibold">Fato e gravata</span><br />
            Ladies: <span className="font-semibold">Vestido elegante</span>
          </p>
          <div className="w-12 h-px bg-[#5D8AA8]/20 mx-auto my-5" />
          <p className="text-stone-400 text-sm md:text-base italic leading-relaxed">
            A vossa presença é o mais importante, mas adorávamos ver todos a rigor connosco.
          </p>
        </div>
      </Reveal>

      {/* ───── IGREJA ───── */}
      <section id="mapa" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>Igreja</SectionHeading>

          {/* Image + Map side by side */}
          <Reveal>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              {/* Left column: text + image */}
              <div className="flex flex-col">
                <p className="text-stone-600 text-base md:text-lg leading-relaxed text-center mb-4">
                  A missa de celebração do matrimónio terá início às 16:00 (confiando na pontualidade da noiva). Aconselhamos que cheguem cerca de 20 minutos mais cedo.
                </p>
                <div className="relative rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex-1">
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
              {/* Mobile: button only */}
              <div className="md:hidden flex justify-center mt-4">
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
              {/* Right column: map (desktop only) */}
              <div className="hidden md:flex flex-col">
                <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex flex-col flex-1">
                  <div className="flex-1 bg-stone-100">
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
      <section id="jantar" className="py-24 md:py-32 px-6 bg-[#5D8AA8] text-white">
        <div className="max-w-5xl mx-auto">
          <SectionHeading light>Cocktail e Jantar</SectionHeading>

          <Reveal>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              {/* Left column: text + image */}
              <div className="flex flex-col">
                <p className="text-white/80 text-base md:text-lg leading-relaxed text-center mb-4">
                  O cocktail começa às 18:30. À chegada à quinta, sigam as indicações da sinalética até ao parque de estacionamento.
                </p>
                <div className="relative rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex-1">
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
              </div>
              {/* Right column: text + map */}
              <div className="flex flex-col">
                <p className="text-white/80 text-base md:text-lg leading-relaxed text-center mb-4">
                  Caso utilizem a App - Waze, coloquem por favor como destino final: <em className="italic">Rua Particular da Quinta da Sardinha - Marinhais</em>
                </p>
                {/* Desktop: map */}
                <div className="hidden md:flex rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm flex-col flex-1">
                  <div className="flex-1 bg-stone-100">
                    <iframe
                      title="Quinta da Sardinha"
                      src="https://www.google.com/maps?q=39.0485206,-8.7195753&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=39.0485206,-8.7195753"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#5D8AA8] rounded-lg font-medium text-sm shadow-sm hover:bg-white/90 hover:scale-105 transition-all duration-300"
                    >
                      <MapPin size={16} />
                      Como Chegar
                    </a>
                  </div>
                </div>
                {/* Mobile: button only */}
                <div className="md:hidden flex justify-center mt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=39.0485206,-8.7195753"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#5D8AA8] rounded-lg font-medium text-sm shadow-sm hover:bg-white/90 hover:scale-105 transition-all duration-300"
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
            <p className="text-4xl md:text-5xl mb-3">⚠️</p>
            <p className="text-stone-700 font-semibold text-base md:text-lg leading-relaxed">
              Alertamos que, devido às Festas da Sardinha Assada, a estrada EN-118, no interior de Benavente, estará cortada.
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
      {/* ───── DRIVERS ───── */}
      <Reveal>
        <div className="max-w-lg mx-auto px-8 py-10 text-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#5D8AA8]/30" />
            <p className="serif text-[#5D8AA8] text-sm md:text-base tracking-[0.3em] uppercase">Drivers</p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#5D8AA8]/30" />
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 mb-6">
            <div>
              <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Opc. 1</p>
              <p className="serif text-stone-700 text-base md:text-lg font-semibold">Bernardo Neto</p>
              <ContactDropdown phone="916 815 927" label="916 815 927" />
            </div>
            <div>
              <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Opc. 2</p>
              <p className="serif text-stone-700 text-base md:text-lg font-semibold">Manuel Maria Maio</p>
              <ContactDropdown phone="911 110 911" label="911 110 911" />
            </div>
          </div>
          <div className="w-12 h-px bg-[#5D8AA8]/20 mx-auto my-5" />
          <p className="text-stone-400 text-sm md:text-base italic leading-relaxed max-w-md mx-auto">
            É possível organizar drivers de acordo com os carros necessários. Quem precisar, pode enviar uma mensagem e a coordenação será feita diretamente com cada pessoa.
          </p>
        </div>
      </Reveal>

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


      {/* ───── GIFTS ───── */}
      <section id="presentes" className="relative py-24 md:py-32 px-6 bg-gradient-to-b from-[#5D8AA8] to-[#4A7A9B] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal>
            <Gift size={32} className="text-white/30 mx-auto mb-6" />
          </Reveal>
          <SectionHeading light>Lista de Presentes</SectionHeading>

          <Reveal>
            <p className="serif text-white/90 text-lg md:text-xl leading-relaxed mb-4 max-w-xl mx-auto">
              A vossa presença no nosso dia é o que mais desejamos e nos deixa mais felizes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
              Estamos a preparar a nossa primeira casa, caso queiram ajudar-nos a torná-la mais acolhedora para vos podermos receber, listamos alguns itens ilustrativos do que iremos comprar.
              <br /><br />
              Poderão contribuir com o valor que desejarem através dos nossos dados bancários.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex justify-center mb-10">
              <div className="backdrop-blur-sm bg-white/[0.08] border border-white/[0.12] rounded-2xl px-8 py-5">
                <p className="text-white/90 font-medium text-sm md:text-base mb-3">Sofia Silva e José Francisco Pereira</p>
                <div className="flex flex-col gap-1">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">IBAN</p>
                  <p className="text-white font-medium text-sm md:text-base tracking-wide">PT50 0033 0000 4583 1457 1540 5</p>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">BIC/SWIFT</p>
                  <p className="text-white font-medium text-sm md:text-base tracking-wide">BCOMPTPL</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="w-16 h-px bg-white/20 mx-auto mb-6" />
            <p className="serif text-white/50 italic text-base md:text-lg">
              Obrigado por fazerem parte deste momento tão especial! 🌟
            </p>
          </Reveal>
        </div>
      </section>


      {/* ───── FOOTER ───── */}
      <footer className="py-12 text-center border-t border-stone-200">
        <p className="serif text-xl text-[#5D8AA8] mb-2">Sofia & Zé Francisco</p>
        <p className="text-stone-400 text-sm tracking-wider">27 . 06 . 2026</p>
        <p className="text-stone-300 text-xs mt-4">Vamos de boda 🪩</p>
      </footer>
    </div>
  );
};

export default LandingPage;
