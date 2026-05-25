import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'slide-up' | 'scale-in';
}

export function ScrollRevealSection({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'fade-up'
}: ScrollRevealSectionProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up':
        return isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8';
      case 'fade-in':
        return isVisible ? 'animate-fade-in' : 'opacity-0';
      case 'slide-up':
        return isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-12';
      case 'scale-in':
        return isVisible ? 'animate-scale-in' : 'opacity-0 scale-95';
      default:
        return isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}