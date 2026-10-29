import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderGit2,
  GraduationCap,
  Image as ImageIcon,
  Instagram,
  Layers,
  Mail,
  Phone,
  Play,
  UserCheck,
} from 'lucide-react';

import { MacBookScene, IntroAnimationRefs } from './components/MacBookScene';
import { PlayableVideo } from './components/PlayableVideo';
import { ProjectModal } from './components/ProjectModal';
import {
  CONTACT_INFO,
  EDUCATION_DATA,
  PortfolioProject,
  ProjectCategory,
  PROJECTS,
  ROLE_SKILLS,
  SITE_ASSETS,
} from './data/projects';
import { getProceduralSceneDataUrl } from './utils/proceduralMedia';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  // High-frequency animation refs (mutated without causing React re-renders on scroll)
  const animRefs = useRef<IntroAnimationRefs>({
    openingProgress: 0,
    zoomProgress: 0,
    contentRevealProgress: 0,
    isLocked: false,
    isSceneActive: true,
  });

  // DOM refs for direct compositor updates (opacity, transform, visibility)
  const topProgressRef = useRef<HTMLDivElement | null>(null);
  const introTrackRef = useRef<HTMLDivElement | null>(null);
  const canvasLayerRef = useRef<HTMLDivElement | null>(null);
  const heroOverlayRef = useRef<HTMLDivElement | null>(null);
  const heroHeadlineRef = useRef<HTMLDivElement | null>(null);
  const heroPortraitRef = useRef<HTMLDivElement | null>(null);
  const hudDockRef = useRef<HTMLDivElement | null>(null);
  const hudStageTextRef = useRef<HTMLSpanElement | null>(null);
  const hudPercentTextRef = useRef<HTMLSpanElement | null>(null);

  const eduSectionRef = useRef<HTMLElement | null>(null);
  const eduProgressLineRef = useRef<HTMLDivElement | null>(null);
  const workSectionRef = useRef<HTMLElement | null>(null);
  const showreelSectionRef = useRef<HTMLElement | null>(null);
  const contactSectionRef = useRef<HTMLElement | null>(null);

  // Low-frequency UI interactive state
  const [sceneReady, setSceneReady] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string>(ROLE_SKILLS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<PortfolioProject | null>(null);
  const [hudCollapsed, setHudCollapsed] = useState(false);

  // --- SLIDESHOW STATE & LOGIC ---
  const [portraitIndex, setPortraitIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Define your slideshow images here. The first is your existing portraitUrl.
  const portraitImages = [
    SITE_ASSETS.portraitUrl,
    // Add additional image URLs below for the slideshow
    '/images/portrait-1.JPG', 
    '/images/portrait-2.jpg',
    '/images/portrait-3.jpg',
  ].filter(url => url && url.trim().length > 0);

  useEffect(() => {
    if (portraitImages.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setPortraitIndex((prev) => (prev + 1) % portraitImages.length);
    }, 4000); // Changes image every 4 seconds
    return () => clearInterval(interval);
  }, [portraitImages.length, isPaused]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setPortraitIndex((prev) => (prev - 1 + portraitImages.length) % portraitImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setPortraitIndex((prev) => (prev + 1) % portraitImages.length);
  };
  // --- END SLIDESHOW LOGIC ---

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  /**
   * Deterministic function that applies the 4-stage intro choreography
   * to the DOM & 3D refs for any normalized intro progress `p` in [0, 1].
   */
  const applyIntroProgress = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    const openProg = Math.max(0, Math.min(1, clamped / 0.46));
    const zoomProg =
      openProg >= 0.999
        ? Math.max(0, Math.min(1, (clamped - 0.46) / (0.8 - 0.46)))
        : 0;
    const revealProg =
      zoomProg >= 0.999
        ? Math.max(0, Math.min(1, (clamped - 0.8) / (1.0 - 0.8)))
        : 0;

    const state = animRefs.current;
    state.openingProgress = openProg;
    state.zoomProgress = zoomProg;
    state.contentRevealProgress = revealProg;
    state.isLocked = clamped >= 0.999;
    state.isSceneActive = clamped < 0.999;

    if (canvasLayerRef.current) {
      const canvasOpacity = 1 - revealProg;
      canvasLayerRef.current.style.opacity = String(canvasOpacity);
      canvasLayerRef.current.style.visibility = canvasOpacity <= 0.01 ? 'hidden' : 'visible';
      canvasLayerRef.current.style.pointerEvents = revealProg > 0.1 ? 'none' : 'auto';
    }

    if (heroOverlayRef.current) {
      const isVisible = revealProg > 0.01;
      heroOverlayRef.current.style.opacity = String(revealProg);
      heroOverlayRef.current.style.visibility = isVisible ? 'visible' : 'hidden';
      heroOverlayRef.current.style.pointerEvents = revealProg >= 0.65 ? 'auto' : 'none';
    }

    if (heroHeadlineRef.current) {
      const yOffset = (1 - revealProg) * 28;
      const scaleVal = 0.96 + revealProg * 0.04;
      heroHeadlineRef.current.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) scale(${scaleVal.toFixed(3)})`;
    }

    if (heroPortraitRef.current) {
      const yOffset = (1 - revealProg) * 36;
      heroPortraitRef.current.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0)`;
    }

    if (hudDockRef.current) {
      const hudOpacity = revealProg > 0.05 ? Math.max(0, 1 - revealProg * 4) : 1;
      hudDockRef.current.style.opacity = String(hudOpacity);
      hudDockRef.current.style.visibility = hudOpacity <= 0.02 ? 'hidden' : 'visible';
      hudDockRef.current.style.pointerEvents = hudOpacity <= 0.1 ? 'none' : 'auto';
    }

    if (hudStageTextRef.current) {
      if (clamped <= 0.01) {
        hudStageTextRef.current.textContent = 'STAGE 00 // STUDIO READY (SCROLL TO OPEN MACBOOK)';
      } else if (openProg < 1) {
        hudStageTextRef.current.textContent = 'STAGE 01 // OPENING MACBOOK PRO LID';
      } else if (zoomProg < 1) {
        hudStageTextRef.current.textContent = 'STAGE 02 // PUSHING CAMERA INTO NLE DISPLAY';
      } else {
        hudStageTextRef.current.textContent = 'STAGE 03 // REVEALING PORTFOLIO';
      }
    }

    if (hudPercentTextRef.current) {
      hudPercentTextRef.current.textContent = `${Math.round(clamped * 100)}%`;
    }
  }, []);

  // --- GSAP REFRESH FIX ---
  // This recalculates GSAP positions when you filter categories to prevent empty space below
  useEffect(() => {
    let ctx: gsap.Context;

    const timer = setTimeout(() => {
      // Recalculates page height for ScrollTrigger so layout doesn't break
      ScrollTrigger.refresh();

      if (workSectionRef.current) {
        ctx = gsap.context(() => {
          // Explicitly animate just the newly filtered project cards
          gsap.fromTo(
            '.project-card',
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: workSectionRef.current,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        }, workSectionRef);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [selectedCategory]);

  // General Setup GSAP ScrollTriggers
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      applyIntroProgress(1);
      return;
    }

    applyIntroProgress(0);

    const ctx = gsap.context(() => {
      if (introTrackRef.current) {
        ScrollTrigger.create({
          trigger: introTrackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true, 
          onUpdate: (self) => {
            applyIntroProgress(self.progress);
          },
          onLeave: () => {
            applyIntroProgress(1);
            animRefs.current.isLocked = true;
            animRefs.current.isSceneActive = false;
          },
          onEnterBack: () => {
            animRefs.current.isLocked = false;
            animRefs.current.isSceneActive = true;
          },
        });
      }

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (topProgressRef.current) {
            topProgressRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
          }
        },
      });

      if (eduSectionRef.current && eduProgressLineRef.current) {
        gsap.fromTo(
          eduProgressLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: eduSectionRef.current,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 1,
            },
          }
        );
      }

      // Replaced .gsap-reveal for all sections OTHER than the filtered grid
      const revealSections = [
        eduSectionRef.current,
        workSectionRef.current,
        showreelSectionRef.current,
        contactSectionRef.current,
      ].filter(Boolean) as HTMLElement[];

      revealSections.forEach((sec) => {
        const animBlocks = sec.querySelectorAll('.gsap-reveal');
        if (animBlocks.length > 0) {
          gsap.fromTo(
            animBlocks,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    });

    return () => {
      ctx.revert();
    };
  }, [applyIntroProgress]);

  const scrollToSection = (targetId: string) => {
    if (targetId === 'top-studio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'who-am-i') {
      const track = introTrackRef.current;
      if (track) {
        const targetY = track.offsetTop + track.offsetHeight - window.innerHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeSkill =
    ROLE_SKILLS.find((s) => s.id === activeSkillId) || ROLE_SKILLS[0];

  const filteredProjects =
    selectedCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === selectedCategory);

  const hasCustomPortrait = portraitImages.length > 0;

  return (
    <div className="min-h-screen bg-[#050508] text-[#f4f4f6] selection:bg-violet-600/40 selection:text-white">
      {/* Top Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5 pointer-events-none">
        <div
          ref={topProgressRef}
          className="h-full w-full bg-violet-500 origin-left scale-x-0"
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-8 px-5 sm:px-8 lg:px-12 h-16 bg-[#050508]/95 border-b border-white/10">
        {/* Zone 1: Single Brand Wordmark / Logo */}
        <a
          href="#top-studio"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('top-studio');
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-white hover:text-violet-300 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded flex items-center gap-3"
        >
          {SITE_ASSETS.logoUrl && SITE_ASSETS.logoUrl.trim().length > 0 && (
            <img
              src={SITE_ASSETS.logoUrl}
              alt="Yashwanth Edits Logo"
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain"
            />
          )}
          <span>Yashwanth Edits</span>
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300"
        >
          <a
            href="#who-am-i"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('who-am-i');
            }}
            className="hover:text-white hover:underline underline-offset-8 decoration-violet-400 transition-colors whitespace-nowrap shrink-0"
          >
            Who Am I
          </a>
          <a
            href="#education"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('education');
            }}
            className="hover:text-white hover:underline underline-offset-8 decoration-violet-400 transition-colors whitespace-nowrap shrink-0"
          >
            Education
          </a>
          <a
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('work');
            }}
            className="hover:text-white hover:underline underline-offset-8 decoration-violet-400 transition-colors whitespace-nowrap shrink-0"
          >
            Work Experience
          </a>
          <a
            href="#showreel"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('showreel');
            }}
            className="hover:text-white hover:underline underline-offset-8 decoration-violet-400 transition-colors whitespace-nowrap shrink-0"
          >
            Showreel
          </a>
        </nav>

        {/* Zone 3: 1 Primary CTA Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Let&apos;s Talk
          </a>
        </div>
      </header>

      <div
        id="top-studio"
        ref={introTrackRef}
        className="relative w-full h-[360vh]"
      >
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050508]">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 44%, rgba(109, 40, 217, 0.16) 0%, rgba(17, 12, 34, 0.08) 45%, rgba(5, 5, 8, 1) 80%)',
            }}
          />

          <div
            ref={canvasLayerRef}
            className="absolute inset-0 z-10 w-full h-full"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            <MacBookScene
              animRefs={animRefs}
              onSceneReady={handleSceneReady}
            />
            
            {!sceneReady && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#050508]">
                <span className="font-mono text-xs tracking-widest text-zinc-400">
                  INITIALIZING 3D STUDIO...
                </span>
              </div>
            )}
          </div>

          <div
            ref={hudDockRef}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[94vw] transition-opacity duration-200"
          >
            <button
              type="button"
              onClick={() => setHudCollapsed((c) => !c)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#0d0d16] border border-b-0 border-white/12 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {hudCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show Studio Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>
            
            {!hudCollapsed && (
              <div className="flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-xl bg-[#0d0d16]/95 border border-white/12 shadow-2xl">
                <span
                  ref={hudStageTextRef}
                  className="font-mono text-xs text-violet-300 whitespace-nowrap shrink-0"
                >
                  STAGE 00 // STUDIO READY (SCROLL TO OPEN MACBOOK)
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  |
                </span>
                <span
                  ref={hudPercentTextRef}
                  className="font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap shrink-0"
                >
                  0%
                </span>
                <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => scrollToSection('who-am-i')}
                  className="px-3 py-1 rounded-md bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/30 text-xs font-medium text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Skip to Introduction
                </button>
              </div>
            )}
          </div>

          <section
            id="who-am-i"
            ref={heroOverlayRef}
            aria-label="Who Am I - Introduction"
            style={{
              opacity: 0,
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
            className="relative z-20 w-full h-full flex items-center justify-center pt-16 px-5 sm:px-8 lg:px-12 overflow-y-auto lg:overflow-hidden"
          >
            <div className="w-full max-w-7xl mx-auto py-8 lg:py-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                <div
                  ref={heroHeadlineRef}
                  className="lg:col-span-7 flex flex-col justify-center space-y-6"
                >
                  <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-violet-400">
                    <span>WHO AM I?</span>
                    <span aria-hidden="true"> </span>
                    <span>MULTI DISCIPLINARY VISUAL CREATOR</span>
                  </div>
                  <h1
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
                    style={{ textWrap: 'balance' }}
                  >
                    Yashwanth Chelluboina
                  </h1>
                  <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                    I bridge structured <span className="text-white font-medium">AI prompt engineering</span>,
                    narrative <span className="text-white font-medium">video editing</span>, high-frequency{' '}
                    <span className="text-white font-medium">photo retouching</span>, and bold{' '}
                    <span className="text-white font-medium">graphic design</span>. From concept architecture
                    to final color grade, I turn raw ideas into cohesive, cinema-grade visual stories.
                  </p>

                  <div className="space-y-3 pt-1">
                    <p className="font-mono text-xs text-zinc-400">
                      SELECT A CORE DISCIPLINE TO INSPECT WORKFLOW
                    </p>
                    <div
                      role="tablist"
                      aria-label="Professional Roles"
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                    >
                      {ROLE_SKILLS.map((skill) => {
                        const isSelected = skill.id === activeSkill.id;
                        return (
                          <button
                            key={skill.id}
                            role="tab"
                            aria-selected={isSelected}
                            type="button"
                            onClick={() => setActiveSkillId(skill.id)}
                            onMouseEnter={() => setActiveSkillId(skill.id)}
                            className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                              isSelected
                                ? 'bg-violet-950/45 border-violet-500/70 text-white shadow-lg shadow-violet-950/30 -translate-y-0.5'
                                : 'bg-[#0c0c14] border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            <span className="block font-mono text-[10px] text-violet-300">
                              {skill.shortCode}
                            </span>
                            <span className="mt-1 block font-display text-xs sm:text-sm font-semibold whitespace-nowrap truncate">
                              {skill.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div
                      role="tabpanel"
                      className="p-4 sm:p-5 rounded-xl bg-[#0c0c15] border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="font-display text-sm sm:text-base font-semibold text-violet-200">
                          {activeSkill.title}
                        </h2>
                        <span className="font-mono text-xs text-zinc-400">
                          {activeSkill.shortCode}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {activeSkill.summary}
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-400">
                        {activeSkill.highlights.map((item, idx) => (
                          <React.Fragment key={item}>
                            {idx > 0 && <span aria-hidden="true"> </span>}
                            <span>{item}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => scrollToSection('work')}
                      className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      Explore 9 Creative Works
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('showreel')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/8 hover:bg-white/14 border border-white/12 text-sm font-medium text-zinc-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      <Play className="w-4 h-4 text-violet-400" />
                      <span>Watch Showreel</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={heroPortraitRef}
                  className="lg:col-span-5 flex flex-col justify-center"
                >
                  <div 
                    className="group relative w-full h-full min-h-[360px] sm:min-h-[430px] rounded-2xl overflow-hidden bg-[#0b0b14] border border-white/12 shadow-2xl flex flex-col justify-between p-6 sm:p-8"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {hasCustomPortrait ? (
                      <>
                        {portraitImages.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`Yashwanth Chelluboina Portrait ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                              idx === portraitIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        ))}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                        
                        {portraitImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePrevImage}
                              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-violet-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                              type="button"
                              onClick={handleNextImage}
                              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-violet-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </>
                        )}

                        <div className="relative z-10 mt-auto pt-48 pointer-events-none">
                          <p className="font-mono text-xs text-violet-300">
                            CREATIVE DIRECTOR & EDITOR
                          </p>
                          <p className="font-display text-xl font-bold text-white">
                            Yashwanth Chelluboina
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                          <span className="font-mono text-xs text-violet-300">
                            PORTRAIT FRAME // REPLACEABLE ASSET
                          </span>
                          <UserCheck className="w-4 h-4 text-violet-400 shrink-0" />
                        </div>
                        <div className="my-auto py-8 flex flex-col items-center text-center space-y-4">
                          <div className="w-24 h-24 rounded-2xl bg-violet-950/50 border border-violet-500/40 flex items-center justify-center font-display text-3xl font-bold text-violet-200 shadow-inner">
                            YC
                          </div>
                          <div className="space-y-1.5 max-w-sm">
                            <h3 className="font-display text-xl font-bold text-white">
                              Yashwanth Chelluboina
                            </h3>
                            <p className="text-xs font-mono text-zinc-400">
                              AI Prompt Engineer - Video & Photo Editor - Graphic Designer
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                              Place your portrait photo in{' '}
                              <code className="text-violet-300 font-mono">public/assets/</code> and set{' '}
                              <code className="text-violet-300 font-mono">SITE_ASSETS.portraitUrl</code>{' '}
                              inside{' '}
                              <code className="text-violet-300 font-mono">src/data/projects.ts</code>.
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                          <span>BHIMAVARAM, INDIA</span>
                          <span>AVAILABLE FOR COLLABORATION</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="relative z-20 bg-[#050508]">
        <section
          id="education"
          ref={eduSectionRef}
          className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="gsap-reveal max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-violet-400">
                <span>01</span>
                <span aria-hidden="true"> </span>
                <span>ACADEMIC FOUNDATION</span>
              </div>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Education
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Combining formal engineering training in Artificial Intelligence & Data Science
                with hands-on visual production and post-processing workflows.
              </p>
            </div>

            <div className="mt-12 relative pl-8 sm:pl-12">
              <div
                aria-hidden="true"
                className="absolute left-2 sm:left-3 top-2 bottom-2 w-0.5 bg-white/10"
              >
                <div
                  ref={eduProgressLineRef}
                  className="w-full h-full bg-violet-500 origin-top"
                />
              </div>

              {/* Dynamically render multiple education blocks */}
              <div className="space-y-8">
                {EDUCATION_DATA.map((edu) => (
                  <div key={edu.id} className="gsap-reveal relative bg-[#0b0b14] border border-white/12 rounded-2xl p-6 sm:p-10 shadow-xl">
                    <div
                      aria-hidden="true"
                      className="absolute -left-[29px] sm:-left-[41px] top-8 w-4 h-4 rounded-full bg-violet-500 border-4 border-[#050508]"
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-mono text-violet-300">
                          <GraduationCap className="w-4 h-4" />
                          <span>{edu.type}</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                          {edu.degree}
                        </h3>
                        <p className="text-base sm:text-lg text-zinc-300 font-medium">
                          {edu.institution}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="font-mono text-sm sm:text-base font-semibold text-violet-300 tabular-nums">
                          {edu.period}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-mono text-zinc-400">
                      {edu.focusAreas.map((area, idx) => (
                        <React.Fragment key={area}>
                          {idx > 0 && <span aria-hidden="true"> </span>}
                          <span>{area}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="work"
          ref={workSectionRef}
          className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/10 bg-[#07070c]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="gsap-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-violet-400">
                  <span>02</span>
                  <span aria-hidden="true"> </span>
                  <span>WORK EXPERIENCE & CREATIVE PORTFOLIO</span>
                </div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Selected Creative Works
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Nine dedicated project slots organized across Video Editing, Photo Editing,
                  and Graphic Designing. Click any project to inspect full media, pipeline tools,
                  and asset replacement details.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0e0e18] border border-white/10 rounded-xl self-start lg:self-auto">
                {(['All', 'Video Editing', 'Photo Editing', 'Graphic Designing'] as const).map(
                  (cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat === 'All' ? 'All Works (9)' : cat}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project) => {
                const resolvedThumb =
                  project.thumbnailUrl && project.thumbnailUrl.trim().length > 0
                    ? project.thumbnailUrl
                    : getProceduralSceneDataUrl(project.fallbackSceneId, 800, 450);
                
                const isVideo = project.category === 'Video Editing';

                return (
                  <article
                    key={project.id}
                    onClick={() => setActiveProjectModal(project)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveProjectModal(project);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${project.title} (${project.category})`}
                    className="project-card group bg-[#0b0b14] border border-white/10 hover:border-violet-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                  >
                    <div>
                      <div className="relative w-full overflow-hidden bg-[#06060b] flex items-center justify-center">
                        <img
                          src={resolvedThumb}
                          alt={project.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className={`w-full h-auto max-h-[300px] object-contain transition-transform duration-700 ${
                            !isVideo ? 'group-hover:scale-[1.15] cursor-zoom-in' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/75 border border-white/15 flex items-center justify-center text-white group-hover:bg-violet-600 group-hover:border-violet-400 transition-colors">
                          {isVideo ? (
                            <Play className="w-4 h-4 ml-0.5" />
                          ) : project.category === 'Photo Editing' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <Layers className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-mono text-violet-300">
                          <span>SLOT {project.slotNumber}</span>
                          <span aria-hidden="true"> </span>
                          <span>{project.category}</span>
                          <span aria-hidden="true"> </span>
                          <span className="text-zinc-400">{project.aspectRatio}</span>
                        </div>
                        
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-violet-200 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                          {project.shortDescription}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 pb-5 pt-3 border-t border-white/8 flex items-center justify-between gap-2 text-xs font-mono text-zinc-400">
                      <span className="truncate">{project.tools.slice(0, 3).join(' - ')}</span>
                      <span className="text-violet-300 group-hover:translate-x-0.5 transition-transform shrink-0">
                        Inspect &rarr;
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="showreel"
          ref={showreelSectionRef}
          className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="gsap-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-violet-400">
                  <span>03</span>
                  <span aria-hidden="true"> </span>
                  <span>DIRECTOR&apos;S CUT & NLE MASTER</span>
                </div>
                <h2
                  className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Showreel
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  A unified 16:9 presentation of my editing pace, AI-assisted concept generation,
                  color grading, and visual storytelling. Use the player controls below to play,
                  pause, or scrub through the reel.
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                <span>16:9 WIDESCREEN</span>
                <span aria-hidden="true"> </span>
              </div>
            </div>

            <div className="gsap-reveal">
              <PlayableVideo
                isShowreel={true}
                videoUrl={SITE_ASSETS.showreelVideoUrl}
                posterUrl={SITE_ASSETS.showreelPosterUrl}
                fallbackSceneId="landscape"
                title="Yashwanth Edits || Official Portfolio Showreel"
                subtitle="SHOWREEL - AI PROMPTING - VIDEO & PHOTO EDITING - DESIGN"
              />
            </div>
          </div>
        </section>

        <section
          id="contact"
          ref={contactSectionRef}
          className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/10 bg-[#07070c]"
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="gsap-reveal max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-violet-400">
                <span>04</span>
                <span aria-hidden="true"> </span>
                <span>DIRECT COLLABORATION</span>
              </div>
              <h2
                className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Let&apos;s Talk
              </h2>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                Available for freelance and collaborative projects across video editing,
                AI video generation & structured prompting, photo retouching, and graphic design.
                Reach out directly through your preferred channel below.
              </p>
            </div>

            <div className="gsap-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="group p-6 rounded-2xl bg-[#0c0c16] border border-white/10 hover:border-violet-500/60 transition-all duration-200 flex flex-col justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-mono text-xs text-zinc-400">EMAIL DIRECT</p>
                  <p className="mt-1 font-display text-sm sm:text-base font-semibold text-white break-all">
                    {CONTACT_INFO.email}
                  </p>
                </div>
              </a>

              <a
                href={CONTACT_INFO.phoneHref}
                className="group p-6 rounded-2xl bg-[#0c0c16] border border-white/10 hover:border-violet-500/60 transition-all duration-200 flex flex-col justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-mono text-xs text-zinc-400">PHONE / WHATSAPP</p>
                  <p className="mt-1 font-display text-base font-semibold text-white tabular-nums">
                    {CONTACT_INFO.phoneDisplay}
                  </p>
                </div>
              </a>

              <a
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl bg-[#0c0c16] border border-white/10 hover:border-violet-500/60 transition-all duration-200 flex flex-col justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-mono text-xs text-zinc-400">INSTAGRAM</p>
                  <p className="mt-1 font-display text-base font-semibold text-white">
                    {CONTACT_INFO.instagramHandle}
                  </p>
                </div>
              </a>

              <a
                href={CONTACT_INFO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl bg-[#0c0c16] border border-white/10 hover:border-violet-500/60 transition-all duration-200 flex flex-col justify-between gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-mono text-xs text-zinc-400">GITHUB</p>
                  <p className="mt-1 font-display text-base font-semibold text-white">
                    {CONTACT_INFO.githubHandle}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <footer className="py-8 px-5 sm:px-8 lg:px-12 border-t border-white/10 bg-[#050508] text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display text-zinc-400">
              © {new Date().getFullYear()} Yashwanth Edits - Yashwanth Chelluboina
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => scrollToSection('top-studio')}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Replay 3D MacBook Intro
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('work')}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Projects
              </button>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="hover:text-zinc-300 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>

      <ProjectModal
        project={activeProjectModal}
        onClose={() => setActiveProjectModal(null)}
      />
    </div>
  );
}