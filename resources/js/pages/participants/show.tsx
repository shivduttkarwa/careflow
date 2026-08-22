import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    ClipboardPlus,
    FileClock,
    Users,
} from 'lucide-react';

type Participant = {
    id: number;
    display_name: string;
    full_name: string;
    initials: string;
    accent_colour: string;
    home: string;
    support_summary: string | null;
    date_of_birth: string | null;
    age: number | null;
};

type Report = {
    id: number;
    date_label: string;
    shift_type: string;
    status: string;
    worker: string;
    follow_up_required: boolean;
    seizure_events_count: number;
    handover_notes: string | null;
};

type Props = {
    participant: Participant;
    reports: Report[];
    stats: {
        total_reports: number;
        open_follow_ups: number;
        seizures_this_month: number;
    };
    careTeam: { id: number; name: string }[];
};

export default function ParticipantProfile({
    participant,
    reports,
    stats,
    careTeam,
}: Props) {
    return (
        <>
            <Head title={participant.display_name} />

            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <Link
                    href="/participants"
                    className="animate-rise-in inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-brand-700"
                >
                    <ArrowLeft className="size-4" /> All participants
                </Link>

                <header className="animate-rise-in mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div
                            className="grid size-14 shrink-0 place-items-center rounded-2xl text-base font-bold text-white"
                            style={{
                                backgroundColor: participant.accent_colour,
                            }}
                        >
                            {participant.initials}
                        </div>
                        <div>
                            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-ink-900 sm:text-[34px]">
                                {participant.display_name}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                                <span>{participant.full_name}</span>
                                <span>·</span>
                                <span>{participant.home}</span>
                                {participant.date_of_birth && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            {participant.date_of_birth}
                                            {participant.age !== null &&
                                                ` (${participant.age})`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/reports/create?participant=${participant.id}`}
                        className="btn-primary shrink-0"
                    >
                        <ClipboardPlus className="size-4" /> New care record
                    </Link>
                </header>

                <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="animate-rise-in animation-delay-1 space-y-5">
                        <section className="care-card">
                            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    <FileClock className="size-4 text-brand-600" />{' '}
                                    Recent shifts
                                </h2>
                                <Link
                                    href={`/reports?participant=${participant.id}`}
                                    className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                                >
                                    View all
                                </Link>
                            </div>

                            {reports.length > 0 ? (
                                <div className="divide-y divide-line-soft border-t border-line-soft">
                                    {reports.map((report) => (
                                        <Link
                                            key={report.id}
                                            href={
                                                report.status === 'draft'
                                                    ? `/reports/${report.id}/edit`
                                                    : `/reports/${report.id}`
                                            }
                                            prefetch
                                            className="group flex items-center gap-4 px-5 py-4 transition hover:bg-surface sm:px-6"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="text-sm font-semibold">
                                                        {report.date_label}
                                                    </span>
                                                    <span className="text-xs text-ink-400 capitalize">
                                                        {report.shift_type}{' '}
                                                        shift
                                                    </span>
                                                    <span className="text-xs text-ink-400">
                                                        · {report.worker}
                                                    </span>
                                                </div>
                                                {report.handover_notes && (
                                                    <p className="mt-1 line-clamp-1 text-sm text-ink-500">
                                                        {report.handover_notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                                                {report.status === 'draft' && (
                                                    <span className="pill-neutral">
                                                        Draft
                                                    </span>
                                                )}
                                                {report.follow_up_required && (
                                                    <span className="pill-followup">
                                                        <AlertCircle className="size-3" />{' '}
                                                        Follow-up
                                                    </span>
                                                )}
                                                {report.seizure_events_count >
                                                    0 && (
                                                    <span className="pill-warn">
                                                        {
                                                            report.seizure_events_count
                                                        }{' '}
                                                        seizure
                                                    </span>
                                                )}
                                            </div>

                                            <ChevronRight className="size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-t border-line-soft px-6 py-14 text-center">
                                    <FileClock className="mx-auto size-7 text-ink-300" />
                                    <h3 className="mt-4 text-base font-semibold">
                                        No care records yet
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-500">
                                        Start the first daily care record for{' '}
                                        {participant.display_name}.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="animate-rise-in animation-delay-2 space-y-4">
                        {participant.support_summary && (
                            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
                                <h2 className="text-sm font-semibold tracking-[-0.01em] text-brand-900">
                                    Support preferences
                                </h2>
                                <p className="mt-2.5 text-sm leading-6 text-ink-600">
                                    {participant.support_summary}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <Stat label="Records" value={stats.total_reports} />
                            <Stat
                                label="Follow-ups"
                                value={stats.open_follow_ups}
                            />
                            <Stat
                                label="Seizures"
                                value={stats.seizures_this_month}
                            />
                        </div>

                        <div className="care-card p-6">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                <Users className="size-4 text-brand-600" /> Care
                                team
                            </h2>
                            <ul className="mt-3.5 space-y-2">
                                {careTeam.map((member) => (
                                    <li
                                        key={member.id}
                                        className="text-sm font-medium text-ink-600"
                                    >
                                        {member.name}
                                    </li>
                                ))}
                                {careTeam.length === 0 && (
                                    <li className="text-sm text-ink-400">
                                        No support workers assigned yet.
                                    </li>
                                )}
                            </ul>
                        </div>

                        <Link
                            href={`/seizures/create?participant=${participant.id}`}
                            className="flex items-center gap-2.5 rounded-2xl border border-accent-100 bg-accent-50 p-5 text-sm font-semibold text-accent-700 transition hover:border-accent-200"
                        >
                            <Activity className="size-4" /> Record a seizure
                            observation
                        </Link>
                    </aside>
                </div>
            </div>
        </>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="care-card px-3 py-4 text-center">
            <p className="text-xl font-bold tracking-[-0.02em] text-ink-900">
                {value}
            </p>
            <p className="mt-1 text-[9px] font-bold tracking-[0.06em] text-ink-400 uppercase">
                {label}
            </p>
        </div>
    );
}
