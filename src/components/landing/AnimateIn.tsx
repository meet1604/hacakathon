"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
}>;

export function AnimateIn({ children, className, delay = 0, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const initial =
    direction === "up"
      ? { opacity: 0, y: 24 }
      : direction === "left"
        ? { opacity: 0, x: -24 }
        : { opacity: 0 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = Readonly<{
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}>;

export function StaggerIn({ children, className, staggerDelay = 0.08 }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
