'use client';

import React from 'react';

export interface HandoffData {
  system: 'eastern' | 'western' | 'psychology' | 'ritual';
  modeId?: string;
  question?: string;
  context?: any;
}

export function OmniOracleGuide() {
  return (
    <div className="omni-oracle-guide p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
      <h3 className="text-lg font-serif text-amber-200 mb-2">全维占星引导</h3>
      <p className="text-sm text-amber-100/40 leading-relaxed">
        欢迎使用 Omni Oracle。系统已整合东西方神秘学智慧，根据你的灵魂档案提供最契合的推演路径。
      </p>
    </div>
  );
}
