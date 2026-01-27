'use client';
import React from 'react';
import { Spotlight } from './spotlight';
import { cn } from '@/lib/utils';

type SpotlightCardProps = {
    children: React.ReactNode;
    className?: string;
    spotlightClassName?: string;
    spotlightSize?: number;
};

export function SpotlightCard({
    children,
    className,
    spotlightClassName,
    spotlightSize = 200,
}: SpotlightCardProps) {
    return (
        <div className={cn('relative overflow-hidden', className)}>
            <Spotlight size={spotlightSize} className={spotlightClassName} />
            {children}
        </div>
    );
}
