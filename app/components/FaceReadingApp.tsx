"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Upload, X, Eye, Hand, Camera, Send, Download } from "lucide-react";
import MysticMarkdown from "./MysticMarkdown";
import BreathingLoading from "./BreathingLoading";
import { useJourney } from "@/hooks/useJourney";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePosterGenerator } from "@/hooks/usePosterGenerator";
import { useAIStream } from "@/hooks/useAIStream";
import { FACE_READING_PERSONA } from "@/lib/ai";
import { getFaceReadingPrompt } from "@/lib/prompts";
import Image from "next/image";

export default function FaceReadingApp({
  onReadingChange,
}: {
  onReadingChange?: (reading: boolean) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [type, setType] = useState<"face" | "palm">("face");
  const [question, setQuestion] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addEntry, updateEntry } = useJourney();
  const { profile, getProfileContext } = useUserProfile();
  const { stream, isLoading: isStreaming, error: streamError, abort } = useAIStream();
  const { isGeneratingPoster, handleGeneratePoster } = usePosterGenerator();

  useEffect(() => {
    onReadingChange?.(isStreaming || isAskingFollowUp);
  }, [isStreaming, isAskingFollowUp, onReadingChange]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("图片大小不能超过 4MB");
        return;
      }
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    const base64Data = image.split(",")[1];
    const profileContext = getProfileContext();
    const sanitizedQuestion = question.replace(/["'{}[\]]/g, "").substring(0, 200);

    const prompt = getFaceReadingPrompt({
      type,
      sanitizedQuestion,
      profileContext,
    });

    try {
      let fullResponse = "";
      setMessages([{ role: 'model', content: "" }]);
      
      const systemInstruction = FACE_READING_PERSONA;
      
      const parts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ];

      for await (const chunk of stream(parts, systemInstruction)) {
        fullResponse += chunk;
        setMessages([{ role: 'model', content: fullResponse }]);
      }

      const title = `${type === "face" ? "面相" : "手相"}感应：${sanitizedQuestion || "全局气色端详"}`;
      const id = await addEntry({
        type: type === "face" ? "face_reading" : "palm_reading",
        title: title,
        summary: fullResponse.substring(0, 100) + "...",
        details: {
          type: type === "face" ? "face_reading" : "palm_reading",
          readingType: type,
          imageUrl: image,
          question: sanitizedQuestion,
          text: fullResponse,
          messages: [{ role: 'model', content: fullResponse }],
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
      const systemInstruction = FACE_READING_PERSONA;
      
      const history = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      for await (const chunk of stream(history, systemInstruction)) {
        fullResponse += chunk;
        setMessages([...newMessages, { role: 'model', content: fullResponse }]);
      }
      
      const finalMsgs = [...newMessages, { role: 'model', content: fullResponse } as const];
      
      updateEntry(currentEntryId, { 
        details: { 
          type: type === "face" ? "face_reading" : "palm_reading",
          text: messages[0]?.content || fullResponse, 
          imageType: type, 
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

  const onGeneratePoster = useCallback(() => {
    if (!posterRef.current) return;
    handleGeneratePoster(posterRef.current, `阿卡夏之窗-${type === "face" ? "面相" : "手相"}分析.jpg`);
  }, [handleGeneratePoster, type]);

  return (
    <div className="w-full flex flex-col items-center">
      {messages.length === 0 && !isStreaming ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center shadow-2xl"
        >

          <div className="w-full flex flex-col gap-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">
                  1. 选择相术类型
                </label>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setType("face")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                      type === "face"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                        : "bg-black/40 border-amber-500/10 text-amber-100/60 hover:bg-amber-500/10 hover:text-amber-200"
                    }`}
                  >
                    <span className="font-serif text-lg mb-1 flex items-center gap-2">
                      <Eye size={18} />
                      面相骨相
                    </span>
                    <span className="text-xs text-left opacity-80">
                      通过面部五官、三停十二宫分析先天格局与流年运势。
                    </span>
                  </button>
                  <button
                    onClick={() => setType("palm")}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                      type === "palm"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                        : "bg-black/40 border-amber-500/10 text-amber-100/60 hover:bg-amber-500/10 hover:text-amber-200"
                    }`}
                  >
                    <span className="font-serif text-lg mb-1 flex items-center gap-2">
                      <Hand size={18} />
                      手相掌纹
                    </span>
                    <span className="text-xs text-left opacity-80">
                      通过掌纹走向、掌丘饱满度洞悉性格特质与人生轨迹。
                    </span>
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest">
                  2. 上传照片
                </label>
                <div
                  className="flex-1 border-2 border-dashed border-amber-500/30 rounded-xl bg-black/40 flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-amber-500/60 transition-colors cursor-pointer min-h-[200px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  {image ? (
                    <>
                      <Image
                        src={image}
                        alt="Uploaded"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="relative z-10 bg-black/60 p-3 rounded-full backdrop-blur-sm">
                        <Camera className="w-8 h-8 text-amber-300" />
                      </div>
                      <p className="relative z-10 mt-2 text-sm text-amber-200 font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                        点击更换照片
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-amber-500/50 mb-4 group-hover:text-amber-400 transition-colors" />
                      <p className="text-amber-200/80 font-medium mb-1">
                        点击上传或拍照
                      </p>
                      <p className="text-amber-500/50 text-xs text-center">
                        请确保光线充足，
                        {type === "face" ? "五官无遮挡" : "掌纹清晰可见"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="w-full flex flex-col max-w-2xl mx-auto">
              <label
                htmlFor="question"
                className="block text-sm font-medium text-amber-200/80 mb-3 font-serif uppercase tracking-widest mt-4"
              >
                3. 您的关注点（选填）
              </label>
              <textarea
                id="question"
                rows={3}
                className="w-full bg-black/40 border border-amber-500/30 rounded-xl p-4 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all resize-none"
                placeholder="例如：我想看看最近的事业发展，或者感情状况如何？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {/* Action Area */}
            <div className="w-full flex flex-col items-center mt-4">
              {streamError && (
                <p className="text-red-400 text-sm mb-4 font-serif">{streamError}</p>
              )}
              <button
                onClick={handleAnalyze}
                className="group relative px-10 py-4 w-full md:w-1/2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 rounded-full font-serif text-lg tracking-wider shadow-[0_0_20px_rgba(180,110,20,0.4)] hover:shadow-[0_0_30px_rgba(200,130,30,0.6)] transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={20} className="text-amber-300" />
                  开始相学解读
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-4xl relative"
          >
            <div
              className="w-full glass-panel p-8 md:p-12 rounded-3xl relative pb-8"
              ref={posterRef}
            >
              {/* Poster Header */}
              {!isStreaming && messages.length > 0 && (
                <div className="hidden show-in-poster mb-8 border-b border-amber-500/30 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-serif text-amber-300 mb-2">
                        阿卡夏之窗 · {type === "face" ? "面相骨相" : "手相掌纹"}
                      </h2>
                      <p className="text-amber-200/60 text-sm">
                        {new Date().toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Eye className="w-12 h-12 text-amber-500/20" />
                  </div>
                </div>
              )}

              {isStreaming && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <BreathingLoading />
                  <p className="text-amber-200/80 font-serif italic animate-pulse mt-8">
                    正在端详相理，洞察天机...
                  </p>
                </div>
              ) : streamError ? (
                <div className="text-center text-red-400 py-8 font-serif">{streamError}</div>
              ) : (
                <div
                  className="w-full flex flex-col space-y-8 font-serif overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar"
                  ref={scrollContainerRef}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-center"}`}
                    >
                      <div
                        className={`rounded-2xl p-6 ${
                          msg.role === "user"
                            ? "max-w-[90%] md:max-w-[75%] bg-amber-900/40 border border-amber-500/30 text-amber-100 ml-auto"
                            : "w-full bg-black/20 markdown-body"
                        }`}
                      >
                        {msg.role === "model" ? (
                          <MysticMarkdown content={msg.content} />
                        ) : (
                          <p className="text-lg">{msg.content}</p>
                        )}
                      </div>

                    </div>
                  ))}
                  {isStreaming && messages.length > 0 && (
                    <div className="text-amber-200/60 italic animate-pulse">
                      阿卡夏正在感应...
                    </div>
                  )}
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 glass-panel p-4 rounded-2xl flex gap-4 items-end hide-in-poster"
              >
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="继续向阿卡夏请教..."
                  className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl p-3 text-amber-100 placeholder-amber-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all resize-none h-14"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isStreaming || isAskingFollowUp}
                  className="p-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </motion.div>
            )}

            {messages.length > 0 && (
              <div className="flex justify-center mt-8 gap-4 hide-in-poster">
                <button
                  onClick={() => {
                    setMessages([]);
                    setImage(null);
                    setQuestion("");
                    setCurrentEntryId(null);
                    abort();
                  }}
                  className="px-6 py-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full font-serif transition-colors"
                >
                  结束端详，隐去真容
                </button>
                <button
                  onClick={onGeneratePoster}
                  disabled={isGeneratingPoster}
                  className="px-6 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-300 rounded-full font-serif transition-colors flex flex-row items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Download size={16} className={isGeneratingPoster ? "animate-bounce" : ""} />
                  {isGeneratingPoster ? "生成中..." : "保存海报"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
