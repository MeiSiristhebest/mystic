'use client';

import React from 'react';
import MysticMarkdown from '../../MysticMarkdown';
import { HexagramDisplay } from '../IChing/HexagramDisplay';
import { BaziChart } from '../Bazi/BaziChart';
import { JourneyEntry, TarotDetails, BaziDetails, IChingDetails } from '@/app/types/divination';

interface EntryDetailRendererProps {
  entry: JourneyEntry;
}

export default function EntryDetailRenderer({ entry }: EntryDetailRendererProps) {
  const details = entry.details;
  if (!details) return <MysticMarkdown content={entry.summary} />;

  // Extract pure initial reading from the first model message or fallback to details.text
  const modelMsg = details.messages && Array.isArray(details.messages) ? details.messages.find((m: any) => m.role === 'model') : null;
  let initialText = modelMsg?.content || details.text || entry.summary || "";

  // If initialText contains legacy concatenated follow-ups, strip everything after the first question mark / separator
  if (initialText.includes('**问**：')) {
    initialText = initialText.split('**问**：')[0].trim();
  }
  if (initialText.includes('\n\n---\n\n')) {
    initialText = initialText.split('\n\n---\n\n')[0].trim();
  }

  switch (details.type) {
    case 'tarot': {
      const tarot = details as TarotDetails;
      return (
        <div className="space-y-8">
          <MysticMarkdown content={initialText} cards={tarot.cards} />
        </div>
      );
    }
    case 'iching': {
      const iching = details as IChingDetails;
      return (
        <div className="space-y-8">
          {iching.data?.hexagrams && iching.data.hexagrams.length === 6 && (
            <HexagramDisplay lines={iching.data.hexagrams} />
          )}
          <MysticMarkdown content={initialText} />
        </div>
      );
    }
    case 'bazi': {
      return (
        <div className="space-y-8">
          <MysticMarkdown content={initialText} />
        </div>
      );
    }
    default:
      return <MysticMarkdown content={initialText} />;
  }
}
