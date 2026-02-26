// src/hooks/use-mobile.tsx

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const setIsMobileStore = useUIStore((state) => state.setIsMobile);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setIsMobileStore(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobileStore]);

  return isMobile;
}