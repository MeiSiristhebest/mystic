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

  switch (details.type) {
    case 'tarot': {
      const tarot = details as TarotDetails;
      return (
        <div className="space-y-8">
          <MysticMarkdown content={tarot.text} cards={tarot.cards} />
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
          <MysticMarkdown content={iching.text} />
        </div>
      );
    }
    case 'bazi': {
      const bazi = details as BaziDetails;
      // In historical records, we might not have the full bazi string in the details object 
      // but in some older records it might be missing. 
      // This refactor assumes the standardized schema.
      return (
        <div className="space-y-8">
          <MysticMarkdown content={bazi.text} />
        </div>
      );
    }
    default:
      return <MysticMarkdown content={details.text || entry.summary} />;
  }
}
