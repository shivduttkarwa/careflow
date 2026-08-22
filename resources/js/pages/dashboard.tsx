import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpenCheck,
    Check,
    ChevronRight,
    Clock3,
    FileCheck2,
    HeartPulse,
    Megaphone,
    Plus,
    ShieldCheck,
    Sparkles,
    Users,
    UserRoundPlus,
} from 'lucide-react';
import type { ComponentType } from 'react';

type Participant = {
    id: number;
    display_name: string;
    full_name: string;
    initials: string;
    home: string;
    accent_colour: string;
    support_summary?: string;
};

type Shift = {
    id: number;
    starts_at: string;
    ends_at: string;
    start_label: string;
    end_label: string;
    status: string;
    progress: number;
    report_id: number | null;
    report_status: string | null;
    participant: Participant;
};

type ReportSummary = {
    id: number;
    participant_name: string;
    participant_initials: string;
    accent_colour: string;
    home: string;
    date: string;
    date_label: string;
    shift_type: string;
    worker: string;
    follow_up_required: boolean;
    handover_notes?: string;
    submitted_at?: string;
};

type Announcement = {
    id: number;
    title: string;
    body: string;
    priority: string;
    published_at: string;
    acknowledged: boolean;
};

type Props = {
    participantCount: number;
    currentShift: Shift | null;
    recentReports: ReportSummary[];
    announcement: Announcement | null;
    stats: {
        reports_this_week: number;
        open_follow_ups: number;
        seizures_this_month: number;
    };
};

const timeGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 17) {
        return 'Good afternoon';
    }

    return 'Good evening';
};

