import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { ChevronDown, MapPin, Gift, Clock, Church, PartyPopper } from 'lucide-react';

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
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#5D8AA8] serif text-center mb-4">
        {children}
      </h2>
      <div className="w-16 h-[2px] bg-[#5D8AA8]/30 mx-auto mb-12" />
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
const LandingPage: React.FC = () => {
  const [introDone, setIntroDone] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const countdown = useCountdown();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Parallax values for hero decorative elements
  const heroParallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.08]);

  // Lock scroll during intro
  useEffect(() => {
    document.body.classList.add('intro-active');
    const timer = setTimeout(() => {
      setIntroDone(true);
      document.body.classList.remove('intro-active');
    }, 3800);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('intro-active');
    };
  }, []);

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
            {/* 6 staggered photos */}
            <motion.div
              className="absolute top-[10%] left-[8%] w-56 h-72 md:w-72 md:h-96 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <img src="/photo-1.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute top-[25%] right-[10%] w-60 h-80 md:w-72 md:h-96 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: 4 }}
              animate={{ opacity: 1, scale: 1, rotate: 4 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <img src="/photo-2.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-64 h-80 md:w-80 md:h-105 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              <img src="/photo-3.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>

            {/* Photos 4–6 */}
            <motion.div
              className="absolute top-[5%] right-[8%] w-44 h-60 md:w-56 md:h-72 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: 7 }}
              animate={{ opacity: 1, scale: 1, rotate: 7 }}
              transition={{ delay: 1.7, duration: 0.8 }}
            >
              <img src="/photo-4.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute bottom-[8%] left-[6%] w-48 h-64 md:w-60 md:h-80 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ delay: 2.1, duration: 0.8 }}
            >
              <img src="/photo-5.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute bottom-[15%] right-[5%] w-44 h-56 md:w-56 md:h-72 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 3 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <img src="/photo-6.jpg" alt="Sofia & Zé Francisco" className="w-full h-full object-cover" />
            </motion.div>

            {/* Couple names tease */}
            <motion.p
              className="absolute bottom-8 text-[#5D8AA8]/60 text-lg tracking-[0.3em] uppercase font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
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
              { value: countdown.days,    label: 'Dias'     },
              { value: countdown.hours,   label: 'Horas'    },
              { value: countdown.minutes, label: 'Minutos'  },
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

      {/* ───── O DIA (SCHEDULE) ───── */}
      <section className="py-24 md:py-32 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>O Dia</SectionHeading>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Cerimónia */}
            <Reveal>
              <ScheduleCard
                icon={<Church size={32} className="text-[#5D8AA8]" />}
                title="Cerimónia"
                time="15:00"
                venue="Igreja de Nossa Senhora da Salvação"
                location="Arruda dos Vinhos"
              />
            </Reveal>

            {/* Festa */}
            <Reveal delay={0.15}>
              <ScheduleCard
                icon={<PartyPopper size={32} className="text-[#5D8AA8]" />}
                title="Festa"
                time="19:00"
                venue="Quinta da Sardinha"
                location="Marinhais"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───── VENUE / MAP ───── */}
      <section id="mapa" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>Locais</SectionHeading>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <Reveal>
              <VenueCard
                title="Igreja de Nossa Senhora da Salvação"
                address="Arruda dos Vinhos"
                mapsQuery="Igreja+de+Nossa+Senhora+da+Salvação+Arruda+dos+Vinhos"
              />
            </Reveal>
            <Reveal delay={0.15}>
              <VenueCard
                title="Quinta da Sardinha"
                address="Marinhais"
                mapsQuery="Quinta+da+Sardinha+Marinhais"
              />
            </Reveal>
          </div>
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
              },
              {
                name: 'Sítio do Chíron',
                tag: 'Casa Rural · Airbnb',
                tagColor: 'bg-[#768D5D]/10 text-[#768D5D]',
                desc: 'Quinta privada com piscina, jacuzzi, jardim com árvores de fruto e sala de jogos. A 4 minutos de supermercados e restaurantes.',
                url: 'https://www.airbnb.com/rooms/1125992685191588164',
              },
              {
                name: 'Quinta da Lagoa',
                tag: 'Em Marinhais',
                tagColor: 'bg-[#768D5D]/10 text-[#768D5D]',
                desc: 'Alojamento local no coração de Marinhais, a poucos minutos da quinta. Piscina exterior e interior aquecida, 4 quartos para até 8 hóspedes.',
                url: 'https://www.booking.com/hotel/pt/wunderschones-landhaus-mit-pool-in-der-nahe-von-santarem.html',
              },
              {
                name: 'Sete Quintas Country House',
                tag: '★ 9.5 · Excelente',
                tagColor: 'bg-[#5D8AA8]/10 text-[#5D8AA8]',
                desc: 'Casa de campo em Salvaterra de Magos com piscina, jardim e estacionamento gratuito. Classificação de 9.5/10 em mais de 100 avaliações.',
                url: 'https://www.pt-ribatejo.com/pt/property/7-quintas-country-house.html',
              },
              {
                name: 'Salvaterra Country House & Spa',
                tag: 'Guia Michelin',
                tagColor: 'bg-amber-50 text-amber-700',
                desc: 'Retiro verde no coração do Ribatejo com spa, piscina e jardim tropical. A 35 minutos de Lisboa e perto da quinta.',
                url: 'https://salvaterracountryhouse.com',
              },
              {
                name: 'Chalés do Tejo',
                tag: 'Junto ao Rio Tejo',
                tagColor: 'bg-[#5D8AA8]/10 text-[#5D8AA8]',
                desc: 'Chalés modernos em Porto do Sabugueiro, Muge, junto ao Tejo. Várias tipologias para 3 a 7 pessoas, em pleno coração do Ribatejo.',
                url: 'https://chalesdotejo.pt',
              },
            ].map((place, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${place.tagColor}`}>
                    {place.tag}
                  </span>
                  <h3 className="font-semibold text-stone-700 mb-2 group-hover:text-[#5D8AA8] transition-colors">{place.name}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{place.desc}</p>
                  <p className="mt-4 text-xs text-[#5D8AA8] font-medium">Ver alojamento →</p>
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
            <p className="text-2xl md:text-3xl serif text-stone-700 mb-4">Formal</p>
            <p className="text-stone-500 leading-relaxed max-w-lg mx-auto">
              Pedimos que os nossos convidados venham vestidos com traje formal.
              O dia promete ser longo e cheio de dança — tragam sapatos confortáveis!
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

      {/* ───── FAQ ───── */}
      <section className="py-24 md:py-32 px-6 bg-white/50">
        <div className="max-w-2xl mx-auto">
          <SectionHeading>Perguntas Frequentes</SectionHeading>
          <div className="space-y-4">
            {[
              {
                q: 'A que horas devo chegar?',
                a: 'Pedimos que cheguem pelo menos 20 a 30 minutos antes da cerimónia, que começa às 15h00. Assim garantimos que tudo começa a horas!',
              },
              {
                q: 'Posso tirar fotos e filmar durante a cerimónia?',
                a: 'Sim, podem fotografar e filmar à vontade durante toda a cerimónia e receção. Partilhem os momentos com a hashtag dos noivos!',
              },
              {
                q: 'Há estacionamento disponível?',
                a: 'Sim, existe estacionamento disponível junto a ambos os locais — na igreja em Arruda dos Vinhos e no espaço da receção em Marinhais.',
              },
              {
                q: 'O que acontece entre a cerimónia e a receção?',
                a: 'A cerimónia termina por volta das 16h30 e a receção começa às 19h00 em Marinhais. Aproveitem para conviver e descansar antes da festa!',
              },
              {
                q: 'Podem crianças participar?',
                a: 'O casamento é um evento para adultos. Agradecemos a vossa compreensão e aproveitem a noite!',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-stone-100">
                  <p className="font-semibold text-stone-700 mb-2">{item.q}</p>
                  <p className="text-stone-500 leading-relaxed text-sm">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
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

/* ─────────────────────────────────────────────
   Schedule Card
   ───────────────────────────────────────────── */
function ScheduleCard({
  icon,
  title,
  time,
  venue,
  location,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
  venue: string;
  location: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-stone-100 text-center"
    >
      <div className="flex justify-center mb-5">{icon}</div>
      <h3 className="text-2xl font-bold serif text-stone-800 mb-3">{title}</h3>
      <div className="flex items-center justify-center gap-2 text-[#5D8AA8] font-medium text-lg mb-4">
        <Clock size={16} />
        {time}
      </div>
      <p className="text-stone-600 font-medium">{venue}</p>
      <p className="text-stone-400 text-sm mt-1">{location}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Venue Card with Map
   ───────────────────────────────────────────── */
function VenueCard({
  title,
  address,
  mapsQuery,
}: {
  title: string;
  address: string;
  mapsQuery: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm">
      {/* Map embed */}
      <div className="w-full h-56 md:h-64 bg-stone-100">
        <iframe
          title={title}
          src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold serif text-stone-800 mb-1">{title}</h3>
        <p className="text-stone-400 text-sm mb-4">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#5D8AA8] hover:underline font-medium"
        >
          <MapPin size={14} />
          Como Chegar
        </a>
      </div>
    </div>
  );
}

export default LandingPage;
