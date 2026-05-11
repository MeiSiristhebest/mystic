import React, { useState } from 'react';
import { useShadowWork } from '@/hooks/useShadowWork';
import { ShadowWorkRitual } from './ShadowWorkRitual';
import { ShadowWorkMirror } from './ShadowWorkMirror';
import { TarotReadingResult } from './TarotReadingResult';
import { CrystalBallLoader } from './CrystalBallLoader';

export default function ShadowWorkApp() {
  const [issue, setIssue] = useState("");
  const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input');
  
  const { startShadowExploration, isExploring, messages, soulMotto, resetExploration } = useShadowWork();

  const handleInputSubmit = () => {
    if (!issue.trim()) return;
    setStep('ritual');
  };

  const handleShatterComplete = () => {
    setStep('result');
    startShadowExploration(issue);
  };

  const onReset = () => {
    resetExploration();
    setStep('input');
    setIssue("");
  };

  return (
    <div className="min-h-[80vh] py-12">
      {step === 'input' && (
        <ShadowWorkRitual 
          step="input"
          issue={issue}
          setIssue={setIssue}
          onStart={handleInputSubmit}
          isExploring={isExploring}
        />
      )}
      
      {step === 'ritual' && (
        <ShadowWorkMirror onShatterComplete={handleShatterComplete} />
      )}

      {step === 'result' && (
        <div className="space-y-8">
          {isExploring && messages.length === 0 ? (
            <CrystalBallLoader text="正在下潜至潜意识深处..." />
          ) : (
            <TarotReadingResult 
              messages={messages}
              isReading={isExploring}
              soulMotto={soulMotto}
              isAskingFollowUp={false}
              followUpText=""
              setFollowUpText={() => {}}
              onFollowUp={() => {}}
              onReset={onReset}
              onShare={() => {}}
              isSocraticMode={true}
              setIsSocraticMode={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
