import { Head, Link, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Check,
    Clock3,
    HeartPulse,
    Info,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Patient = {
    id: number;
    display_name: string;
    full_name: string;
    initials: string;
    home: string;
    accent_colour: string;
};

type EventData = {
    patient_id: number;
    daily_report_id: number | null;
    occurred_at: string;
    awareness: string[];
    facial_expressions: string[];
    body_movements: string[];
    automatic_movements: string[];
    speech: string[];
    fell: boolean;
    fall_notes: string;
    after_effects: string[];
    seizure_duration_seconds: number | string;
    recovery_duration_minutes: number | string;
    incontinence: string;
    injured: boolean;
    injury_notes: string;
    qas_called: boolean;
    incident_report_completed: boolean;
    observer_name: string;
};

const localDateTime = () => {
    const date = new Date();

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function SeizureCreate({ patient, reportId, observerName }: { patient: Patient; reportId: number | null; observerName: string }) {
    const form = useForm<EventData>({
        patient_id: patient.id,
        daily_report_id: reportId,
        occurred_at: localDateTime(),
        awareness: [],
        facial_expressions: [],
        body_movements: [],
        automatic_movements: [],
        speech: [],
        fell: false,
        fall_notes: '',
        after_effects: [],
        seizure_duration_seconds: '',
        recovery_duration_minutes: '',
        incontinence: 'none',
        injured: false,
        injury_notes: '',
        qas_called: false,
        incident_report_completed: false,
        observer_name: observerName,
    });

    const toggle = (field: 'awareness' | 'facial_expressions' | 'body_movements' | 'automatic_movements' | 'speech' | 'after_effects', value: string) => {
        const values = form.data[field];
        form.setData(field, values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    };

    return (
        <>
            <Head title="Record seizure event" />
            <div className="mx-auto max-w-[980px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
                <header className="animate-rise-in flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={reportId ? `/reports/${reportId}/edit` : '/dashboard'} className="grid size-10 place-items-center rounded-xl border border-[#dce3de] bg-white text-[#63736c] transition hover:bg-[#fafbfa]" aria-label="Go back"><ArrowLeft className="size-[18px]" /></Link>
                        <div><p className="text-[10px] font-bold tracking-[0.1em] text-[#8b716d] uppercase">Clinical event</p><h1 className="mt-1 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">Record seizure event</h1></div>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-[#e3dddc] bg-white px-3 py-2 text-[11px] font-medium text-[#75635f] sm:flex"><ShieldCheck className="size-3.5 text-[#3d715d]" /> Secure record</div>
                </header>

                <section className="animate-rise-in animation-delay-1 mt-6 rounded-[24px] border border-[#e1dddc] bg-white p-5 shadow-[0_10px_35px_rgba(56,37,32,0.045)] sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4"><div className="grid size-12 place-items-center rounded-[16px] text-sm font-bold text-white" style={{ backgroundColor: patient.accent_colour }}>{patient.initials}</div><div><p className="font-semibold">{patient.full_name}</p><p className="mt-1 text-xs text-[#7d8984]">{patient.home}</p></div></div>
                        <label className="block"><span className="mb-1.5 block text-[10px] font-bold tracking-[0.06em] text-[#89948f] uppercase">Event started</span><input type="datetime-local" value={form.data.occurred_at} onChange={(event) => form.setData('occurred_at', event.target.value)} className="h-11 rounded-xl border border-[#dce3df] bg-[#fafbfa] px-3 text-xs font-medium outline-none focus:border-[#80a999]" /></label>
                    </div>
                </section>

                <form onSubmit={(event) => {
 event.preventDefault(); form.post('/seizures'); 
}} className="animate-rise-in animation-delay-2 mt-5 space-y-5">
                    <EventCard icon={Activity} title="What was observed?" description="Select every symptom that applied during this event.">
                        <Observation label="Awareness" values={['Confused', 'Responds to voice', 'Not responsive']} selected={form.data.awareness} onToggle={(value) => toggle('awareness', value)} />
                        <Observation label="Facial expressions" values={['Staring or blank', 'Twitching', 'Pupils dilated']} selected={form.data.facial_expressions} onToggle={(value) => toggle('facial_expressions', value)} />
                        <Observation label="Body movement" values={['Whole body', 'Legs', 'Arms']} selected={form.data.body_movements} onToggle={(value) => toggle('body_movements', value)} />
                        <Observation label="Automatic movement" values={['Walking / wandering', 'Hands clapping / rubbing', 'Chewing']} selected={form.data.automatic_movements} onToggle={(value) => toggle('automatic_movements', value)} />
                        <Observation label="Speech" values={['Incoherent', 'Unable to talk normally', 'Mixing up words', 'Unable to talk']} selected={form.data.speech} onToggle={(value) => toggle('speech', value)} />
                    </EventCard>

                    <EventCard icon={Clock3} title="Timing & recovery" description="Use the most accurate times available.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <NumberField label="Seizure duration" suffix="seconds" value={form.data.seizure_duration_seconds} onChange={(value) => form.setData('seizure_duration_seconds', value)} error={form.errors.seizure_duration_seconds} required />
                            <NumberField label="Recovery period" suffix="minutes" value={form.data.recovery_duration_minutes} onChange={(value) => form.setData('recovery_duration_minutes', value)} error={form.errors.recovery_duration_minutes} />
                        </div>
                        <Observation label="After seizure" values={['Fully aware', 'Responds normally', 'Confused', 'Tired', 'Sleep', 'Agitated / irritable']} selected={form.data.after_effects} onToggle={(value) => toggle('after_effects', value)} />
                        <Choice label="Incontinence" options={[['none', 'None'], ['bowel', 'Bowel'], ['urine', 'Urine'], ['both', 'Both']]} value={form.data.incontinence} onChange={(value) => form.setData('incontinence', value)} />
                    </EventCard>

                    <EventCard icon={AlertTriangle} title="Safety follow-up" description="Falls or injuries may require additional incident records.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <YesNo label="Did the person fall?" value={form.data.fell} onChange={(value) => form.setData('fell', value)} />
                            <YesNo label="Was the person injured?" value={form.data.injured} onChange={(value) => form.setData('injured', value)} />
                        </div>
                        {form.data.fell && <TextArea label="Fall details" value={form.data.fall_notes} onChange={(value) => form.setData('fall_notes', value)} placeholder="Describe the fall and immediate response…" error={form.errors.fall_notes} />}
                        {form.data.injured && <TextArea label="Injury details" value={form.data.injury_notes} onChange={(value) => form.setData('injury_notes', value)} placeholder="Describe the injury and treatment provided…" error={form.errors.injury_notes} />}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <YesNo label="Was QAS called?" value={form.data.qas_called} onChange={(value) => form.setData('qas_called', value)} />
                            <YesNo label="Incident report completed?" value={form.data.incident_report_completed} onChange={(value) => form.setData('incident_report_completed', value)} />
                        </div>
                        <label className="block"><span className="mb-2 block text-xs font-semibold text-[#40534b]">Observer name</span><input value={form.data.observer_name} onChange={(event) => form.setData('observer_name', event.target.value)} className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3.5 text-sm outline-none focus:border-[#79a896] focus:ring-4 focus:ring-[#dcebe4]/70" />{form.errors.observer_name && <p className="mt-1 text-[11px] text-[#b35d50]">{form.errors.observer_name}</p>}</label>
                        <div className="flex items-start gap-3 rounded-2xl border border-[#e6ded6] bg-[#fffaf3] p-4 text-xs leading-5 text-[#716254]"><Info className="mt-0.5 size-4 shrink-0 text-[#ad7845]" />If a fall occurred, complete the organisation’s incident report and bruise chart according to policy.</div>
                    </EventCard>

                    <div className="flex flex-col-reverse gap-3 rounded-[22px] border border-[#dce4df] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <Link href={reportId ? `/reports/${reportId}/edit` : '/dashboard'} className="flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#697870] transition hover:bg-[#f5f7f5]">Cancel</Link>
                        <button type="submit" disabled={form.processing} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7b4942] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(123,73,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#6c3f39] disabled:opacity-50"><HeartPulse className="size-4" /> Record event</button>
                    </div>
                </form>
            </div>
        </>
    );
}

function EventCard({ icon: Icon, title, description, children }: { icon: typeof Activity; title: string; description: string; children: React.ReactNode }) {
    return <section className="rounded-[26px] border border-[#e1e4e1] bg-white p-5 shadow-[0_8px_28px_rgba(40,45,41,0.035)] sm:p-7"><div className="mb-7 flex items-start gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#f3e9e7] text-[#82544d]"><Icon className="size-[19px]" /></div><div><h2 className="text-lg font-semibold tracking-[-0.03em]">{title}</h2><p className="mt-1 text-xs text-[#7c8983]">{description}</p></div></div><div className="space-y-6">{children}</div></section>;
}

function Observation({ label, values, selected, onToggle }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
    return <fieldset><legend className="mb-2.5 text-xs font-semibold text-[#40534b]">{label}</legend><div className="flex flex-wrap gap-2">{values.map((value) => {
 const active = selected.includes(value);

 return <button key={value} type="button" onClick={() => onToggle(value)} className={cn('flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition', active ? 'border-[#a9c3b8] bg-[#e9f1ed] text-[#2f6452]' : 'border-[#dfe5e1] bg-[#fbfcfb] text-[#76847d] hover:bg-[#f5f7f5]')}>{active && <Check className="size-3.5" />}{value}</button>; 
})}</div></fieldset>;
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
    return <fieldset><legend className="mb-2 text-xs font-semibold text-[#40534b]">{label}</legend><div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f3f5f3] p-1.5"><button type="button" onClick={() => onChange(true)} className={cn('h-10 rounded-xl text-xs font-semibold transition', value ? 'bg-white text-[#875047] shadow-sm' : 'text-[#7b8982]')}>Yes</button><button type="button" onClick={() => onChange(false)} className={cn('h-10 rounded-xl text-xs font-semibold transition', !value ? 'bg-white text-[#356752] shadow-sm' : 'text-[#7b8982]')}>No</button></div></fieldset>;
}

function Choice({ label, options, value, onChange }: { label: string; options: string[][]; value: string; onChange: (value: string) => void }) {
    return <fieldset><legend className="mb-2 text-xs font-semibold text-[#40534b]">{label}</legend><div className="flex flex-wrap gap-2">{options.map(([key, text]) => <button key={key} type="button" onClick={() => onChange(key)} className={cn('h-10 rounded-xl border px-4 text-[11px] font-semibold transition', value === key ? 'border-[#a8c2b7] bg-[#e9f1ed] text-[#2f6452]' : 'border-[#dfe5e1] bg-white text-[#77847e]')}>{text}</button>)}</div></fieldset>;
}

function NumberField({ label, suffix, value, onChange, error, required = false }: { label: string; suffix: string; value: string | number; onChange: (value: string) => void; error?: string; required?: boolean }) {
    return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#40534b]">{label}{required && <span className="text-[#a95f53]"> *</span>}</span><div className="relative"><input type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3.5 pr-20 text-sm outline-none focus:border-[#79a896] focus:ring-4 focus:ring-[#dcebe4]/70" /><span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-semibold text-[#8b9691]">{suffix}</span></div>{error && <p className="mt-1 text-[11px] text-[#b35d50]">{error}</p>}</label>;
}

function TextArea({ label, value, onChange, placeholder, error }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; error?: string }) {
    return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#40534b]">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="w-full resize-none rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-[#a6afaa] focus:border-[#79a896] focus:ring-4 focus:ring-[#dcebe4]/70" />{error && <p className="mt-1 text-[11px] text-[#b35d50]">{error}</p>}</label>;
}
