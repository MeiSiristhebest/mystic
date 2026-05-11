"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, Users, Globe, Zap, MessageSquare, Heart, Shield, Download } from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import BreathingLoading from "./BreathingLoading";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAIStream } from "@/hooks/useAIStream";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { AKASHA_PERSONA } from "@/lib/ai";

export default function CollectiveMirrorApp({ onReadingChange }: { onReadingChange?: (reading: boolean) => void }) {
  const [question, setQuestion] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [showRitual, setShowRitual] = useState(false);
  const [ritualStep, setRitualStep] = useState(0);

  const posterRef = useRef<HTMLDivElement>(null);

  const { addEntry, updateEntry } = useJourney();
  const { profile, getProfileContext } = useUserProfile();
  const { stream, isLoading: isStreaming, error: streamError, abort } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  useEffect(() => {
    if (onReadingChange) {
      onReadingChange(isStreaming || isAskingFollowUp);
    }
  }, [isStreaming, isAskingFollowUp, onReadingChange]);

  const startRitual = () => {
    if (!question.trim()) return;
    setShowRitual(true);
    setRitualStep(1);
    
    // Simulate ritual steps
    setTimeout(() => setRitualStep(2), 2000);
    setTimeout(() => setRitualStep(3), 4000);
    setTimeout(() => {
      setShowRitual(false);
      handleGenerate();
    }, 6000);
  };

  const handleGenerate = async () => {
    const profileContext = getProfileContext();
    const sanitizedQuestion = question.replace(/["'{}[\]]/g, "").substring(0, 200);

    const prompt = `
<instruction>
你现在正连接着“集体无意识之镜（Collective Mirror）”。请根据用户的问题，从人类共有的原型、当下的全球集体意识能量以及深层社会心理学的角度，进行一次宏大、深刻、具有启示性的解读。
请不要局限于个人层面的琐事，而要将其与更广阔的生命律动、时代精神和集体共鸣联系起来。</instruction>

<divination_context>
  <method>集体镜像感应（Collective Resonance）</method>
  <timestamp>${new Date().toISOString()}</timestamp>
</divination_context>

<user_profile>
  ${profileContext}
</user_profile>

<user_question>
  ${sanitizedQuestion}
</user_question>

<output_format>
请使用Markdown排版，必须且只能包含以下三个章节：
## 🌐 集体共鸣场域
（描述当下的集体潜意识能量状态，以及它是如何与用户的问题产生宏观共振的）

## 🔍 原型之镜解析
（从荣格的原型理论或人类共同的神话逻辑出发，深度剖析该问题在人类集体灵魂中的深层映像）

## 🌟 觉醒与同步指引
（给出如何超越个体局限，与更高层次的集体智慧同步的具体指引和心态调整）
</output_format>
    `;

    try {
      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);
      
      const systemInstruction = `${AKASHA_PERSONA}\n你现在是“集体无意识之镜”的引路人。你的语言应当宏大、深邃、充满慈悲与洞见。`;
      
      for await (const chunk of stream(prompt, systemInstruction)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }

      const id = await addEntry({
        type: "collective_mirror",
        title: `集体镜像：${sanitizedQuestion}`,
        summary: fullResponse.substring(0, 100) + "...",
        details: { 
          type: 'collective_mirror',
          text: fullResponse, 
          question: sanitizedQuestion, 
          messages: [{ role: 'model', content: fullResponse }] 
        },
      });
      setCurrentEntryId(id || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isStreaming || !currentEntryId) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setIsAskingFollowUp(true);

    const newMessages = [...messages, { role: 'user', content: userMsg } as const];
    setMessages([...newMessages, { role: 'model', content: "" }]);

    try {
      let fullResponse = "";
      const systemInstruction = `${AKASHA_PERSONA}\n你现在是“集体无意识之镜”的引路人。你的语言应当宏大、深邃、充满慈悲与洞见。`;
      
      for await (const chunk of stream(userMsg, systemInstruction)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs = [...newMessages, { role: 'model', content: fullResponse } as const];
      updateEntry(currentEntryId, { 
        details: { 
          type: 'collective_mirror',
          text: finalMsgs.map(m => m.role === 'user' ? `**问**：${m.content}` : `**阿卡夏**：${m.content}`).join('\n\n---\n\n'), 
          question, 
          messages: finalMsgs 
        }
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const ritualSteps = [
    { text: "正在闭目感应...", icon: Users },
    { text: "正在触碰集体潜意识脉动...", icon: Globe },
    { text: "镜像已开启，万物皆有共鸣...", icon: Zap }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence>
        {showRitual && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center space-y-8 text-center max-w-md px-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative"
              >
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
                {ritualSteps[ritualStep - 1]?.icon && (
                  <div className="relative">
                    {React.createElement(ritualSteps[ritualStep - 1].icon, { className: "w-10 h-10 text-emerald-400" })}
                  </div>
                )}
              </motion.div>
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-emerald-100 tracking-widest">
                  {ritualSteps[ritualStep - 1]?.text}
                </h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= ritualStep ? 'bg-emerald-500' : 'bg-emerald-900/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && !isStreaming ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center text-center space-y-12"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full" />
            <Globe className="w-20 h-20 text-emerald-500 relative" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-emerald-100 tracking-widest">集体无意识之镜</h2>
            <p className="text-emerald-200/60 max-w-2xl mx-auto leading-relaxed">
              在这个场域中，个人的困惑被置于全人类的命运坐标系。
              请写下你内心深处的共鸣或疑惑，阿卡夏将为你揭示集体潜意识中的镜像。
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-8">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：我为什么总是感到一种莫名的群体疏离感？或者 这个时代的变革对我们灵魂的意义是什么？"
              className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl p-6 text-emerald-100 placeholder-emerald-900/40 focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent transition-all h-32 resize-none"
            />
            
            <button
              onClick={startRitual}
              disabled={!question.trim()}
              className="px-12 py-4 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-emerald-100 rounded-full font-serif text-lg tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              开启镜像感应 <Sparkles className="inline-block ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl space-y-8"
          >
            <div 
              ref={posterRef}
              className="w-full glass-panel p-8 md:p-12 rounded-3xl space-y-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe className="w-64 h-64 text-emerald-500" />
              </div>

              {isStreaming && messages.length === 0 ? (
                <div className="py-20">
                  <BreathingLoading text="正在采集集体无意识波段..." />
                </div>
              ) : (
                <div className="space-y-12 relative z-10">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'}`}>
                      <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-8 ${
                        msg.role === 'user' 
                          ? 'bg-emerald-900/30 border border-emerald-500/20 text-emerald-100' 
                          : 'bg-black/20 markdown-body w-full'
                      }`}>
                        {msg.role === 'model' ? (
                          <MysticMarkdown content={msg.content} />
                        ) : (
                          <p className="text-xl font-serif">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Poster Footer */}
              <div className="hidden show-in-poster pt-12 border-t border-emerald-500/20 text-center">
                <p className="text-emerald-500/40 text-xs font-mono tracking-widest uppercase">
                  Collective Mirror Insights · Akasha Window · {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {!isStreaming && (
              <div className="flex flex-col gap-6 hide-in-poster">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="继续与集体智慧对话..."
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-full py-5 pl-8 pr-20 text-emerald-100 placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-serif text-lg"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAskingFollowUp}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </form>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { setMessages([]); setQuestion(""); setCurrentEntryId(null); abort(); }}
                    className="px-8 py-3 border border-emerald-500/20 text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full font-serif transition-all"
                  >
                    合上镜像
                  </button>
                  <button
                    onClick={() => handleGeneratePoster(posterRef.current, 'collective-mirror.jpg')}
                    disabled={isGeneratingPoster}
                    className="px-8 py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-200 rounded-full font-serif hover:bg-emerald-600/40 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download size={18} />
                    保存镜像海报
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
