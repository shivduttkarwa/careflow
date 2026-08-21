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

type Patient = {
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
    patient: Patient;
    reports: Report[];
    stats: { total_reports: number; open_follow_ups: number; seizures_this_month: number };
    careTeam: { id: number; name: string }[];
};

export default function PatientProfile({ patient, reports, stats, careTeam }: Props) {
    return (
        <>
            <Head title={patient.display_name} />

            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <Link
                    href="/patients"
                    className="animate-rise-in inline-flex items-center gap-1.5 text-xs font-semibold text-[#667870] transition hover:text-[#2c5748]"
                >
                    <ArrowLeft className="size-4" /> All patients
                </Link>

                <header className="animate-rise-in mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div
                            className="grid size-14 shrink-0 place-items-center rounded-[18px] text-base font-bold text-white"
                            style={{ backgroundColor: patient.accent_colour }}
                        >
                            {patient.initials}
                        </div>
                        <div>
                            <h1 className="text-[28px] font-semibold tracking-[-0.045em] sm:text-[34px]">
                                {patient.display_name}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#718079]">
                                <span>{patient.full_name}</span>
                                <span>·</span>
                                <span>{patient.home}</span>
                                {patient.date_of_birth && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            {patient.date_of_birth}
                                            {patient.age !== null && ` (${patient.age})`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/reports/create?patient=${patient.id}`}
                        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#285b4c] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,91,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204d40]"
                    >
                        <ClipboardPlus className="size-4" /> New daily note
                    </Link>
                </header>

                <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="animate-rise-in animation-delay-1 space-y-5">
                        <section className="rounded-[24px] border border-[#dde4df] bg-white">
                            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    <FileClock className="size-4 text-[#688078]" /> Recent shifts
                                </h2>
                                <Link
                                    href={`/reports?patient=${patient.id}`}
                                    className="text-[11px] font-semibold text-[#4d7a68] hover:text-[#2f6250]"
                                >
                                    View all
                                </Link>
                            </div>

                            {reports.length > 0 ? (
                                <div className="divide-y divide-[#e8ece9] border-t border-[#e8ece9]">
                                    {reports.map((report) => (
                                        <Link
                                            key={report.id}
                                            href={report.status === 'draft' ? `/reports/${report.id}/edit` : `/reports/${report.id}`}
                                            prefetch
                                            className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafcfa] sm:px-6"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="text-sm font-semibold">{report.date_label}</span>
                                                    <span className="text-[11px] text-[#7e8b85] capitalize">
                                                        {report.shift_type} shift
                                                    </span>
                                                    <span className="text-[11px] text-[#7e8b85]">· {report.worker}</span>
                                                </div>
                                                {report.handover_notes && (
                                                    <p className="mt-1 line-clamp-1 text-xs text-[#607069]">
                                                        {report.handover_notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                                                {report.status === 'draft' && (
                                                    <span className="rounded-full bg-[#eef0f5] px-2.5 py-1 text-[9px] font-bold text-[#66708a] uppercase">
                                                        Draft
                                                    </span>
                                                )}
                                                {report.follow_up_required && (
                                                    <span className="flex items-center gap-1 rounded-full bg-[#fff1dd] px-2.5 py-1 text-[9px] font-bold text-[#9a652e] uppercase">
                                                        <AlertCircle className="size-3" /> Follow-up
                                                    </span>
                                                )}
                                                {report.seizure_events_count > 0 && (
                                                    <span className="rounded-full bg-[#f4e9e7] px-2.5 py-1 text-[9px] font-bold text-[#9a5a50] uppercase">
                                                        {report.seizure_events_count} seizure
                                                    </span>
                                                )}
                                            </div>

                                            <ChevronRight className="size-4 shrink-0 text-[#a0aaa5] transition group-hover:translate-x-0.5 group-hover:text-[#527066]" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-t border-[#e8ece9] px-6 py-14 text-center">
                                    <FileClock className="mx-auto size-7 text-[#93a099]" />
                                    <h3 className="mt-4 text-base font-semibold">No care records yet</h3>
                                    <p className="mt-2 text-xs text-[#7c8983]">
                                        Start the first daily note for {patient.display_name}.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="animate-rise-in animation-delay-2 space-y-4">
                        {patient.support_summary && (
                            <div className="rounded-[24px] border border-[#dbe5df] bg-[#eaf2ee] p-6">
                                <h2 className="text-sm font-semibold tracking-[-0.02em]">Support preferences</h2>
                                <p className="mt-2.5 text-xs leading-5 text-[#4f6259]">{patient.support_summary}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <Stat label="Records" value={stats.total_reports} />
                            <Stat label="Follow-ups" value={stats.open_follow_ups} />
                            <Stat label="Seizures" value={stats.seizures_this_month} />
                        </div>

                        <div className="rounded-[24px] border border-[#dce4df] bg-white p-6">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                <Users className="size-4 text-[#688078]" /> Care team
                            </h2>
                            <ul className="mt-3.5 space-y-2">
                                {careTeam.map((member) => (
                                    <li key={member.id} className="text-xs font-medium text-[#4f6259]">
                                        {member.name}
                                    </li>
                                ))}
                                {careTeam.length === 0 && (
                                    <li className="text-xs text-[#8b9791]">No support workers assigned yet.</li>
                                )}
                            </ul>
                        </div>

                        <Link
                            href={`/seizures/create?patient=${patient.id}`}
                            className="flex items-center gap-2.5 rounded-[24px] border border-[#e5dcd9] bg-[#fdf8f7] p-5 text-xs font-semibold text-[#8a5348] transition hover:border-[#d9c2bc]"
                        >
                            <Activity className="size-4" /> Record a seizure observation
                        </Link>
                    </aside>
                </div>
            </div>
        </>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-[18px] border border-[#dce4df] bg-white px-3 py-4 text-center">
            <p className="text-xl font-semibold tracking-[-0.03em] text-[#2f4a41]">{value}</p>
            <p className="mt-1 text-[9px] font-bold tracking-[0.06em] text-[#8b9791] uppercase">{label}</p>
        </div>
    );
}
