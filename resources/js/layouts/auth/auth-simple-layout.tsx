import { ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/brand';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-4 py-10 sm:px-6">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 12% 8%, rgba(17,94,116,0.10) 0, transparent 42%), radial-gradient(circle at 88% 92%, rgba(177,38,85,0.08) 0, transparent 42%)',
                }}
            />

            <main className="animate-rise-in relative w-full max-w-[440px]">
                <div className="care-card overflow-hidden shadow-raised">
                    <div className="border-b border-line-soft bg-gradient-to-br from-white to-brand-50 px-7 py-8 text-center sm:px-9">
                        <BrandLockup className="justify-center" />
                        <h1 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink-900">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-ink-500">
                            {description}
                        </p>
                    </div>
                    <div className="px-7 py-8 sm:px-9">{children}</div>
                </div>

                <p className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-ink-400">
                    <ShieldCheck className="size-3.5 text-brand-500" /> Your
                    session is encrypted and access is logged
                </p>
            </main>
        </div>
    );
}
