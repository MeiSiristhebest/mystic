'use client';

import { getCryptoRandom } from './random';

// Global Sound Switch with localStorage persistence
const STORAGE_KEY = 'mystic_sound_enabled';

let soundEnabledState: boolean = true;
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  // Default to true, or user explicit preference
  soundEnabledState = saved !== null ? saved === 'true' : true;
}

export const isSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return soundEnabledState;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabledState = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('mystic-sound-change', { detail: { enabled } }));
  }
};

export const toggleSound = (): boolean => {
  const next = !soundEnabledState;
  setSoundEnabled(next);
  return next;
};

// Web Audio API context singleton
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !soundEnabledState) return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (_) {
    return null;
  }
};

/**
 * 1. 丝绒羊皮纸轻拂音效 (Velvet Paper Whisper)
 * 采用极低音量粉红噪声与平滑高斯带通，宛如指尖拂过古典羊皮纸，丝滑不突兀
 */
export const playCardSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink noise generation for organic softness
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = getCryptoRandom() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.value = 1.0;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch (_) {}
};

/**
 * 2. 真实青铜古币金石沉鸣 (Bronze Coin Harmonics)
 * 纯正青铜物理谐波建模，沉稳、清亮且带阻尼，绝无粗糙电子哔哔声
 */
export const playCoinSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Overlapping bronze harmonics (Root, Third, Fifth overtones)
    const harmonics = [
      { freq: 880, gain: 0.12, dur: 0.45, decay: 0.35 },
      { freq: 1760, gain: 0.06, dur: 0.3, decay: 0.2 },
      { freq: 3520, gain: 0.02, dur: 0.15, decay: 0.1 },
    ];

    harmonics.forEach(({ freq, gain, dur, decay }, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sine';
      const startTime = ctx.currentTime + (idx * 0.03);
      
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startTime + dur);
      
      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.linearRampToValueAtTime(gain, startTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
      
      osc.connect(g);
      g.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  } catch (_) {}
};

/**
 * 3. 喜马拉雅颂钵与索尔费吉奥神圣共鸣 (Tibetan Singing Bowl 528Hz & 432Hz)
 * 空灵悠远、长尾泛音衰减，极具神秘学治愈感
 */
export const playMysticChime = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const frequencies = [432, 528, 864]; // Sacred triad
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 3.0);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15 / (i + 1), ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3.2);
    });
  } catch (_) {}
};

/**
 * 4. 触觉振动 (跨设备柔和振动)
 */
export const triggerHapticVibration = (pattern: number | number[] = [12, 30, 12]) => {
  if (!isSoundEnabled()) return;
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }
};
