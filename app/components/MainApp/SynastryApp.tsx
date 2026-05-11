import React, { useState } from 'react';
import { useSynastryAnalysis, PartnerData } from '@/hooks/useSynastryAnalysis';
import { SynastryForm } from './SynastryForm';
import { SynastryRitual } from './SynastryRitual';
import { TarotReadingResult } from './TarotReadingResult';
import { CrystalBallLoader } from './CrystalBallLoader';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function SynastryApp() {
  const [partner, setPartner] = useState<PartnerData>({ name: '', birthday: '', zodiac: '', description: '' });
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input');
  
  const { userProfile } = useUserProfile();
  const { runAnalysis, isAnalyzing, messages, soulMotto, resetAnalysis } = useSynastryAnalysis();

  const handleFormSubmit = () => {
    if (!partner.name) return;
    setStep('ritual');
  };

  const handleMergeComplete = () => {
    setStep('result');
    runAnalysis(partner, question);
  };

  const onReset = () => {
    resetAnalysis();
    setStep('input');
    setPartner({ name: '', birthday: '', zodiac: '', description: '' });
    setQuestion("");
  };

  return (
    <div className="min-h-[80vh] py-12">
      {step === 'input' && (
        <SynastryForm 
          partner={partner}
          setPartner={setPartner}
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleFormSubmit}
          isAnalyzing={isAnalyzing}
          userName={userProfile?.name || "我"}
        />
      )}
      
      {step === 'ritual' && (
        <SynastryRitual
          userName={userProfile?.name || "我"}
          partnerName={partner.name}
          onMergeComplete={handleMergeComplete}
        />
      )}

      {step === 'result' && (
        <div className="space-y-8">
          {isAnalyzing && messages.length === 0 ? (
            <CrystalBallLoader text="正在合成灵魂共振频率..." />
          ) : (
            <TarotReadingResult 
              messages={messages}
              isReading={isAnalyzing}
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
