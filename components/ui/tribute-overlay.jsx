"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function TributeOverlay() {
  const [isVisible, setIsVisible] = useState(true)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check session storage so it only plays once per session, preventing extreme annoyance
    // But since the user wants it on "every new visit", session storage is perfect for "new visits"
    const hasSeenTribute = sessionStorage.getItem("hasSeenArogyaTribute")
    if (hasSeenTribute) {
      setIsVisible(false)
      return
    }

    const timings = [
      3500, // Step 1: Proud creation
      7500, // Step 2: AEC
      11500, // Step 3: Faculty
      15500, // Step 4: Teachings
      19500, // Step 5: Monish Sir
      24500, // Step 6: Miss you
      28500  // End
    ]

    const timeouts = timings.map((time, index) => 
      setTimeout(() => setStep(index + 1), time)
    )

    const finishTimeout = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem("hasSeenArogyaTribute", "true")
    }, 30000)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(finishTimeout)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="tribute-overlay"
        initial={{ opacity: 1 }}
        exit={{ y: "-100%", opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen">
          
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-slate-400 text-lg md:text-xl font-medium tracking-widest uppercase"
              >
                A Proud Creation By 4 Students Of
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter"
              >
                Asansol Engineering College
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-4xl font-bold text-emerald-400"
              >
                With Deepest Gratitude to Our Faculty Members
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-5xl font-black text-white"
              >
                Transforming Your Teachings Into Reality.
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.7 }}
                className="space-y-4"
              >
                <div className="text-xl md:text-2xl text-slate-400 font-medium italic">
                  A very special thanks to
                </div>
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 pb-2">
                  Monish Sir & Bikash Debnath Sir
                </div>
                <div className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto pt-4 leading-relaxed">
                  For always understanding us, guiding our vision, and believing in what we could build.
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                className="text-2xl md:text-4xl font-bold text-white tracking-wide leading-tight"
              >
                Please remember us, Sir & Ma'am.<br/>
                <span className="text-emerald-400 italic font-medium mt-4 block">We are going to miss you.</span>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
      </motion.div>
    </AnimatePresence>
  )
}
