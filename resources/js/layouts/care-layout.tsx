import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronRight,
    ClipboardPlus,
    FileClock,
    HeartHandshake,
    Home,
    LogOut,
    Settings,
    Users,
    UsersRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { label: 'Overview', href: '/dashboard', icon: Home },
    { label: 'Patients', href: '/patients', icon: UsersRound },
    { label: 'Daily note', href: '/reports/create', icon: ClipboardPlus },
    { label: 'History', href: '/reports', icon: FileClock },
];

const managerNavigation = [{ label: 'Team access', href: '/team', icon: Users }];

export default function CareLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const user = page.props.auth.user;
    const isManager = user.role === 'manager' || user.role === 'administrator';
    const sidebarNavigation = isManager ? [...navigation, ...managerNavigation] : navigation;
    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const path = page.url.split('?')[0];
    const activeHref = sidebarNavigation
        .map((item) => item.href)
        .filter((href) => path === href || path.startsWith(`${href}/`))
        .sort((a, b) => b.length - a.length)[0];

    const isActive = (href: string) => href === activeHref;

    return (
        <div className="min-h-screen bg-[#f4f6f3] text-[#17231f]">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#dfe5df] bg-[#fbfcfa] lg:flex lg:flex-col">
                <div className="flex h-20 items-center gap-3 px-6">
                    <div className="grid size-10 place-items-center rounded-[14px] bg-[#244f43] text-white shadow-[0_8px_20px_rgba(36,79,67,0.16)]">
                        <HeartHandshake className="size-5" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[15px] font-semibold tracking-[-0.02em]">
                            CareFlow
                        </p>
                        <p className="text-[11px] font-medium tracking-[0.08em] text-[#7a8882] uppercase">
                            Support portal
                        </p>
                    </div>
                </div>

                <nav className="mt-5 space-y-1.5 px-3" aria-label="Main navigation">
                    {sidebarNavigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'group flex h-12 items-center gap-3 rounded-[14px] px-3.5 text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-[#e5eee9] text-[#204b3f]'
                                        : 'text-[#66736d] hover:bg-[#f0f3f0] hover:text-[#273b34]',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'size-[19px] transition-transform duration-200 group-hover:scale-105',
                                        active ? 'text-[#2e6a58]' : 'text-[#829089]',
                                    )}
                                    strokeWidth={1.9}
                                />
                                {item.label}
                                {active && (
                                    <ChevronRight className="ml-auto size-4 text-[#6f9185]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mx-5 mt-8 rounded-2xl border border-[#dfe7e1] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#344b43]">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        All systems secure
                    </div>
                    <p className="text-[11px] leading-5 text-[#7a8782]">
                        Session protected · Last sync just now
                    </p>
                </div>

                <div className="mt-auto border-t border-[#e4e8e4] p-3">
                    <div className="flex items-center gap-3 rounded-2xl p-2.5">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dbe9e2] text-xs font-bold text-[#285546]">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-[11px] capitalize text-[#7e8b85]">
                                {String(user.role ?? 'support_worker').replace('_', ' ')}
                            </p>
                        </div>
                        <Link
                            href="/settings/profile"
                            className="grid size-8 place-items-center rounded-lg text-[#76847e] transition hover:bg-[#edf1ed] hover:text-[#31463f]"
                            aria-label="Open account settings"
                        >
                            <Settings className="size-4" />
                        </Link>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-1 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-medium text-[#7c8883] transition hover:bg-[#f0f2ef] hover:text-[#344a42]"
                    >
                        <LogOut className="size-4" />
                        Sign out
                    </Link>
                </div>
            </aside>

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e7e2]/90 bg-[#f8faf7]/90 px-4 backdrop-blur-xl lg:hidden">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-xl bg-[#244f43] text-white">
                        <HeartHandshake className="size-[18px]" />
                    </div>
                    <span className="font-semibold tracking-[-0.02em]">CareFlow</span>
                </Link>
                <button
                    type="button"
                    className="relative grid size-10 place-items-center rounded-xl border border-[#dfe5df] bg-white text-[#52635c]"
                    aria-label="Notifications"
                >
                    <Bell className="size-[18px]" />
                    <span className="absolute top-2 right-2 size-2 rounded-full border-2 border-white bg-[#d9715c]" />
                </button>
            </header>

            <main className="min-h-screen pb-28 lg:ml-[248px] lg:pb-0">
                {children}
            </main>

            <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-[22px] border border-[#dce3dd] bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(30,48,40,0.16)] backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex h-14 flex-col items-center justify-center gap-1 rounded-[16px] text-[10px] font-semibold transition',
                                active
                                    ? 'bg-[#e6efe9] text-[#285546]'
                                    : 'text-[#829089]',
                            )}
                        >
                            <Icon className="size-[19px]" strokeWidth={active ? 2.2 : 1.8} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
