import React, { useState } from 'react';
import { useSubconsciousAnalysis } from '@/hooks/useSubconsciousAnalysis';
import { SubconsciousRitual } from './SubconsciousRitual';
import { SubconsciousConstellation } from './SubconsciousConstellation';
import { TarotReadingResult } from './TarotReadingResult';
import { CrystalBallLoader } from './CrystalBallLoader';

export default function SubconsciousApp() {
  const [content, setContent] = useState("");
  const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input');
  
  const { analyzeSubconscious, isParsing, messages, soulMotto, resetAnalysis } = useSubconsciousAnalysis();

  const handleInputSubmit = () => {
    if (!content.trim()) return;
    setStep('ritual');
  };

  const handleDecodeComplete = () => {
    setStep('result');
    analyzeSubconscious(content);
  };

  const onReset = () => {
    resetAnalysis();
    setStep('input');
    setContent("");
  };

  return (
    <div className="min-h-[80vh] py-12">
      {step === 'input' && (
        <SubconsciousRitual 
          step="input"
          content={content}
          setContent={setContent}
          onStart={handleInputSubmit}
          isParsing={isParsing}
        />
      )}
      
      {step === 'ritual' && (
        <SubconsciousConstellation onDecodeComplete={handleDecodeComplete} />
      )}

      {step === 'result' && (
        <div className="space-y-8">
          {isParsing && messages.length === 0 ? (
            <CrystalBallLoader text="正在穿越梦境边界..." />
          ) : (
            <TarotReadingResult 
              messages={messages}
              isReading={isParsing}
              soulMotto={soulMotto}
              isAskingFollowUp={false}
              followUpText=""
              setFollowUpText={() => {}}
              onFollowUp={() => {}}
              onReset={onReset}
              onShare={() => {}}
              isSocraticMode={false}
              setIsSocraticMode={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
