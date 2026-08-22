import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

export function BrandMark(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 64 64"
            role="img"
            aria-label="Ignite Community Services"
            {...props}
        >
            <defs>
                <linearGradient
                    id="ignite-flame"
                    x1="32"
                    y1="3"
                    x2="32"
                    y2="46"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#f7b733" />
                    <stop offset="0.5" stopColor="#ef6c2a" />
                    <stop offset="1" stopColor="#c1272d" />
                </linearGradient>
            </defs>
            <path
                d="M33.6 3.2c-.4 7.6 2.2 11.6 5.3 15.6 3.3 4.3 5.5 8 5.5 13.2 0 7.5-5.5 13.4-12.4 13.4S19.6 39.5 19.6 32c0-5.3 2.5-8.7 4.8-12.7 1-1.7 1.6-3.4 1.9-5.2 2.1 3.4 3.1 6.7 3.4 10.3 2.3-6.7 3.3-13.7 3.9-21.2Z"
                fill="url(#ignite-flame)"
            />
            <path
                d="M32.1 24.4c1.9 4.3 4.6 6.7 4.6 10.6 0 3.6-2 6.1-4.8 6.1s-4.8-2.5-4.8-6.1c0-3.7 2.7-6.1 5-10.6Z"
                fill="#ffc300"
            />
            <g fill="none" strokeWidth="5" strokeLinecap="round">
                <path d="M12 50q5.3 4.7 13.3 6.2" stroke="#115e74" />
                <path d="M25.3 56.2q6.7 1.8 13.4 0" stroke="#b12655" />
                <path d="M38.7 56.2q8-1.5 13.3-6.2" stroke="#76c03e" />
            </g>
        </svg>
    );
}

export function BrandLockup({
    className,
    compact = false,
}: {
    className?: string;
    compact?: boolean;
}) {
    return (
        <span className={cn('flex items-center gap-3', className)}>
            <img
                src="/images/ignite-logo.jpg"
                alt="Ignite Community Services"
                width={737}
                height={340}
                className={cn('w-auto', compact ? 'h-8' : 'h-11')}
            />
            {!compact && (
                <span className="border-l border-line pl-3 text-[10px] leading-4 font-bold tracking-[0.14em] text-ink-400 uppercase">
                    Care
                    <br />
                    Portal
                </span>
            )}
        </span>
    );
}
