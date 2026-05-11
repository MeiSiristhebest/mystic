import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050308] flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-serif gold-gradient-text mb-4">404</h1>
      <p className="text-[#E8DFB8]/60 mb-8 font-serif italic">迷失在虚空中... 这个时空节点尚未开启。</p>
      <Link 
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-amber-600/20 border border-amber-500/50 text-amber-300 rounded-full hover:bg-amber-600/40 transition-all"
      >
        <Home size={18} />
        返回中心
      </Link>
    </div>
  );
}
