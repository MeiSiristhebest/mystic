import React, { useState } from 'react';
import { useCollectiveMirror } from '@/hooks/useCollectiveMirror';
import { CollectiveMirrorRitual } from './CollectiveMirrorRitual';
import { CollectiveMirrorKaleidoscope } from './CollectiveMirrorKaleidoscope';
import { TarotReadingResult } from './TarotReadingResult';
import { CrystalBallLoader } from './CrystalBallLoader';

export default function CollectiveMirrorApp() {
  const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input');
  
  const { reflectCollectiveState, isReflecting, messages, soulMotto, resetReflection } = useCollectiveMirror();

  const handleInputSubmit = () => {
    setStep('ritual');
  };

  const handleFocusComplete = () => {
    setStep('result');
    reflectCollectiveState();
  };

  const onReset = () => {
    resetReflection();
    setStep('input');
  };

  return (
    <div className="min-h-[80vh] py-12">
      {step === 'input' && (
        <CollectiveMirrorRitual 
          onStart={handleInputSubmit}
          isReflecting={isReflecting}
        />
      )}
      
      {step === 'ritual' && (
        <CollectiveMirrorKaleidoscope onFocusComplete={handleFocusComplete} />
      )}

      {step === 'result' && (
        <div className="space-y-8">
          {isReflecting && messages.length === 0 ? (
            <CrystalBallLoader text="正在提取全球情绪共振..." />
          ) : (
            <TarotReadingResult 
              messages={messages}
              isReading={isReflecting}
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
