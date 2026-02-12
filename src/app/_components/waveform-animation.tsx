"use client";

import { motion } from "framer-motion";

const BAR_COUNT = 24;

const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
  delay: i * 0.08,
  duration: 0.6 + Math.random() * 0.8,
}));

export function WaveformAnimation() {
  return (
    <div className="flex items-center justify-center gap-[3px]">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="bg-foreground/20 w-[3px] rounded-full"
          animate={{
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: bar.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: bar.delay,
          }}
          style={{ height: 40, originY: "50%" }}
        />
      ))}
    </div>
  );
}
