'use client';

import { getCryptoRandom } from './random';

// Web Audio API context singleton
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 纸张摩擦音效 (Card sliding/drawing)
export const playCardSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.15; // 0.15 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate white noise with CSPRNG
  for (let i = 0; i < bufferSize; i++) {
    data[i] = getCryptoRandom() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  // Filter to make it sound like paper
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  
  // Envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start();
};

// 铜钱碰撞音效 (Coin tossing)
export const playCoinSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const playChink = (freq: number, delay: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.9, ctx.currentTime + delay + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.3);
  };

  // Play a few overlapping metallic pings
  playChink(2500, 0);
  playChink(3200, 0.05);
  playChink(4100, 0.1);
};

// 神圣共鸣低频音效 (Sacred frequency gong/chime)
export const playMysticChime = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz sacred frequency
  osc.frequency.exponentialRampToValueAtTime(216, ctx.currentTime + 1.8);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.8);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.8);
};

// 跨设备触觉振动指引 (Haptic vibration)
export const triggerHapticVibration = (pattern: number | number[] = [15, 40, 15]) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch(e) {
      // Ignore vibration constraints
    }
  }
};
