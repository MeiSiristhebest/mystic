import React, { useState, useEffect } from 'react';
import { useIChingRitual } from '@/hooks/useIChingRitual';
import { IChingRitualManager } from './IChingRitualManager';
import { TarotReadingResult } from './TarotReadingResult'; // Reuse reading layout

export default function IChingApp() {
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState<'input' | 'tossing' | 'result'>('input');
  
  const {
    lines,
    isTossing,
    currentToss,
    tossCoins,
    generateIChingReading,
    isReading,
    messages,
    soulMotto,
    resetRitual
  } = useIChingRitual();

  const handleStart = () => {
    if (!question.trim()) return;
    setStep('tossing');
  };

  const onReset = () => {
    resetRitual();
    setQuestion("");
    setStep('input');
  };

  // Trigger reading when 6 lines are complete
  useEffect(() => {
    if (lines.length === 6 && step === 'tossing') {
      setStep('result');
      generateIChingReading(question);
    }
  }, [lines.length, step, question, generateIChingReading]);

  return (
    <div className="min-h-[80vh] py-12">
      {step !== 'result' ? (
        <IChingRitualManager
          step={step}
          question={question}
          setQuestion={setQuestion}
          lines={lines}
          isTossing={isTossing}
          currentToss={currentToss}
          tossCoins={tossCoins}
          onStart={handleStart}
        />
      ) : (
        <TarotReadingResult 
          messages={messages}
          isReading={isReading}
          soulMotto={soulMotto}
          isAskingFollowUp={false}
          followUpText=""
          setFollowUpText={() => {}}
          onFollowUp={() => {}}
          onReset={onReset}
          onShare={() => {}} // Poster generation to be added later
          isSocraticMode={false}
          setIsSocraticMode={() => {}}
        />
      )}
    </div>
  );
}
