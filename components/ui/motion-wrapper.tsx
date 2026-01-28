"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    amount?: "some" | "all" | number;
    className?: string;
    duration?: number; // Optional custom duration
}

export function MotionWrapper({
    children,
    delay = 0,
    direction = "up",
    amount = "some",
    className,
    duration = 0.5,
    ...props
}: MotionWrapperProps) {
    const getVariants = () => {
        const distance = 20;

        const hidden: any = { opacity: 0 };
        if (direction === "up") hidden.y = distance;
        if (direction === "down") hidden.y = -distance;
        if (direction === "left") hidden.x = distance;
        if (direction === "right") hidden.x = -distance;

        return {
            hidden,
            visible: {
                opacity: 1,
                y: 0,
                x: 0,
                transition: {
                    duration: duration,
                    ease: [0.4, 0, 0.2, 1] as any, // Standard Material Design easing
                    delay: delay,
                },
            },
        };
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount }}
            variants={getVariants()}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}
