"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

const MotionImage = motion.create(Image);
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/storage";
import { generateMysticImage } from "@/app/actions/aiActions";

// Helper to create a unique ID for a prompt + date
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Fallback images for different prompt types to save quota and prevent "crashes"
const getFallbackImageUrl = (prompt: string, aspectRatio: string) => {
  const seed = hashString(prompt);
  const [w, h] = aspectRatio === "21:9" ? [2100, 900] :
               aspectRatio === "16:9" ? [1920, 1080] : 
               aspectRatio === "9:16" ? [1080, 1920] :
               aspectRatio === "4:3" ? [1200, 900] :
               aspectRatio === "3:4" ? [900, 1200] : [1024, 1024];
  
  // Curated high-quality cosmic Unsplash image IDs
  const cosmicUnsplashIds = [
    "photo-1464802686167-b939a6910659", // Stars/Nebula
    "photo-1462331940025-496dfbfc7564", // Deep Nebula
    "photo-1506318137071-a8e063b4bcc0", // Dark Galaxy
    "photo-1534796636912-3b95b3ab5986", // Vibrant Galaxy
    "photo-1502134249126-9f3755a50d78", // Purple Nebula
    "photo-1419242902214-272b3f66ee7a", // Milky Way
    "photo-1516339901600-2e1a62dc0c45", // Blue Stars
    "photo-1475274047050-1d0c0975c63e", // Night Sky/Stars
  ];
  
  const selectedId = cosmicUnsplashIds[parseInt(seed, 36) % cosmicUnsplashIds.length];
  
  return `https://images.unsplash.com/${selectedId}?auto=format&fit=crop&q=80&w=${w}&h=${h}`;
};

// Compress image to ensure it fits in Firestore's 1MB limit
const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(base64Str);
      return;
    }
    
    const timeout = setTimeout(() => {
      resolve(base64Str);
    }, 5000);

    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(base64Str);
    };
  });
};

export const MysticImage = ({ 
  prompt, 
  className = "", 
  aspectRatio = "1:1",
  seed = "mystic"
}: { 
  prompt: string; 
  className?: string; 
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  seed?: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const loadingRef = useRef(false);
  const currentRequestRef = useRef<string | null>(null);

  const generateImage = useCallback(async (force = false) => {
    const requestKey = `${prompt}_${aspectRatio}_${seed}`;
    if (!force && (loadingRef.current || (imageUrl && currentRequestRef.current === requestKey))) return;
    
    loadingRef.current = true;
    currentRequestRef.current = requestKey;
    setIsLoading(true);
    setError(null);
    setIsFallback(false);
    
    const globalTimeout = setTimeout(() => {
      if (loadingRef.current && currentRequestRef.current === requestKey) {
        setImageUrl(getFallbackImageUrl(prompt, aspectRatio));
        setIsFallback(true);
        setIsLoading(false);
        loadingRef.current = false;
      }
    }, 15000);

    try {
      // Use a strict YYYY-MM-DD format regardless of locale
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      const promptHash = hashString(prompt + aspectRatio);
      const docId = `${localDateStr}_${promptHash}`;
      
      const localCache = await getFromIndexedDB(`mystic_img_${docId}`);
      if (localCache) {
        clearTimeout(globalTimeout);
        setImageUrl(localCache as string);
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      // Generate securely using Server Action (which also checks/saves to Firestore server-side)
      const base64Data = await generateMysticImage(prompt, aspectRatio, docId);

      try {
        let dataToCache = base64Data;
        if (base64Data.length > 800000) {
          dataToCache = await compressImage(base64Data, 1280, 0.6);
        }
        await saveToIndexedDB(`mystic_img_${docId}`, dataToCache);
      } catch (cacheErr) {
        // Silently fail cache saving
      }
      
      clearTimeout(globalTimeout);
      setImageUrl(base64Data);
    } catch (err: any) {
      clearTimeout(globalTimeout);
      setImageUrl(getFallbackImageUrl(prompt, aspectRatio));
      setIsFallback(true);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [prompt, aspectRatio, seed, imageUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateImage();
  }, [generateImage]);

  return (
    <div className={`relative overflow-hidden bg-[#080510] border border-white/5 ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 via-transparent to-[#9B7FD4]/5 pointer-events-none" />
      
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080510]/80 z-20">
          <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
          <span className="text-[10px] font-serif tracking-[0.2em] text-[#C9A84C]/60 uppercase">正在编织星图...</span>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center z-20">
          <p className="text-xs text-[#E8DFB8]/40 font-serif italic">{error}</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              generateImage(true);
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative z-50"
          >
            <RefreshCw className="w-4 h-4 text-[#C9A84C]" />
          </button>
        </div>
      ) : imageUrl ? (
        <div className="relative w-full h-full bg-[#080510]">
          {/* Base Gradient Fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1033] via-[#080510] to-[#101a33]" />
          
          <MotionImage
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={imageUrl}
            alt={prompt}
            fill
            unoptimized={imageUrl.startsWith('data:')}
            className={`object-cover relative z-10 ${isFallback ? 'brightness-75 opacity-80' : ''}`}
            referrerPolicy="no-referrer"
          />
          {isFallback && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-40 z-20">
              <Sparkles className="w-3 h-3 text-[#C9A84C]" />
              <span className="text-[8px] font-serif text-[#C9A84C] uppercase tracking-tighter">Celestial Echo</span>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1033] via-[#080510] to-[#101a33]" />
      )}
      
      {/* Brand Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,5,16,0.4)_70%,rgba(8,5,16,0.8)_100%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform", transform: "translateZ(0)" }}
            className="w-[120%] h-[120%] border border-[#C9A84C]/20 rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform", transform: "translateZ(0)" }}
            className="absolute w-[110%] h-[110%] border border-[#9B7FD4]/10 rounded-full"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none md:bg-[url('/noise.svg')]" />
      </div>
    </div>
  );
};
