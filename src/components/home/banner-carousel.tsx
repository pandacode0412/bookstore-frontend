'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Banner } from '@/lib/types';

export function HomeHeroCarousel({ slides }: { slides: Banner[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplayCycle, setAutoplayCycle] = useState(0);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, autoplayCycle]);
  const moveTo = (update: (current: number) => number) => {
    setActive(update);
    setAutoplayCycle(cycle => cycle + 1);
  };
  const previous = () => moveTo(current => (current - 1 + slides.length) % slides.length);
  const next = () => moveTo(current => (current + 1) % slides.length);
  const resumeWhenFocusLeaves = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
  };
  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined || Math.abs(start - end) < 42) return;
    if (start > end) next(); else previous();
  };

  return <section className="home-hero-carousel" aria-roledescription="carousel" aria-label="Khuyến mãi sách nổi bật" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlur={resumeWhenFocusLeaves} onTouchStart={event => { touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={onTouchEnd}>
    <div className="home-hero-slides">
      {slides.map((slide, index) => <Link key={slide.id} href={slide.href} className={`home-hero-slide${index === active ? ' is-active' : ''}`} aria-hidden={index !== active} tabIndex={index === active ? undefined : -1}>
        <Image src={slide.imageUrl} alt={slide.altText} fill priority={index === 0} loading={index === 0 ? undefined : 'lazy'} sizes="100vw" style={{ objectPosition: slide.objectPosition }} />
      </Link>)}
    </div>
    <button type="button" className="hero-carousel-arrow hero-carousel-previous" onClick={previous} aria-label="Banner trước" title="Banner trước">←</button>
    <button type="button" className="hero-carousel-arrow hero-carousel-next" onClick={next} aria-label="Banner tiếp theo" title="Banner tiếp theo">→</button>
    <div className="hero-carousel-dots" aria-label="Chọn banner">{slides.map((slide, index) => <button key={slide.id} type="button" aria-pressed={index === active} aria-label={`Banner ${index + 1}: ${slide.title}`} className={index === active ? 'is-active' : ''} onClick={() => moveTo(() => index)} />)}</div>
    <button type="button" className="sr-only" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Phát tự động chuyển banner' : 'Dừng tự động chuyển banner'}</button>
  </section>;
}
