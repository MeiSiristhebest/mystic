"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, Check, X, Sparkles } from "lucide-react";

interface CustomConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CustomConfirmModal({
  isOpen,
  title = "确认操作",
  message,
  confirmText = "确认抹除",
  cancelText = "保留印记",
  danger = true,
  onConfirm,
  onCancel,
}: CustomConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#12081f] via-[#090412] to-[#06020c] border border-[#C9A84C]/40 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-36 h-36 text-[#C9A84C]" />
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className={`p-4 rounded-2xl border ${
                danger 
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)]" 
                  : "bg-[#C9A84C]/15 border-[#C9A84C]/40 text-[#F5E6AD] shadow-[0_0_25px_rgba(201,168,76,0.25)]"
              }`}>
                {danger ? <Trash2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-serif text-[#FFFDF6] font-bold tracking-wider">
                  {title}
                </h3>
                <p className="text-xs md:text-sm text-[#E8DFB8]/75 font-serif leading-relaxed px-2">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3.5 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-serif text-xs tracking-widest transition-all cursor-pointer"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`flex-1 py-3.5 px-5 rounded-full font-serif text-xs font-bold tracking-widest transition-all cursor-pointer shadow-lg ${
                    danger
                      ? "bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white shadow-rose-900/30"
                      : "bg-[#C9A84C] hover:bg-[#E8DFB8] text-[#080510] shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
