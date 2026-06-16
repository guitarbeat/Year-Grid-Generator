import React, { useRef } from "react";
import { motion, AnimatePresence, useDragControls, Transition } from "motion/react";
import { GripHorizontal, Pin, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingOverlayProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  onDock: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
}

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  id,
  title,
  icon,
  onDock,
  isMinimized,
  onToggleMinimize,
  children,
  initialX = 100,
  initialY = 120,
}) => {
  const dragControls = useDragControls();

  // Fine-tuned premium spring motion for layout transitions and dragging
  const springTransition: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 30,
    mass: 1,
  };

  return (
    <motion.div
      layout="position"
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.06}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.92,
        transition: { duration: 0.18, ease: "easeIn" } 
      }}
      transition={springTransition}
      style={{
        position: "absolute",
        left: initialX,
        top: initialY,
        zIndex: 50,
      }}
      className={cn(
        "w-[340px] md:w-[380px] select-none pointer-events-auto",
        "bg-[#0a0a0f]/94 border border-white/12 backdrop-blur-xl",
        "rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.02)] p-1",
        "flex flex-col overflow-hidden select-none",
        "hover:border-white/20 transition-colors duration-300"
      )}
    >
      {/* Title & Grab Header Bar */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-3 py-2.5 bg-white/[0.01] border-b border-white/[0.05] rounded-t-xl cursor-grab active:cursor-grabbing hover:bg-white/[0.03] transition-colors duration-200"
      >
        <div className="flex items-center gap-2 pointer-events-none select-none">
          <motion.div 
            animate={{ rotate: isMinimized ? -90 : 0 }}
            transition={springTransition}
            className="text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200"
          >
            {icon}
          </motion.div>
          <span className="text-[11px] font-sans font-extrabold text-zinc-150 tracking-wider uppercase">
            {title}
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 tracking-normal capitalize">
            Overlay
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 no-pan">
          {/* Drag indicator handle helper icon */}
          <div className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors pointer-events-none" title="Drag Handle">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>

          {/* Minimize button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggleMinimize}
            className="w-6.5 h-6.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-[background-color,border-color,color] duration-150 cursor-pointer"
            title={isMinimized ? "Expand panel" : "Minimize panel"}
            type="button"
          >
            {isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </motion.button>

          {/* Dock / Pin Back button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onDock}
            className="w-6.5 h-6.5 rounded-lg bg-accent/8 hover:bg-accent/18 border border-accent/20 hover:border-accent/30 flex items-center justify-center text-accent hover:text-white transition-[background-color,border-color,color] duration-150 cursor-pointer"
            title="Dock back to settings panel"
            type="button"
          >
            <Pin className="w-3.5 h-3.5 rotate-45 transform" />
          </motion.button>
        </div>
      </div>

      {/* Floating Panel Content */}
      <AnimatePresence initial={false} mode="wait">
        {!isMinimized && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: { 
                height: { type: "spring", stiffness: 420, damping: 28 }, 
                opacity: { duration: 0.15 } 
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: { 
                height: { type: "spring", stiffness: 420, damping: 28 }, 
                opacity: { duration: 0.1 } 
              }
            }}
            className="p-4 overflow-y-auto max-h-[64vh] custom-scrollbar rounded-b-xl bg-[#08080c]/40"
          >
            {/* Contextual Inner stagger for elite UI feel */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  }
                }
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
