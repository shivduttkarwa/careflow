import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CircleHelp,
    FileClock,
    LayoutGrid,
    LogOut,
    Plus,
    Settings,
    Users,
    UsersRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { BrandLockup } from '@/components/brand';
import { cn } from '@/lib/utils';

const navigation = [
    { label: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { label: 'Participants', href: '/participants', icon: UsersRound },
    { label: 'Care records', href: '/reports', icon: FileClock },
];

const managerNavigation = [
    { label: 'Team access', href: '/team', icon: Users },
];

const mobileNavigation = [
    ...navigation,
    { label: 'Settings', href: '/settings/profile', icon: Settings },
];

export default function CareLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const user = page.props.auth.user;
    const isManager = user.role === 'manager' || user.role === 'administrator';
    const sidebarNavigation = isManager
        ? [...navigation, ...managerNavigation]
        : navigation;
    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const path = page.url.split('?')[0];
    const allHrefs = [...sidebarNavigation, ...mobileNavigation].map(
        (item) => item.href,
    );
    const activeHref = allHrefs
        .filter((href) => path === href || path.startsWith(`${href}/`))
        .sort((a, b) => b.length - a.length)[0];

    const isActive = (href: string) => href === activeHref;

    return (
        <div className="min-h-screen bg-surface text-ink-900">
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-line bg-white/95 px-4 backdrop-blur-xl lg:px-6">
                <Link
                    href="/dashboard"
                    className="flex shrink-0 items-center lg:w-[248px]"
                >
                    <BrandLockup compact className="lg:hidden" />
                    <BrandLockup className="hidden lg:flex" />
                </Link>

                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        type="button"
                        className="relative grid size-10 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-brand-700"
                        aria-label="Notifications"
                    >
                        <Bell className="size-[19px]" />
                        <span className="absolute top-2.5 right-2.5 size-2 rounded-full border-2 border-white bg-accent-600" />
                    </button>
                    <Link
                        href="/settings/profile"
                        className="hidden size-10 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-brand-700 sm:grid"
                        aria-label="Help and account settings"
                    >
                        <CircleHelp className="size-[19px]" />
                    </Link>
                    <Link
                        href="/settings/profile"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800 transition hover:bg-brand-200"
                        aria-label="Open account settings"
                    >
                        {initials}
                    </Link>
                </div>
            </header>

            <aside className="fixed inset-y-16 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
                <div className="p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink-900">
                                {user.name}
                            </p>
                            <p className="truncate text-[11px] font-medium text-ink-400 capitalize">
                                {String(user.role ?? 'support_worker').replace(
                                    '_',
                                    ' ',
                                )}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/reports/create"
                        className="btn-primary mt-4 h-11 w-full text-[13px]"
                    >
                        <Plus className="size-4" /> New care record
                    </Link>
                </div>

                <nav className="space-y-1 px-3" aria-label="Main navigation">
                    {sidebarNavigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'flex h-12 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition',
                                    active
                                        ? 'bg-brand-100 font-semibold text-brand-800'
                                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'size-[19px]',
                                        active
                                            ? 'text-brand-700'
                                            : 'text-ink-400',
                                    )}
                                    strokeWidth={active ? 2.2 : 1.9}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-1 border-t border-line p-3">
                    <Link
                        href="/settings/profile"
                        className={cn(
                            'flex h-12 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition',
                            path.startsWith('/settings')
                                ? 'bg-brand-100 font-semibold text-brand-800'
                                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                        )}
                    >
                        <Settings
                            className="size-[19px] text-ink-400"
                            strokeWidth={1.9}
                        />{' '}
                        Settings
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex h-12 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-medium text-accent-600 transition hover:bg-accent-50"
                    >
                        <LogOut className="size-[19px]" strokeWidth={1.9} /> Log
                        out
                    </Link>
                </div>
            </aside>

            <main className="min-h-[calc(100vh-4rem)] pb-28 lg:ml-[248px] lg:pb-0">
                {children}
            </main>

            <Link
                href="/reports/create"
                className="fixed right-4 bottom-24 z-50 grid size-14 place-items-center rounded-2xl bg-brand-700 text-white shadow-brand-lg transition active:scale-95 lg:hidden"
                aria-label="Start a new care record"
            >
                <Plus className="size-6" />
            </Link>

            <nav
                className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white/95 px-2 pt-1.5 backdrop-blur-xl lg:hidden"
                aria-label="Mobile navigation"
            >
                {mobileNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition',
                                active ? 'text-brand-700' : 'text-ink-400',
                            )}
                        >
                            <span
                                className={cn(
                                    'grid h-7 w-12 place-items-center rounded-full transition',
                                    active && 'bg-brand-100',
                                )}
                            >
                                <Icon
                                    className="size-[19px]"
                                    strokeWidth={active ? 2.2 : 1.8}
                                />
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
