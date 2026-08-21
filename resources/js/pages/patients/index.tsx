import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronRight,
    House,
    Search,
    ShieldCheck,
    UserRound,
    UserRoundPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import CareSelect from '@/components/care-select';

type Patient = {
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
    patients: Patient[];
    homes: { id: number; name: string }[];
    filters: { search: string; home: string | number };
};

export default function PatientDirectory({ patients, homes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [home, setHome] = useState(String(filters.home ?? ''));

    const apply = (next?: { search?: string; home?: string }) => {
        router.get(
            '/patients',
            { search: next?.search ?? search, home: next?.home ?? home },
            { preserveState: true, replace: true },
        );
    };

    const clear = () => {
        setSearch('');
        setHome('');
        router.get('/patients', {}, { replace: true });
    };

    const hasFilters = Boolean(search || home);

    return (
        <>
            <Head title="Patients" />

            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-[#77867f] uppercase">
                            <ShieldCheck className="size-3.5 text-[#467864]" /> Your patients
                        </div>
                        <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">Patients</h1>
                        <p className="mt-2 text-sm text-[#718079]">
                            Open a patient to read their recent shifts and start a new daily note.
                        </p>
                    </div>
                    <Link
                        href="/patients/create"
                        className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#dce3df] bg-white px-5 text-sm font-semibold text-[#2f6250] transition hover:-translate-y-0.5 hover:border-[#a9c4b9]"
                    >
                        <UserRoundPlus className="size-4" /> Add patient
                    </Link>
                </header>

                <section className="animate-rise-in animation-delay-1 mt-7 rounded-[24px] border border-[#dce4df] bg-white p-4 shadow-[0_8px_28px_rgba(31,55,46,0.04)] sm:p-5">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            apply();
                        }}
                        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto]"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#87938d]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name…"
                                aria-label="Search patients by name"
                                className="h-11 w-full rounded-xl border border-[#dce3df] bg-[#fafbfa] pr-3 pl-10 text-sm font-medium text-[#4d6057] outline-none focus:border-[#83aa9b]"
                            />
                        </div>
                        <CareSelect
                            icon={House}
                            label="Filter by home"
                            placeholder="All homes"
                            value={home}
                            onChange={(value) => {
                                setHome(value);
                                apply({ home: value });
                            }}
                            options={[{ value: '', label: 'All homes' }, ...homes.map((option) => ({ value: String(option.id), label: option.name }))]}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8f0ec] px-5 text-xs font-semibold text-[#2f6250] transition hover:bg-[#dceae3]"
                            >
                                <Search className="size-4" /> Search
                            </button>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="flex h-11 items-center gap-1 rounded-xl px-3 text-[11px] font-semibold text-[#7e8a85] hover:text-[#41564d]"
                                >
                                    <X className="size-3.5" /> Clear
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <p className="mt-6 text-xs font-medium text-[#7e8b85]">
                    <span className="font-semibold text-[#42574e]">{patients.length}</span>{' '}
                    {patients.length === 1 ? 'patient' : 'patients'}
                    {hasFilters && ' matching your search'}
                </p>

                <section className="animate-rise-in animation-delay-2 mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {patients.map((patient) => (
                        <Link
                            key={patient.id}
                            href={`/patients/${patient.id}`}
                            prefetch
                            className="group flex flex-col rounded-[24px] border border-[#dde4df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#a9c4b9] hover:shadow-[0_12px_30px_rgba(31,55,46,0.08)]"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="grid size-12 shrink-0 place-items-center rounded-[16px] text-sm font-bold text-white"
                                    style={{ backgroundColor: patient.accent_colour }}
                                >
                                    {patient.initials}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-semibold">{patient.display_name}</h2>
                                    <p className="mt-0.5 truncate text-[11px] text-[#829089]">{patient.home}</p>
                                </div>
                                <ChevronRight className="ml-auto size-4 shrink-0 text-[#a0aaa5] transition group-hover:translate-x-0.5 group-hover:text-[#527066]" />
                            </div>

                            {patient.support_summary && (
                                <p className="mt-3.5 line-clamp-2 text-xs leading-5 text-[#607069]">
                                    {patient.support_summary}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#eef1ef] pt-3.5 text-[11px] text-[#7e8b85]">
                                <span>
                                    {patient.last_report_date ? `Last note ${patient.last_report_date}` : 'No notes yet'}
                                </span>
                                {patient.follow_ups_count > 0 && (
                                    <span className="ml-auto flex items-center gap-1 rounded-full bg-[#fff1dd] px-2.5 py-1 text-[9px] font-bold text-[#9a652e] uppercase">
                                        <AlertCircle className="size-3" /> {patient.follow_ups_count} follow-up
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </section>

                {patients.length === 0 && (
                    <div className="animate-rise-in animation-delay-2 mt-3 rounded-[24px] border border-[#dde4df] bg-white px-6 py-16 text-center">
                        <UserRound className="mx-auto size-7 text-[#93a099]" />
                        <h2 className="mt-4 text-base font-semibold">No patients found</h2>
                        <p className="mt-2 text-xs text-[#7c8983]">
                            {hasFilters
                                ? 'Try a different name, or clear the filters.'
                                : 'Add a patient to start their care record.'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
