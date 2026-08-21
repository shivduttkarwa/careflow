import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-[#f1f4f1] lg:grid-cols-[minmax(420px,0.86fr)_minmax(520px,1.14fr)]">
            <main className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
                <div className="w-full max-w-[410px] animate-rise-in">
                    <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-[15px] bg-[#244f43] text-white shadow-[0_8px_22px_rgba(36,79,67,0.18)]"><HeartHandshake className="size-5" /></div>
                        <div><p className="font-semibold tracking-[-0.025em]">CareFlow</p><p className="text-[10px] font-bold tracking-[0.1em] text-[#839089] uppercase">Support portal</p></div>
                    </div>
                    <div className="mt-12"><h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#17251f]">{title}</h1><p className="mt-2 text-sm leading-6 text-[#74827b]">{description}</p></div>
                    <div className="mt-8">{children}</div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-medium text-[#929d98]"><ShieldCheck className="size-3.5 text-[#5d8475]" /> Your session is encrypted and access is logged</div>
                </div>
            </main>
            <aside className="relative hidden overflow-hidden bg-[#244f43] lg:block">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 18% 16%, rgba(255,255,255,.22) 0, transparent 32%), radial-gradient(circle at 85% 80%, rgba(193,221,207,.25) 0, transparent 36%)' }} />
                <div className="absolute top-[16%] right-[-16%] size-[480px] rounded-full border border-white/10" />
                <div className="absolute top-[27%] right-[-5%] size-[300px] rounded-full border border-white/10" />
                <div className="relative flex h-full flex-col justify-between p-14 text-white xl:p-20">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/65"><Sparkles className="size-4 text-[#d9b878]" /> Calm, connected care</div>
                    <div className="max-w-[520px]"><blockquote className="text-[34px] leading-[1.24] font-medium tracking-[-0.045em] xl:text-[42px]">Every shift begins with clarity and ends with confidence.</blockquote><p className="mt-7 max-w-[440px] text-sm leading-7 text-white/65">Secure daily records, thoughtful handovers and the right information at exactly the right moment.</p></div>
                    <div className="flex items-center justify-between border-t border-white/15 pt-6 text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase"><span>CareFlow MVP</span><span>Privacy-first by design</span></div>
                </div>
            </aside>
        </div>
    );
}
