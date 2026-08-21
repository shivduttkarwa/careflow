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
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';
import { useState } from 'react';
import CareSelect from '@/components/care-select';

type Report = {
    id: number;
    patient: string;
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
    patients: Option[];
    homes: Option[];
    workers: Option[];
    filters: Record<string, string | undefined>;
};

export default function ReportHistory({ reports, patients, homes, workers, filters }: Props) {
    const [patient, setPatient] = useState(filters.patient ?? '');
    const [home, setHome] = useState(filters.home ?? '');
    const [worker, setWorker] = useState(filters.worker ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyFilters = () => {
        router.get('/reports', { patient, home, worker, from, to }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setPatient(''); setHome(''); setWorker(''); setFrom(''); setTo('');
        router.get('/reports', {}, { replace: true });
    };

    const hasFilters = Boolean(patient || home || worker || from || to);

    const appliedQuery = new URLSearchParams(
        Object.entries({ patient, home, worker, from, to }).filter(([, value]) => value !== ''),
    ).toString();

    return (
        <>
            <Head title="Care history" />
            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-[#77867f] uppercase"><ShieldCheck className="size-3.5 text-[#467864]" /> Secure records</div>
                        <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">Care history</h1>
                        <p className="mt-2 text-sm text-[#718079]">Review previous shifts and follow-ups in one place.</p>
                    </div>
                    <Link href={patients.length > 0 ? '/reports/create' : '/patients/create'} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#285b4c] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,91,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204d40]">
                        <ClipboardPlus className="size-4" /> {patients.length > 0 ? 'New daily note' : 'Add patient'}
                    </Link>
                </header>

                <section className="animate-rise-in animation-delay-1 mt-7 rounded-[24px] border border-[#dce4df] bg-white p-4 shadow-[0_8px_28px_rgba(31,55,46,0.04)] sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#465950]"><Filter className="size-4 text-[#688078]" /> Filter records</div>
                        {hasFilters && <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-semibold text-[#7e8a85] hover:text-[#41564d]"><X className="size-3.5" /> Clear</button>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_150px_150px_auto]">
                        <FilterSelect icon={House} value={home} onChange={setHome} placeholder="All homes" options={homes} />
                        <FilterSelect icon={UserRound} value={patient} onChange={setPatient} placeholder="All patients" options={patients} />
                        <FilterSelect icon={UserRound} value={worker} onChange={setWorker} placeholder="All workers" options={workers} />
                        <DateFilter value={from} onChange={setFrom} label="From date" />
                        <DateFilter value={to} onChange={setTo} label="To date" />
                        <button type="button" onClick={applyFilters} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e8f0ec] px-5 text-xs font-semibold text-[#2f6250] transition hover:bg-[#dceae3]"><Search className="size-4" /> Apply</button>
                    </div>
                </section>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-[#7e8b85]"><span className="font-semibold text-[#42574e]">{reports.total}</span> care records{hasFilters && ' matching these filters'}</p>
                    {reports.total > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <a href={`/reports/export?${appliedQuery}`} className="flex h-10 items-center gap-2 rounded-xl border border-[#dce3df] bg-white px-4 text-xs font-semibold text-[#4d6057] transition hover:border-[#a9c4b9] hover:text-[#2f6250]"><Sheet className="size-4 text-[#688078]" /> Export spreadsheet</a>
                            <a href={`/reports/book?${appliedQuery}`} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-xl border border-[#dce3df] bg-white px-4 text-xs font-semibold text-[#4d6057] transition hover:border-[#a9c4b9] hover:text-[#2f6250]"><BookOpen className="size-4 text-[#688078]" /> Care book PDF</a>
                        </div>
                    )}
                </div>

                <section className="animate-rise-in animation-delay-2 mt-3 overflow-hidden rounded-[24px] border border-[#dde4df] bg-white">
                    {reports.data.length > 0 ? (
                        <div className="divide-y divide-[#e8ece9]">
                            {reports.data.map((report) => (
                                <Link key={report.id} href={report.status === 'draft' ? `/reports/${report.id}/edit` : `/reports/${report.id}`} prefetch className="group grid gap-4 p-5 transition hover:bg-[#fafcfa] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-11 shrink-0 place-items-center rounded-[15px] text-xs font-bold text-white" style={{ backgroundColor: report.accent_colour }}>{report.initials}</div>
                                        <div className="sm:hidden"><p className="text-sm font-semibold">{report.patient}</p><p className="mt-0.5 text-[11px] text-[#829089]">{report.date_label}</p></div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="hidden items-center gap-2 sm:flex">
                                            <h2 className="text-sm font-semibold">{report.patient}</h2>
                                            <span className="rounded-full bg-[#f0f3f0] px-2 py-0.5 text-[9px] font-bold tracking-[0.05em] text-[#76837d] uppercase">{report.home}</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#7e8b85]">
                                            <span className="hidden sm:inline">{report.date_label}</span><span className="hidden sm:inline">·</span><span className="capitalize">{report.shift_type} shift</span><span>·</span><span>{report.worker}</span>
                                        </div>
                                        {report.handover_notes && <p className="mt-2 line-clamp-1 text-xs text-[#607069]">{report.handover_notes}</p>}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                        <div className="flex flex-wrap gap-2">
                                            {report.status === 'draft' && <span className="rounded-full bg-[#eef0f5] px-2.5 py-1 text-[9px] font-bold text-[#66708a] uppercase">Draft</span>}
                                            {report.follow_up_required && <span className="flex items-center gap-1 rounded-full bg-[#fff1dd] px-2.5 py-1 text-[9px] font-bold text-[#9a652e] uppercase"><AlertCircle className="size-3" /> Follow-up</span>}
                                            {report.seizure_events_count > 0 && <span className="rounded-full bg-[#f4e9e7] px-2.5 py-1 text-[9px] font-bold text-[#9a5a50] uppercase">{report.seizure_events_count} seizure</span>}
                                        </div>
                                        <ChevronRight className="size-4 text-[#a0aaa5] transition group-hover:translate-x-0.5 group-hover:text-[#527066]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-16 text-center"><CalendarDays className="mx-auto size-7 text-[#93a099]" /><h2 className="mt-4 text-base font-semibold">No care records found</h2><p className="mt-2 text-xs text-[#7c8983]">{patients.length > 0 ? 'Create a new daily note to begin the care history.' : 'Add a patient to create the first daily note.'}</p></div>
                    )}
                </section>

                {reports.last_page > 1 && (
                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3">
                        <Link href={reports.prev_page_url ?? '#'} className={`flex items-center gap-1.5 text-xs font-semibold ${reports.prev_page_url ? 'text-[#496159]' : 'pointer-events-none text-[#bdc5c1]'}`}><ChevronLeft className="size-4" /> Previous</Link>
                        <span className="text-[11px] font-medium text-[#7d8984]">Page {reports.current_page} of {reports.last_page}</span>
                        <Link href={reports.next_page_url ?? '#'} className={`flex items-center gap-1.5 text-xs font-semibold ${reports.next_page_url ? 'text-[#496159]' : 'pointer-events-none text-[#bdc5c1]'}`}>Next <ChevronRight className="size-4" /></Link>
                    </div>
                )}
            </div>
        </>
    );
}

function FilterSelect({ icon: Icon, value, onChange, placeholder, options }: { icon: typeof UserRound; value: string; onChange: (value: string) => void; placeholder: string; options: Option[] }) {
    return (
        <CareSelect
            icon={Icon}
            label={placeholder}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            options={[{ value: '', label: placeholder }, ...options.map((option) => ({ value: String(option.id), label: option.name }))]}
        />
    );
}

function DateFilter({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
    return <div className="relative"><CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#87938d]" /><input type="date" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[#dce3df] bg-[#fafbfa] pr-3 pl-10 text-xs font-medium text-[#4d6057] outline-none transition hover:border-[#bed0c7] hover:bg-white focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#dcebe4]/70" /></div>;
}
