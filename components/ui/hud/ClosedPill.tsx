import React from "react";
import { motion, Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { Settings2 } from "lucide-react";

interface ClosedPillProps {
  isExpanded: boolean;
  islandTransition: Transition;
  TabIconComponent: React.ReactNode;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const ClosedPill = ({
  isExpanded,
  islandTransition,
  TabIconComponent,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  setZoom,
}: ClosedPillProps) => (
  <motion.div
    initial={false}
    animate={{
      opacity: isExpanded ? 0 : 1,
      scale: isExpanded ? 0.95 : 1,
      filter: isExpanded ? "blur(5px)" : "blur(0px)",
    }}
    transition={{ ...islandTransition, delay: isExpanded ? 0 : 0.1 }}
    className={cn(
      "absolute inset-0 flex flex-col items-center justify-between py-6 px-1 h-full select-none",
      isExpanded && "pointer-events-none"
    )}
  >
    {/* Top Decorative Line Indicator */}
    <div className="flex h-1.5 w-6 rounded-full bg-zinc-800" />

    {/* Elegant Vertical Menu Label */}
    <div className="flex flex-col items-center gap-1.5 py-6">
      {"MENU".split("").map((char, i) => (
        <span
          key={i}
          className="text-[10px] font-sans font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer select-none leading-none tracking-widest"
        >
          {char}
        </span>
      ))}
    </div>

    {/* Elegant Trigger Icon Wrapper */}
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 shadow-sm text-zinc-450 hover:text-white transition-all cursor-pointer hover:bg-zinc-850"
    >
      <Settings2 className="h-4 w-4 text-zinc-450 hover:text-white" />
    </motion.div>
  </motion.div>
);

