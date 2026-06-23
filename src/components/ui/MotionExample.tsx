"use client";

import React from "react";
import { motion } from "motion/react";

export default function MotionExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="inline-block"
    >
      <div className="px-3 py-1 rounded bg-sky-500 text-white">Animated</div>
    </motion.div>
  );
}