export default function Dashboard({
    participantCount,
    currentShift,
    recentReports,
    announcement,
    stats,
}: Props) {
    const { auth } = usePage().props;
    const firstName = auth.user.name.split(' ')[0];
    const latestHandover = recentReports[0];
    const today = new Intl.DateTimeFormat('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    const reportHref = currentShift?.report_id
        ? `/reports/${currentShift.report_id}/edit`
        : `/reports/create${currentShift ? `?participant=${currentShift.participant.id}` : ''}`;

    const isManager =
        auth.user.role === 'manager' || auth.user.role === 'administrator';

    const emptyState =
        participantCount === 0
            ? {
                  icon: UserRoundPlus,
                  title: 'Add your first participant',
                  body: 'Start with a participant name, then create their first daily care record.',
                  href: '/participants/create',
                  action: (
                      <>
                          <UserRoundPlus className="size-4" /> Add participant
                      </>
                  ),
              }
            : isManager
              ? {
                    icon: Users,
                    title: 'Service overview',
                    body: `You are not rostered on a shift. ${participantCount} ${participantCount === 1 ? 'participant is' : 'participants are'} being supported across your services right now.`,
                    href: '/participants',
                    action: (
                        <>
                            <Users className="size-4" /> View participants
                        </>
                    ),
                }
              : {
                    icon: Clock3,
                    title: 'No current shift',
                    body: 'You can still start a daily care record for a participant you support.',
                    href: '/reports/create',
                    action: (
                        <>
                            <Plus className="size-4" /> Start care record
                        </>
                    ),
                };

    const EmptyIcon = emptyState.icon;

    return (
        <>
            <Head title="Overview" />

            <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-ink-400 uppercase">
                            <span className="size-1.5 rounded-full bg-grow-500" />
                            {today}
                        </div>
                        <h1 className="text-[30px] leading-tight font-bold tracking-[-0.03em] text-ink-900 sm:text-[36px]">
                            {timeGreeting()}, {firstName}
                        </h1>
                        <p className="mt-2 text-base text-ink-500">
                            Here is your shift overview for today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href="/participants/create"
                            className="btn-secondary h-11 text-[13px]"
                        >
                            <UserRoundPlus className="size-4" /> Add participant
                        </Link>
                        <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink-500 sm:flex">
                            <ShieldCheck className="size-4 text-brand-600" />
                            Secure session
                        </div>
                    </div>
                </header>

                <section className="animate-rise-in animation-delay-1 mt-7 grid gap-4 sm:grid-cols-3">
                    <StatTile
                        label="Records this week"
                        value={stats.reports_this_week}
                        icon={FileCheck2}
                        tone="grow"
                    />
                    <StatTile
                        label="Open follow-ups"
                        value={stats.open_follow_ups}
                        icon={AlertCircle}
                        tone={stats.open_follow_ups > 0 ? 'alert' : 'neutral'}
                    />
                    <StatTile
                        label="Seizures this month"
                        value={stats.seizures_this_month}
                        icon={HeartPulse}
                        tone={
                            stats.seizures_this_month > 0 ? 'warn' : 'neutral'
                        }
                    />
                </section>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
                    <section className="animate-rise-in animation-delay-1 care-card overflow-hidden">
                        {currentShift ? (
                            <>
                                <div className="flex flex-col gap-6 p-6 sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="grid size-14 place-items-center rounded-2xl text-base font-bold text-white"
                                                style={{
                                                    backgroundColor:
                                                        currentShift.participant
                                                            .accent_colour,
                                                }}
                                            >
                                                {
                                                    currentShift.participant
                                                        .initials
                                                }
                                            </div>
                                            <div>
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    <span className="text-[11px] font-bold tracking-[0.1em] text-ink-400 uppercase">
                                                        Current shift
                                                    </span>
                                                    <span className="pill-done">
                                                        Live
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                                                    Supporting{' '}
                                                    {
                                                        currentShift.participant
                                                            .display_name
                                                    }
                                                </h2>
                                                <p className="mt-1 text-xs text-ink-400">
                                                    {
                                                        currentShift.participant
                                                            .home
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-brand-50 px-4 py-3 text-right">
                                            <p className="text-xs font-semibold text-brand-800">
                                                {currentShift.start_label} –{' '}
                                                {currentShift.end_label}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-medium text-ink-400 uppercase">
                                                8 hour shift
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-ink-400">
                                            <span>Shift progress</span>
                                            <span>
                                                {currentShift.progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                                            <div
                                                className="h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-out"
                                                style={{
                                                    width: `${currentShift.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {currentShift.participant
                                        .support_summary && (
                                        <div className="rounded-xl border border-line-soft bg-surface p-4">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="mt-0.5 size-4 shrink-0 text-warn-600" />
                                                <div>
                                                    <p className="text-xs font-semibold text-ink-700">
                                                        Support preference
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-ink-500">
                                                        {
                                                            currentShift
                                                                .participant
                                                                .support_summary
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Link
                                            href={reportHref}
                                            className="btn-primary group min-h-14"
                                        >
                                            {currentShift.report_id
                                                ? 'Continue care record'
                                                : 'Start care record'}
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                        <Link
                                            href={`/seizures/create?participant=${currentShift.participant.id}${currentShift.report_id ? `&report=${currentShift.report_id}` : ''}`}
                                            className="btn-secondary min-h-14"
                                        >
                                            <Plus className="size-4" /> Record
                                            seizure event
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-10 text-center">
                                <EmptyIcon className="mx-auto size-8 text-ink-300" />
                                <h2 className="mt-4 text-lg font-semibold">
                                    {emptyState.title}
                                </h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
                                    {emptyState.body}
                                </p>
                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                                    <Link
                                        href={emptyState.href}
                                        className="btn-primary h-11 text-[13px]"
                                    >
                                        {emptyState.action}
                                    </Link>
                                    {isManager && participantCount > 0 && (
                                        <Link
                                            href="/reports"
                                            className="btn-secondary h-11 text-[13px]"
                                        >
                                            <FileCheck2 className="size-4" />{' '}
                                            Review care records
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="animate-rise-in animation-delay-2 care-card p-6 sm:p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.1em] text-ink-400 uppercase">
                                    Latest handover
                                </p>
                                <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em]">
                                    Before you begin
                                </h2>
                            </div>
                            <BookOpenCheck className="size-5 text-brand-500" />
                        </div>

                        {latestHandover ? (
                            <>
                                <div className="mt-6 flex items-center gap-3">
                                    <div
                                        className="grid size-10 place-items-center rounded-full text-xs font-bold text-white"
                                        style={{
                                            backgroundColor:
                                                latestHandover.accent_colour,
                                        }}
                                    >
                                        {latestHandover.participant_initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold capitalize">
                                            {latestHandover.date_label} ·{' '}
                                            {latestHandover.shift_type}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-ink-400">
                                            Submitted by {latestHandover.worker}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`mt-5 rounded-xl border p-4 ${latestHandover.follow_up_required ? 'border-alert-100 bg-alert-50' : 'border-line-soft bg-surface'}`}
                                >
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-700">
                                        {latestHandover.follow_up_required ? (
                                            <AlertCircle className="size-4 text-alert-600" />
                                        ) : (
                                            <Check className="size-4 text-grow-600" />
                                        )}
                                        {latestHandover.follow_up_required
                                            ? 'Follow-up requested'
                                            : 'No outstanding concerns'}
                                    </div>
                                    <p className="text-xs leading-5 text-ink-500">
                                        {latestHandover.handover_notes ||
                                            'No additional handover notes were recorded.'}
                                    </p>
                                </div>

                                <Link
                                    href={`/reports/${latestHandover.id}`}
                                    className="mt-5 flex h-11 items-center justify-between rounded-lg px-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
                                >
                                    Review full handover{' '}
                                    <ChevronRight className="size-4" />
                                </Link>
                            </>
                        ) : (
                            <p className="mt-6 text-sm text-ink-400">
                                No previous handover is available.
                            </p>
                        )}
                    </section>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <section className="animate-rise-in animation-delay-2 care-card p-6 sm:p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                    Recent care records
                                </h2>
                                <p className="mt-1 text-xs text-ink-400">
                                    A quick view of recent shifts
                                </p>
                            </div>
                            <Link
                                href="/reports"
                                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="mt-5 divide-y divide-line-soft">
                            {recentReports.slice(0, 3).map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/reports/${report.id}`}
                                    prefetch
                                    className="group flex items-center gap-3 py-4 first:pt-1 last:pb-0"
                                >
                                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                        {report.shift_type === 'night' ? (
                                            <Clock3 className="size-4" />
                                        ) : (
                                            <FileCheck2 className="size-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold capitalize">
                                                {report.participant_name} ·{' '}
                                                {report.shift_type} shift
                                            </p>
                                            {report.follow_up_required && (
                                                <span className="size-1.5 shrink-0 rounded-full bg-alert-500" />
                                            )}
                                        </div>
                                        <p className="mt-1 truncate text-[11px] text-ink-400">
                                            {report.date_label} ·{' '}
                                            {report.worker}
                                        </p>
                                    </div>
                                    <ChevronRight className="size-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                                </Link>
                            ))}
                            {recentReports.length === 0 && (
                                <p className="py-6 text-sm text-ink-400">
                                    No care records have been submitted yet.
                                </p>
                            )}
                        </div>
                    </section>

                    {announcement && (
                        <section className="animate-rise-in animation-delay-3 rounded-2xl border border-brand-100 bg-brand-50 p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="grid size-10 place-items-center rounded-xl bg-white text-brand-700 shadow-card">
                                    <Megaphone className="size-[18px]" />
                                </div>
                                <span className="pill bg-white text-ink-500">
                                    Team notice
                                </span>
                            </div>
                            <h2 className="mt-5 text-base font-semibold tracking-[-0.02em]">
                                {announcement.title}
                            </h2>
                            <p className="mt-2 text-xs leading-5 text-ink-600">
                                {announcement.body}
                            </p>
                            {announcement.acknowledged ? (
                                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-grow-700">
                                    <Check className="size-4" /> Acknowledged
                                </div>
                            ) : (
                                <Link
                                    href={`/announcements/${announcement.id}/acknowledge`}
                                    method="post"
                                    as="button"
                                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-xs font-semibold text-brand-800 shadow-card transition hover:-translate-y-px hover:shadow-raised"
                                >
                                    <Check className="size-4" /> Mark as
                                    reviewed
                                </Link>
                            )}
                        </section>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-medium text-ink-300">
                    <ShieldCheck className="size-3.5" /> Participant information
                    is encrypted and access is logged
                </div>
            </div>
        </>
    );
}

const statTones = {
    grow: 'bg-grow-100 text-grow-700',
    alert: 'bg-alert-100 text-alert-700',
    warn: 'bg-warn-100 text-warn-700',
    neutral: 'bg-ink-100 text-ink-500',
};

function StatTile({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    tone: keyof typeof statTones;
}) {
    return (
        <div className="care-card flex items-center justify-between gap-4 p-5 sm:p-6">
            <div>
                <p className="text-sm font-medium text-ink-500">{label}</p>
                <p className="mt-1 text-[32px] leading-none font-bold tracking-[-0.03em] text-ink-900">
                    {value}
                </p>
            </div>
            <span
                className={`grid size-11 shrink-0 place-items-center rounded-full ${statTones[tone]}`}
            >
                <Icon className="size-5" />
            </span>
        </div>
    );
}
