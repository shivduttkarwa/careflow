import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardPlus,
    Filter,
    House,
    Search,
    Sheet,
    UserRound,
    X,
} from 'lucide-react';
import { useState } from 'react';
import CareDate from '@/components/care-date';
import CareSelect from '@/components/care-select';

type Report = {
    id: number;
    participant: string;
    initials: string;
    accent_colour: string;
    home: string;
    date: string;
    date_label: string;
    shift_type: string;
    worker: string;
    status: string;
    follow_up_required: boolean;
    seizure_events_count: number;
    handover_notes?: string;
};

type Option = { id: number; name: string };

type Props = {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    participants: Option[];
    homes: Option[];
    workers: Option[];
    filters: Record<string, string | undefined>;
};

export default function ReportHistory({
    reports,
    participants,
    homes,
    workers,
    filters,
}: Props) {
    const [participant, setParticipant] = useState(filters.participant ?? '');
    const [home, setHome] = useState(filters.home ?? '');
    const [worker, setWorker] = useState(filters.worker ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyFilters = () => {
        router.get(
            '/reports',
            { participant, home, worker, from, to },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setParticipant('');
        setHome('');
        setWorker('');
        setFrom('');
        setTo('');
        router.get('/reports', {}, { replace: true });
    };

    const hasFilters = Boolean(participant || home || worker || from || to);

    const appliedQuery = new URLSearchParams(
        Object.entries({ participant, home, worker, from, to }).filter(
            ([, value]) => value !== '',
        ),
    ).toString();

    return (
        <>
            <Head title="Care records" />
            <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-[30px] font-bold tracking-[-0.03em] text-ink-900 sm:text-[36px]">
                            Care records
                        </h1>
                        <p className="mt-2 text-base text-ink-500">
                            Review previous shifts and follow-ups in one place.
                        </p>
                    </div>
                    <Link
                        href={
                            participants.length > 0
                                ? '/reports/create'
                                : '/participants/create'
                        }
                        className="btn-primary shrink-0"
                    >
                        <ClipboardPlus className="size-4" />{' '}
                        {participants.length > 0
                            ? 'New care record'
                            : 'Add participant'}
                    </Link>
                </header>

                <section className="animate-rise-in animation-delay-1 care-card mt-7 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                            <Filter className="size-4 text-brand-600" /> Filter
                            records
                        </div>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-ink-700"
                            >
                                <X className="size-3.5" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_150px_150px_auto]">
                        <FilterSelect
                            icon={House}
                            value={home}
                            onChange={setHome}
                            placeholder="All services"
                            options={homes}
                        />
                        <FilterSelect
                            icon={UserRound}
                            value={participant}
                            onChange={setParticipant}
                            placeholder="All participants"
                            options={participants}
                        />
                        <FilterSelect
                            icon={UserRound}
                            value={worker}
                            onChange={setWorker}
                            placeholder="All workers"
                            options={workers}
                        />
                        <DateFilter
                            value={from}
                            onChange={setFrom}
                            label="From date"
                            placeholder="From"
                            max={to}
                        />
                        <DateFilter
                            value={to}
                            onChange={setTo}
                            label="To date"
                            placeholder="To"
                            min={from}
                        />
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="btn-secondary h-11 text-[13px]"
                        >
                            <Search className="size-4" /> Apply
                        </button>
                    </div>
                </section>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-ink-500">
                        <span className="font-bold text-ink-800">
                            {reports.total}
                        </span>{' '}
                        care records{hasFilters && ' matching these filters'}
                    </p>
                    {reports.total > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`/reports/export?${appliedQuery}`}
                                className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
                            >
                                <Sheet className="size-4 text-brand-600" />{' '}
                                Export spreadsheet
                            </a>
                            <a
                                href={`/reports/book?${appliedQuery}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
                            >
                                <BookOpen className="size-4 text-brand-600" />{' '}
                                Care book PDF
                            </a>
                        </div>
                    )}
                </div>

                <section className="animate-rise-in animation-delay-2 care-card mt-3 overflow-hidden">
                    {reports.data.length > 0 ? (
                        <div className="divide-y divide-line-soft">
                            {reports.data.map((report) => (
                                <Link
                                    key={report.id}
                                    href={
                                        report.status === 'draft'
                                            ? `/reports/${report.id}/edit`
                                            : `/reports/${report.id}`
                                    }
                                    prefetch
                                    className="group grid gap-4 p-5 transition hover:bg-surface sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                                            style={{
                                                backgroundColor:
                                                    report.accent_colour,
                                            }}
                                        >
                                            {report.initials}
                                        </div>
                                        <div className="sm:hidden">
                                            <p className="text-sm font-semibold">
                                                {report.participant}
                                            </p>
                                            <p className="mt-0.5 text-xs text-ink-400">
                                                {report.date_label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="hidden items-center gap-2 sm:flex">
                                            <h2 className="text-sm font-semibold">
                                                {report.participant}
                                            </h2>
                                            <span className="pill-neutral">
                                                {report.home}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
                                            <span className="hidden sm:inline">
                                                {report.date_label}
                                            </span>
                                            <span className="hidden sm:inline">
                                                ·
                                            </span>
                                            <span className="capitalize">
                                                {report.shift_type} shift
                                            </span>
                                            <span>·</span>
                                            <span>{report.worker}</span>
                                        </div>
                                        {report.handover_notes && (
                                            <p className="mt-2 line-clamp-1 text-sm text-ink-500">
                                                {report.handover_notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                        <div className="flex flex-wrap gap-2">
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
                                        <ChevronRight className="size-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-16 text-center">
                            <CalendarDays className="mx-auto size-7 text-ink-300" />
                            <h2 className="mt-4 text-base font-semibold">
                                No care records found
                            </h2>
                            <p className="mt-2 text-sm text-ink-500">
                                {participants.length > 0
                                    ? 'Create a new care record to begin the care history.'
                                    : 'Add a participant to create the first care record.'}
                            </p>
                        </div>
                    )}
                </section>

                {reports.last_page > 1 && (
                    <div className="care-card mt-5 flex items-center justify-between px-4 py-3">
                        <Link
                            href={reports.prev_page_url ?? '#'}
                            className={`flex items-center gap-1.5 text-sm font-semibold ${reports.prev_page_url ? 'text-brand-700' : 'pointer-events-none text-ink-300'}`}
                        >
                            <ChevronLeft className="size-4" /> Previous
                        </Link>
                        <span className="text-xs font-medium text-ink-400">
                            Page {reports.current_page} of {reports.last_page}
                        </span>
                        <Link
                            href={reports.next_page_url ?? '#'}
                            className={`flex items-center gap-1.5 text-sm font-semibold ${reports.next_page_url ? 'text-brand-700' : 'pointer-events-none text-ink-300'}`}
                        >
                            Next <ChevronRight className="size-4" />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

function FilterSelect({
    icon: Icon,
    value,
    onChange,
    placeholder,
    options,
}: {
    icon: typeof UserRound;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: Option[];
}) {
    return (
        <CareSelect
            icon={Icon}
            label={placeholder}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            options={[
                { value: '', label: placeholder },
                ...options.map((option) => ({
                    value: String(option.id),
                    label: option.name,
                })),
            ]}
        />
    );
}

function DateFilter({
    value,
    onChange,
    label,
    placeholder,
    min,
    max,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
    min?: string;
    max?: string;
}) {
    return (
        <CareDate
            value={value}
            onChange={onChange}
            label={label}
            placeholder={placeholder}
            min={min}
            max={max}
            clearable
        />
    );
}
