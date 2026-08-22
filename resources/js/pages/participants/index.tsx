import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronRight,
    House,
    Search,
    UserRound,
    UserRoundPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import CareSelect from '@/components/care-select';

type Participant = {
    id: number;
    display_name: string;
    full_name: string;
    initials: string;
    accent_colour: string;
    home: string;
    support_summary: string | null;
    last_report_date: string | null;
    follow_ups_count: number;
};

type Props = {
    participants: Participant[];
    homes: { id: number; name: string }[];
    filters: { search: string; home: string | number };
};

export default function ParticipantDirectory({
    participants,
    homes,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [home, setHome] = useState(String(filters.home ?? ''));

    const apply = (next?: { search?: string; home?: string }) => {
        router.get(
            '/participants',
            { search: next?.search ?? search, home: next?.home ?? home },
            { preserveState: true, replace: true },
        );
    };

    const clear = () => {
        setSearch('');
        setHome('');
        router.get('/participants', {}, { replace: true });
    };

    const hasFilters = Boolean(search || home);

    return (
        <>
            <Head title="Participants" />

            <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-[30px] font-bold tracking-[-0.03em] text-ink-900 sm:text-[36px]">
                            Participant directory
                        </h1>
                        <p className="mt-2 max-w-xl text-base text-ink-500">
                            Open a participant to read their recent shifts and
                            start a new daily care record.
                        </p>
                    </div>
                    <Link
                        href="/participants/create"
                        className="btn-primary shrink-0"
                    >
                        <UserRoundPlus className="size-4" /> Add participant
                    </Link>
                </header>

                <section className="animate-rise-in animation-delay-1 care-card mt-7 p-4 sm:p-5">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            apply();
                        }}
                        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name…"
                                aria-label="Search participants by name"
                                className="care-field pr-3 pl-10"
                            />
                        </div>
                        <CareSelect
                            size="lg"
                            icon={House}
                            label="Filter by service"
                            placeholder="All services"
                            value={home}
                            onChange={(value) => {
                                setHome(value);
                                apply({ home: value });
                            }}
                            options={[
                                { value: '', label: 'All services' },
                                ...homes.map((option) => ({
                                    value: String(option.id),
                                    label: option.name,
                                })),
                            ]}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="btn-secondary flex-1"
                            >
                                <Search className="size-4" /> Search
                            </button>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="btn-ghost px-3 text-xs"
                                >
                                    <X className="size-3.5" /> Clear
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <p className="mt-6 text-sm font-medium text-ink-500">
                    <span className="font-bold text-ink-800">
                        {participants.length}
                    </span>{' '}
                    {participants.length === 1 ? 'participant' : 'participants'}
                    {hasFilters && ' matching your search'}
                </p>

                <section className="animate-rise-in animation-delay-2 mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {participants.map((participant) => (
                        <Link
                            key={participant.id}
                            href={`/participants/${participant.id}`}
                            prefetch
                            className="care-card group flex flex-col p-5 transition hover:-translate-y-px hover:border-brand-300 hover:shadow-raised"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
                                    style={{
                                        backgroundColor:
                                            participant.accent_colour,
                                    }}
                                >
                                    {participant.initials}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold text-ink-900">
                                        {participant.display_name}
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-ink-400">
                                        {participant.home}
                                    </p>
                                </div>
                                <ChevronRight className="ml-auto size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                            </div>

                            {participant.support_summary && (
                                <p className="mt-4 mb-5 line-clamp-2 text-sm leading-6 text-ink-500">
                                    {participant.support_summary}
                                </p>
                            )}

                            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-soft pt-4 text-xs text-ink-400">
                                <span>
                                    {participant.last_report_date
                                        ? `Last record ${participant.last_report_date}`
                                        : 'No records yet'}
                                </span>
                                {participant.follow_ups_count > 0 && (
                                    <span className="pill-followup ml-auto">
                                        <AlertCircle className="size-3" />{' '}
                                        {participant.follow_ups_count} follow-up
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </section>

                {participants.length === 0 && (
                    <div className="animate-rise-in animation-delay-2 care-card mt-3 px-6 py-16 text-center">
                        <UserRound className="mx-auto size-7 text-ink-300" />
                        <h2 className="mt-4 text-base font-semibold">
                            No participants found
                        </h2>
                        <p className="mt-2 text-sm text-ink-500">
                            {hasFilters
                                ? 'Try a different name, or clear the filters.'
                                : 'Add a participant to start their care record.'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
