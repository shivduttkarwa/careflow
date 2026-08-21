import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpenCheck,
    Check,
    ChevronRight,
    CircleDot,
    Clock3,
    Droplets,
    FileCheck2,
    HeartPulse,
    Plus,
    ShieldCheck,
    Sparkles,
    Users,
    Utensils,
    UserRoundPlus,
} from 'lucide-react';

type Patient = {
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
    patient: Patient;
};

type ReportSummary = {
    id: number;
    patient_name: string;
    patient_initials: string;
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
    patientCount: number;
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

export default function Dashboard({ patientCount, currentShift, recentReports, announcement, stats }: Props) {
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
        : `/reports/create${currentShift ? `?patient=${currentShift.patient.id}` : ''}`;
    const statCards = [
        { icon: FileCheck2, value: stats.reports_this_week, label: 'Reports this week' },
        { icon: AlertCircle, value: stats.open_follow_ups, label: 'Open follow-ups' },
        { icon: HeartPulse, value: stats.seizures_this_month, label: 'Seizures this month' },
    ];

    const isManager = auth.user.role === 'manager' || auth.user.role === 'administrator';

    const emptyState = patientCount === 0
        ? {
              icon: <UserRoundPlus className="mx-auto size-8 text-[#648477]" />,
              title: 'Add your first patient',
              body: 'Start with a patient name, then create their first daily care note.',
              href: '/patients/create',
              action: <><UserRoundPlus className="size-4" /> Add patient</>,
          }
        : isManager
          ? {
                icon: <Users className="mx-auto size-7 text-[#789086]" />,
                title: 'Service overview',
                body: `You are not rostered on a shift. ${patientCount} ${patientCount === 1 ? 'patient is' : 'patients are'} being supported across your homes right now.`,
                href: '/patients',
                action: <><Users className="size-4" /> View patients</>,
            }
          : {
                icon: <Clock3 className="mx-auto size-7 text-[#789086]" />,
                title: 'No current shift',
                body: 'You can still start a daily note for an assigned patient.',
                href: '/reports/create',
                action: <><Plus className="size-4" /> Start daily note</>,
            };

    return (
        <>
            <Head title="Overview" />

            <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-[#6f7f78] uppercase">
                            <span className="size-1.5 rounded-full bg-[#4d9078]" />
                            {today}
                        </div>
                        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.045em] text-[#17251f] sm:text-[36px]">
                            {timeGreeting()}, {firstName}
                        </h1>
                        <p className="mt-2 text-sm text-[#718079]">Everything you need for a calm, informed shift.</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link href="/patients/create" className="flex h-10 items-center gap-2 rounded-xl bg-[#285b4c] px-4 text-xs font-semibold text-white shadow-[0_7px_18px_rgba(40,91,76,0.16)] transition hover:-translate-y-0.5 hover:bg-[#204d40]">
                            <UserRoundPlus className="size-4" /> Add patient
                        </Link>
                        <div className="hidden items-center gap-2 rounded-full border border-[#dce5df] bg-white px-3.5 py-2 text-xs font-medium text-[#4e625a] shadow-[0_3px_12px_rgba(30,55,45,0.04)] sm:flex">
                            <ShieldCheck className="size-4 text-[#34735d]" />
                            Secure session
                        </div>
                    </div>
                </header>

                <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
                    <section className="animate-rise-in animation-delay-1 overflow-hidden rounded-[26px] border border-[#d9e2dc] bg-white shadow-[0_10px_35px_rgba(32,55,46,0.055)]">
                        {currentShift ? (
                            <>
                                <div className="flex flex-col gap-6 p-6 sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="grid size-14 place-items-center rounded-[18px] text-base font-bold text-white shadow-[0_8px_20px_rgba(40,77,64,0.16)]"
                                                style={{ backgroundColor: currentShift.patient.accent_colour }}
                                            >
                                                {currentShift.patient.initials}
                                            </div>
                                            <div>
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-[11px] font-bold tracking-[0.1em] text-[#75847d] uppercase">Current shift</span>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f2ed] px-2 py-0.5 text-[10px] font-bold text-[#34735d] uppercase">
                                                        <CircleDot className="size-2.5" /> Live
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-semibold tracking-[-0.035em]">Supporting {currentShift.patient.display_name}</h2>
                                                <p className="mt-1 text-xs text-[#718078]">{currentShift.patient.home}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-[#f3f6f3] px-4 py-3 text-right">
                                            <p className="text-xs font-semibold text-[#30453d]">{currentShift.start_label} – {currentShift.end_label}</p>
                                            <p className="mt-0.5 text-[10px] font-medium text-[#85918c] uppercase">8 hour shift</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-[#76857e]">
                                            <span>Shift progress</span>
                                            <span>{currentShift.progress}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#edf1ed]">
                                            <div className="h-full rounded-full bg-[#3e7b66] transition-[width] duration-700 ease-out" style={{ width: `${currentShift.progress}%` }} />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#e2e8e3] bg-[#f8faf8] p-4">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#b47a42]" />
                                            <div>
                                                <p className="text-xs font-semibold text-[#394d45]">Support preference</p>
                                                <p className="mt-1 text-xs leading-5 text-[#6d7b75]">{currentShift.patient.support_summary}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Link href={reportHref} className="group flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#285b4c] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(40,91,76,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#204d40] hover:shadow-[0_14px_28px_rgba(40,91,76,0.24)]">
                                            {currentShift.report_id ? 'Continue daily note' : 'Start daily note'}
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                        <Link href={`/seizures/create?patient=${currentShift.patient.id}${currentShift.report_id ? `&report=${currentShift.report_id}` : ''}`} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#d9e1dc] bg-white px-5 text-sm font-semibold text-[#465a52] transition hover:border-[#c9d7cf] hover:bg-[#f8faf8]">
                                            <Plus className="size-4" /> Record seizure event
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 border-t border-[#e3e8e4] bg-[#fafbfa]">
                                    {statCards.map(({ icon: Icon, value, label }, index) => (
                                        <div key={label} className={`px-3 py-4 text-center sm:px-5 ${index > 0 ? 'border-l border-[#e4e9e5]' : ''}`}>
                                            <Icon className="mx-auto mb-1.5 size-4 text-[#6e847b]" />
                                            <p className="text-lg font-semibold tracking-[-0.03em] text-[#263b33]">{value}</p>
                                            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.04em] text-[#8a9691] uppercase sm:text-[10px]">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="p-10 text-center">
                                {emptyState.icon}
                                <h2 className="mt-4 text-lg font-semibold">{emptyState.title}</h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74827c]">{emptyState.body}</p>
                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                                    <Link href={emptyState.href} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#285b4c] px-5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(40,91,76,0.16)] transition hover:-translate-y-0.5 hover:bg-[#204d40]">
                                        {emptyState.action}
                                    </Link>
                                    {isManager && patientCount > 0 && (
                                        <Link href="/reports" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e1dc] bg-white px-5 text-xs font-semibold text-[#465a52] transition hover:border-[#c9d7cf] hover:bg-[#f8faf8]">
                                            <FileCheck2 className="size-4" /> Review care records
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="animate-rise-in animation-delay-2 rounded-[26px] border border-[#e1dfd4] bg-[#fffdf8] p-6 shadow-[0_10px_35px_rgba(56,52,35,0.04)] sm:p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.1em] text-[#8a8068] uppercase">Latest handover</p>
                                <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em]">Before you begin</h2>
                            </div>
                            <BookOpenCheck className="size-5 text-[#9b7d4d]" />
                        </div>

                        {latestHandover ? (
                            <>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="grid size-10 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: latestHandover.accent_colour }}>
                                        {latestHandover.patient_initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold capitalize">{latestHandover.date_label} · {latestHandover.shift_type}</p>
                                        <p className="mt-0.5 text-[11px] text-[#837e70]">Submitted by {latestHandover.worker}</p>
                                    </div>
                                </div>

                                <div className={`mt-5 rounded-2xl border p-4 ${latestHandover.follow_up_required ? 'border-[#ead9bd] bg-[#fff9ed]' : 'border-[#dfe7e1] bg-white'}`}>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#5b5140]">
                                        {latestHandover.follow_up_required ? <AlertCircle className="size-4 text-[#b97b3e]" /> : <Check className="size-4 text-[#3f8068]" />}
                                        {latestHandover.follow_up_required ? 'Follow-up requested' : 'No outstanding concerns'}
                                    </div>
                                    <p className="text-xs leading-5 text-[#746b5d]">{latestHandover.handover_notes || 'No additional handover notes were recorded.'}</p>
                                </div>

                                <Link href={`/reports/${latestHandover.id}`} className="mt-5 flex h-11 items-center justify-between rounded-xl px-1 text-xs font-semibold text-[#725f3f] transition hover:text-[#4f412b]">
                                    Review full handover <ChevronRight className="size-4" />
                                </Link>
                            </>
                        ) : (
                            <p className="mt-6 text-sm text-[#7c786c]">No previous handover is available.</p>
                        )}
                    </section>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <section className="animate-rise-in animation-delay-2 rounded-[26px] border border-[#dfe5e0] bg-white p-6 sm:p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold tracking-[-0.03em]">Recent care notes</h2>
                                <p className="mt-1 text-xs text-[#7c8983]">A quick view of recent shifts</p>
                            </div>
                            <Link href="/reports" className="text-xs font-semibold text-[#39705e] hover:text-[#244e40]">View all</Link>
                        </div>

                        <div className="mt-5 divide-y divide-[#e8ece9]">
                            {recentReports.slice(0, 3).map((report) => (
                                <Link key={report.id} href={`/reports/${report.id}`} prefetch className="group flex items-center gap-3 py-4 first:pt-1 last:pb-0">
                                    <div className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#edf3ef] text-[#3b6859]">
                                        {report.shift_type === 'night' ? <Clock3 className="size-4" /> : <FileCheck2 className="size-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold capitalize">{report.shift_type} shift</p>
                                            {report.follow_up_required && <span className="size-1.5 rounded-full bg-[#d58a4e]" />}
                                        </div>
                                        <p className="mt-1 truncate text-[11px] text-[#7f8b86]">{report.date_label} · {report.worker}</p>
                                    </div>
                                    <ChevronRight className="size-4 text-[#a3ada8] transition group-hover:translate-x-0.5 group-hover:text-[#557268]" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {announcement && (
                        <section className="animate-rise-in animation-delay-3 rounded-[26px] border border-[#dbe4df] bg-[#eaf2ee] p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="grid size-10 place-items-center rounded-[14px] bg-white/80 text-[#32624f] shadow-sm"><Utensils className="size-[18px]" /></div>
                                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-[#6a7d74] uppercase">Team notice</span>
                            </div>
                            <h2 className="mt-5 text-base font-semibold tracking-[-0.025em]">{announcement.title}</h2>
                            <p className="mt-2 text-xs leading-5 text-[#607269]">{announcement.body}</p>
                            {announcement.acknowledged ? (
                                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#39705d]"><Check className="size-4" /> Acknowledged</div>
                            ) : (
                                <Link href={`/announcements/${announcement.id}/acknowledge`} method="post" as="button" className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-[#315c4d] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <Check className="size-4" /> Mark as reviewed
                                </Link>
                            )}
                        </section>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-medium text-[#98a39e]">
                    <Droplets className="size-3.5" /> Patient information is encrypted and access is logged
                </div>
            </div>
        </>
    );
}
