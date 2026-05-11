import React, { useState } from 'react';
import { useTimeWisdom } from '@/hooks/useTimeWisdom';
import { TimeWisdomRitual } from './TimeWisdomRitual';
import { TimeWisdomAstrolabe } from './TimeWisdomAstrolabe';
import { TarotReadingResult } from './TarotReadingResult';
import { CrystalBallLoader } from './CrystalBallLoader';

export default function TimeWisdomApp() {
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input');
  
  const { observeTimeStream, isObserving, messages, soulMotto, resetObservation } = useTimeWisdom();

  const handleInputSubmit = () => {
    setStep('ritual');
  };

  const handleLockComplete = () => {
    setStep('result');
    observeTimeStream(question);
  };

  const onReset = () => {
    resetObservation();
    setStep('input');
    setQuestion("");
  };

  return (
    <div className="min-h-[80vh] py-12">
      {step === 'input' && (
        <TimeWisdomRitual 
          step="input"
          question={question}
          setQuestion={setQuestion}
          onStart={handleInputSubmit}
          isObserving={isObserving}
        />
      )}
      
      {step === 'ritual' && (
        <TimeWisdomAstrolabe onLockComplete={handleLockComplete} />
      )}

      {step === 'result' && (
        <div className="space-y-8">
          {isObserving && messages.length === 0 ? (
            <CrystalBallLoader text="正在检索全球时间流..." />
          ) : (
            <TarotReadingResult 
              messages={messages}
              isReading={isObserving}
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
