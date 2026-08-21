import { Head, Link } from '@inertiajs/react';
import type {
    BedDouble} from 'lucide-react';
import {
    AlertCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Download,
    Droplets,
    HeartPulse,
    MoonStar,
    ShieldCheck,
    ShowerHead,
    UtensilsCrossed,
} from 'lucide-react';

type Report = {
    id: number;
    status: string;
    report_date: string;
    shift_type: string;
    shift_label?: string;
    worker?: string;
    submitted_at?: string;
    patient: {
        id: number;
        display_name: string;
        full_name: string;
        initials: string;
        home: string;
        accent_colour: string;
    };
    shower_taken: boolean | null;
    bed_bath: boolean | null;
    personal_care_notes?: string;
    physio_completed: boolean | null;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
    fluids_ml?: number;
    fluids_notes?: string;
    food_notes?: string;
    bowel_opened: boolean | null;
    bowel_texture?: string;
    bowel_notes?: string;
    urine_status?: string;
    urine_notes?: string;
    sleep_from?: string;
    sleep_to?: string;
    overnight_observations?: string;
    overnight_attendance?: string;
    follow_up_required: boolean;
    handover_notes?: string;
    seizure_events: { id: number; occurred_at: string; duration_seconds?: number; injured: boolean }[];
};

export default function ReportShow({ report, previousId, nextId }: { report: Report; previousId: number | null; nextId: number | null }) {
    const dateLabel = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${report.report_date}T12:00:00`));

    return (
        <>
            <Head title={`${report.patient.display_name} · ${dateLabel}`} />
            <div className="mx-auto max-w-[1050px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
                <header className="animate-rise-in flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/reports" className="grid size-10 place-items-center rounded-xl border border-[#dce3de] bg-white text-[#63736c] transition hover:bg-[#fafbfa]" aria-label="Back to history"><ArrowLeft className="size-[18px]" /></Link>
                        <div><p className="text-[10px] font-bold tracking-[0.1em] text-[#7e8b85] uppercase">Submitted care record</p><h1 className="mt-1 text-xl font-semibold tracking-[-0.035em]">Daily care note</h1></div>
                    </div>
                    <div className="flex gap-2">
                        <a href={`/reports/${report.id}/print`} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-xl border border-[#dce3df] bg-white px-3.5 text-xs font-semibold text-[#506159] transition hover:bg-[#f9faf9]"><Download className="size-4" /> Export PDF</a>
                    </div>
                </header>

                <section className="animate-rise-in animation-delay-1 mt-6 overflow-hidden rounded-[26px] border border-[#dce4df] bg-white shadow-[0_10px_35px_rgba(31,55,46,0.045)]">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="grid size-14 place-items-center rounded-[18px] text-base font-bold text-white" style={{ backgroundColor: report.patient.accent_colour }}>{report.patient.initials}</div>
                                <div><h2 className="text-xl font-semibold tracking-[-0.035em]">{report.patient.full_name}</h2><p className="mt-1 text-xs text-[#79867f]">{report.patient.home}</p></div>
                            </div>
                            <div className="sm:text-right"><p className="text-sm font-semibold">{dateLabel}</p><p className="mt-1 text-xs capitalize text-[#7b8882]">{report.shift_type} shift{report.shift_label ? ` · ${report.shift_label}` : ''}</p></div>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#e7ebe8] pt-5">
                            <div className="flex items-center gap-2 rounded-full bg-[#e8f2ed] px-3 py-1.5 text-[10px] font-bold text-[#34705a] uppercase"><ShieldCheck className="size-3.5" /> Locked record</div>
                            <p className="text-xs text-[#798680]">Submitted by <span className="font-semibold text-[#4a5c54]">{report.worker}</span></p>
                        </div>
                    </div>

                    {report.follow_up_required && (
                        <div className="border-y border-[#ead9bc] bg-[#fff9ec] px-6 py-5 sm:px-8">
                            <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 size-5 shrink-0 text-[#b5793c]" /><div><p className="text-xs font-bold tracking-[0.04em] text-[#865d31] uppercase">Follow-up requested</p><p className="mt-1.5 text-sm leading-6 text-[#675943]">{report.handover_notes}</p></div></div>
                        </div>
                    )}

                    <div className="space-y-0 px-6 sm:px-8">
                        <RecordSection icon={ShowerHead} title="Personal care">
                            <RecordGrid items={[
                                ['Shower', yesNo(report.shower_taken)], ['Bed bath', yesNo(report.bed_bath)], ['Physio completed', yesNo(report.physio_completed)], ['Notes', report.personal_care_notes || 'No additional notes'],
                            ]} />
                        </RecordSection>

                        <RecordSection icon={UtensilsCrossed} title="Food & fluids" highlighted>
                            <RecordGrid items={[
                                ['Breakfast', report.breakfast || 'Not recorded'], ['Lunch', report.lunch || 'Not recorded'], ['Dinner', report.dinner || 'Not recorded'], ['Snacks', report.snacks || 'Not recorded'], ['Total fluids', report.fluids_ml ? `${report.fluids_ml} mL` : 'Not recorded'], ['Fluid notes', report.fluids_notes || 'No notes'], ['Anything else', report.food_notes || 'Nothing additional'],
                            ]} />
                        </RecordSection>

                        <RecordSection icon={Droplets} title="Bowel & urine" highlighted>
                            <RecordGrid items={[
                                ['Bowel opened', yesNo(report.bowel_opened)], ['Texture', report.bowel_texture || 'Not applicable'], ['Bowel notes', report.bowel_notes || 'No notes'], ['Urine', pretty(report.urine_status) || 'Not recorded'], ['Urine notes', report.urine_notes || 'No notes'],
                            ]} />
                        </RecordSection>

                        <RecordSection icon={MoonStar} title="Overnight">
                            <RecordGrid items={[
                                ['Sleep time', report.sleep_from || report.sleep_to ? `${trimTime(report.sleep_from)} – ${trimTime(report.sleep_to)}` : 'Not recorded'], ['Observations', report.overnight_observations || 'No overnight observations'], ['Attendance', report.overnight_attendance || 'No attendance recorded'],
                            ]} />
                        </RecordSection>

                        <RecordSection icon={ClipboardCheck} title="Handover">
                            <div className="rounded-2xl bg-[#f7f9f7] p-4 text-sm leading-6 text-[#506159]">{report.handover_notes || 'No additional handover notes.'}</div>
                        </RecordSection>

                        {report.seizure_events.length > 0 && (
                            <RecordSection icon={HeartPulse} title={`Seizure events (${report.seizure_events.length})`}>
                                <div className="space-y-2">{report.seizure_events.map((event) => <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#eadfdd] bg-[#fdf9f8] p-4"><div><p className="text-xs font-semibold">{new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.occurred_at))}</p><p className="mt-1 text-[11px] text-[#826f6b]">Duration: {event.duration_seconds ? `${event.duration_seconds} seconds` : 'Not recorded'}</p></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${event.injured ? 'bg-[#f5dfdc] text-[#9a554b]' : 'bg-[#e7f0eb] text-[#3d705d]'}`}>{event.injured ? 'Injury recorded' : 'No injury'}</span></div>)}</div>
                            </RecordSection>
                        )}
                    </div>
                </section>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    {previousId ? <Link href={`/reports/${previousId}`} prefetch className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#dce3df] bg-white text-xs font-semibold text-[#54665e] transition hover:bg-[#fafbfa]"><ChevronLeft className="size-4" /> Previous shift</Link> : <div />}
                    {nextId ? <Link href={`/reports/${nextId}`} prefetch className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#dce3df] bg-white text-xs font-semibold text-[#54665e] transition hover:bg-[#fafbfa]">Next shift <ChevronRight className="size-4" /></Link> : <div />}
                </div>
            </div>
        </>
    );
}

function RecordSection({ icon: Icon, title, highlighted = false, children }: { icon: typeof BedDouble; title: string; highlighted?: boolean; children: React.ReactNode }) {
    return <section className="border-b border-[#e8ece9] py-7 last:border-0"><div className="mb-5 flex items-center gap-3"><div className={`grid size-9 place-items-center rounded-xl ${highlighted ? 'bg-[#fff1c9] text-[#8e6925]' : 'bg-[#eaf1ed] text-[#376b59]'}`}><Icon className="size-4" /></div><h3 className="text-sm font-semibold tracking-[-0.015em]">{title}</h3></div>{children}</section>;
}

function RecordGrid({ items }: { items: (string | undefined)[][] }) {
    return <dl className="grid gap-x-7 gap-y-5 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-[10px] font-bold tracking-[0.07em] text-[#8a9690] uppercase">{label}</dt><dd className="mt-1.5 text-sm leading-6 text-[#4e6058]">{value}</dd></div>)}</dl>;
}

const yesNo = (value: boolean | null) => value === null ? 'Not recorded' : value ? 'Yes' : 'No';
const pretty = (value?: string) => value ? value.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '';
const trimTime = (value?: string) => value ? value.slice(0, 5) : '—';
