"use client";

import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

interface GlobalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function GlobalDisclaimerModal({ isOpen, onAccept }: GlobalDisclaimerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl luxury-card p-8 md:p-10 bg-[#0a0510] border border-[#C9A84C]/30 shadow-2xl overflow-hidden rounded-3xl flex flex-col max-h-[90vh]"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center mb-8">
              <ShieldAlert className="w-12 h-12 text-[#C9A84C] mb-4" />
              <h2 className="text-3xl font-serif gold-gradient-text tracking-widest text-center">
                使用协议与免责声明
              </h2>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-8">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-serif text-lg">1. 服务宗旨与性质</h3>
                </div>
                <p className="text-[#E8DFB8]/70 text-sm leading-relaxed pl-7">
                  “阿卡夏之窗”（本应用）是一款结合人工智能技术与传统神秘学（塔罗、星象、命理等）的探索与娱乐工具。所有生成内容均由 AI 模型根据概率与象征逻辑产生，仅供个人探索、思考与参考。
                </p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-serif text-lg">2. 心理健康与安全警告</h3>
                </div>
                <div className="pl-7 space-y-2 text-[#E8DFB8]/70 text-sm leading-relaxed">
                  <p className="font-bold text-amber-200/90">
                    本应用不能替代任何专业的临床心理治疗、医疗建议、法律咨询或财务诊断。
                  </p>
                  <p>
                    神秘学工具可能引发深层的情绪反应。如果您正处于心理危机、严重抑郁、焦虑或有任何伤害自己的冲动，请立即停止使用并寻求专业医疗机构或心理危机干预热线的帮助。
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-serif text-lg">3. 责任限制</h3>
                </div>
                <p className="text-[#E8DFB8]/70 text-sm leading-relaxed pl-7">
                  用户基于本应用提供的内容所做出的任何决定（包括但不限于投资、情感、职业等选择），其后果由用户本人承担。本应用及其开发者不对用户因使用本服务而产生的任何直接或间接损失承担法律责任。
                </p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-serif text-lg">4. 数据隐私</h3>
                </div>
                <p className="text-[#E8DFB8]/70 text-sm leading-relaxed pl-7">
                  我们重视您的隐私。您的出生信息及占卜记录存储于本地浏览器数据库（IndexedDB）或您的加密同步账户中。除非您选择分享，否则这些数据不会被公开。
                </p>
              </section>
            </div>

            <div className="relative z-10 pt-6 border-t border-[#C9A84C]/20 flex flex-col items-center gap-4">
              <p className="text-xs text-[#E8DFB8]/40 text-center font-serif">
                继续使用即表示您已阅读并同意上述所有条款
              </p>
              <button
                onClick={onAccept}
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#8B6B23] to-[#C9A84C] text-[#0a0510] font-serif font-bold tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_40px_rgba(201,168,76,0.5)] transition-all transform hover:scale-105 active:scale-95 uppercase"
              >
                开启命运之窗
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
