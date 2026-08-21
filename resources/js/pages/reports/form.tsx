import { Head, Link, useForm } from '@inertiajs/react';
import type {
    BedDouble} from 'lucide-react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronLeft,
    ClipboardCheck,
    Droplets,
    Info,
    MoonStar,
    Save,
    ShieldCheck,
    ShowerHead,
    UtensilsCrossed,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CareDate from '@/components/care-date';
import CareSelect from '@/components/care-select';
import { cn } from '@/lib/utils';

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
    label: string;
};

type ReportData = {
    patient_id: number;
    shift_id: number | null;
    report_date: string;
    shift_type: 'day' | 'evening' | 'night';
    shower_taken: boolean | null;
    bed_bath: boolean | null;
    personal_care_notes: string;
    physio_completed: boolean | null;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
    fluids_ml: number | string;
    fluids_notes: string;
    food_notes: string;
    bowel_opened: boolean | null;
    bowel_texture: string;
    bowel_notes: string;
    urine_status: 'normal' | 'concern' | 'not-observed' | '';
    urine_notes: string;
    sleep_from: string;
    sleep_to: string;
    overnight_observations: string;
    overnight_attendance: string;
    follow_up_required: boolean;
    handover_notes: string;
};

type ExistingReport = ReportData & {
    id: number;
    status: string;
};

type Props = {
    report: ExistingReport | null;
    patients: Patient[];
    selectedPatient: Patient;
    shift: Shift | null;
};

const shiftTypes = [
    { value: 'day', label: 'Day shift', hint: 'Morning through afternoon' },
    { value: 'evening', label: 'Evening shift', hint: 'Afternoon through late evening' },
    { value: 'night', label: 'Night shift', hint: 'Overnight cover' },
];

const bowelTextures = [
    { value: 'Type 1 – separate hard lumps', label: 'Type 1 – separate hard lumps' },
    { value: 'Type 2 – lumpy sausage', label: 'Type 2 – lumpy sausage' },
    { value: 'Type 3 – cracked sausage', label: 'Type 3 – cracked sausage' },
    { value: 'Type 4 – smooth and soft', label: 'Type 4 – smooth and soft' },
    { value: 'Type 5 – soft blobs', label: 'Type 5 – soft blobs' },
    { value: 'Type 6 – mushy', label: 'Type 6 – mushy' },
    { value: 'Type 7 – watery', label: 'Type 7 – watery' },
];

const steps = [
    { label: 'Personal care', icon: ShowerHead },
    { label: 'Food & fluids', icon: UtensilsCrossed },
    { label: 'Bowel & urine', icon: Droplets },
    { label: 'Overnight', icon: MoonStar },
    { label: 'Handover', icon: ClipboardCheck },
];

const today = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function ReportForm({ report, patients, selectedPatient, shift }: Props) {
    const [step, setStep] = useState(0);
    const form = useForm<ReportData>({
        patient_id: report?.patient_id ?? selectedPatient.id,
        shift_id: report?.shift_id ?? shift?.id ?? null,
        report_date: report?.report_date ?? today(),
        shift_type: report?.shift_type ?? 'day',
        shower_taken: report?.shower_taken ?? null,
        bed_bath: report?.bed_bath ?? null,
        personal_care_notes: report?.personal_care_notes ?? '',
        physio_completed: report?.physio_completed ?? null,
        breakfast: report?.breakfast ?? '',
        lunch: report?.lunch ?? '',
        dinner: report?.dinner ?? '',
        snacks: report?.snacks ?? '',
        fluids_ml: report?.fluids_ml ?? '',
        fluids_notes: report?.fluids_notes ?? '',
        food_notes: report?.food_notes ?? '',
        bowel_opened: report?.bowel_opened ?? null,
        bowel_texture: report?.bowel_texture ?? '',
        bowel_notes: report?.bowel_notes ?? '',
        urine_status: report?.urine_status ?? '',
        urine_notes: report?.urine_notes ?? '',
        sleep_from: report?.sleep_from?.slice(0, 5) ?? '',
        sleep_to: report?.sleep_to?.slice(0, 5) ?? '',
        overnight_observations: report?.overnight_observations ?? '',
        overnight_attendance: report?.overnight_attendance ?? '',
        follow_up_required: report?.follow_up_required ?? false,
        handover_notes: report?.handover_notes ?? '',
    });

    const activePatient = patients.find((patient) => patient.id === form.data.patient_id) ?? selectedPatient;
    const activeShift = activePatient.id === selectedPatient.id ? shift : null;

    const changePatient = (patientId: number) => {
        form.setData((current) => ({
            ...current,
            patient_id: patientId,
            shift_id: patientId === selectedPatient.id ? (report?.shift_id ?? shift?.id ?? null) : null,
        }));
    };

    const completion = useMemo(() => {
        const checks = [
            form.data.shower_taken !== null || form.data.bed_bath !== null,
            form.data.physio_completed !== null,
            Boolean(form.data.breakfast || form.data.lunch || form.data.dinner),
            Boolean(form.data.fluids_ml),
            form.data.bowel_opened !== null,
            Boolean(form.data.urine_status),
            Boolean(form.data.handover_notes),
        ];

        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }, [form.data]);

    const submit = (intent: 'draft' | 'submit') => {
        if (intent === 'submit' && !window.confirm('Submit and lock this daily note? You will not be able to edit it afterwards.')) {
return;
}

        form.transform((data) => ({ ...data, intent }));
        const options = { preserveScroll: true };

        if (report) {
            form.patch(`/reports/${report.id}`, options);
        } else {
            form.post('/reports', options);
        }
    };

    return (
        <>
            <Head title={report ? 'Continue daily note' : 'New daily note'} />

            <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
                <div className="animate-rise-in flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="grid size-10 place-items-center rounded-xl border border-[#dce3de] bg-white text-[#63736c] transition hover:bg-[#f9faf9]" aria-label="Back to overview">
                            <ArrowLeft className="size-[18px]" />
                        </Link>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.1em] text-[#7d8b84] uppercase">Daily Care Needs Record</p>
                            <h1 className="mt-1 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{report ? 'Continue daily note' : 'Start daily note'}</h1>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-[#dfe5e0] bg-white px-3 py-2 text-[11px] font-medium text-[#64746c] sm:flex">
                        <ShieldCheck className="size-3.5 text-[#3a765f]" /> Autosaved securely
                    </div>
                </div>

                <section className="animate-rise-in animation-delay-1 mt-6 overflow-hidden rounded-[24px] border border-[#dce4df] bg-white shadow-[0_9px_30px_rgba(31,55,46,0.045)]">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="grid size-12 place-items-center rounded-[16px] text-sm font-bold text-white transition-colors" style={{ backgroundColor: activePatient.accent_colour }}>
                                {activePatient.initials}
                            </div>
                            <div>
                                <p className="text-base font-semibold tracking-[-0.025em]">{activePatient.full_name}</p>
                                <p className="mt-1 text-xs text-[#7a8781]">{activePatient.home}{activeShift ? ` · ${activeShift.label}` : ''}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            {patients.length > 1 && (
                                <CareSelect
                                    size="sm"
                                    label="Patient"
                                    value={String(form.data.patient_id)}
                                    onChange={(value) => changePatient(Number(value))}
                                    options={patients.map((patient) => ({ value: String(patient.id), label: patient.display_name, hint: patient.home }))}
                                    className="col-span-2 sm:w-[190px]"
                                />
                            )}
                            <CareDate
                                size="sm"
                                label="Record date"
                                value={form.data.report_date}
                                onChange={(value) => form.setData('report_date', value)}
                                max={today()}
                                className="sm:w-[150px]"
                            />
                            <CareSelect
                                size="sm"
                                label="Shift type"
                                value={form.data.shift_type}
                                onChange={(value) => form.setData('shift_type', value as ReportData['shift_type'])}
                                options={shiftTypes}
                                className="sm:w-[150px]"
                            />
                        </div>
                    </div>
                    <div className="h-1 bg-[#eef2ef]"><div className="h-full bg-[#3f7c67] transition-[width] duration-500" style={{ width: `${completion}%` }} /></div>
                </section>

                <div className="animate-rise-in animation-delay-1 mt-5 overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-2">
                        {steps.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <button key={item.label} type="button" onClick={() => setStep(index)} className={cn('flex h-11 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition', step === index ? 'border-[#aac5b9] bg-[#e8f0ec] text-[#285746]' : 'border-[#dfe5e1] bg-white text-[#78867f] hover:bg-[#f8faf8]')}>
                                    <span className={cn('grid size-5 place-items-center rounded-full text-[10px]', step > index ? 'bg-[#3f7c67] text-white' : step === index ? 'bg-white text-[#366d5a]' : 'bg-[#f0f3f0] text-[#88938e]')}>
                                        {step > index ? <Check className="size-3" /> : index + 1}
                                    </span>
                                    <Icon className="size-3.5" /> {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <section className="animate-rise-in mt-3 rounded-[26px] border border-[#dce4df] bg-white p-5 shadow-[0_10px_35px_rgba(31,55,46,0.04)] sm:p-8">
                    {step === 0 && (
                        <FormSection icon={ShowerHead} eyebrow="Section 1 of 5" title="Personal care" description="Record the care completed during this shift.">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <YesNo label="Shower completed?" value={form.data.shower_taken} onChange={(value) => form.setData('shower_taken', value)} error={form.errors.shower_taken} />
                                <YesNo label="Bed bath completed?" value={form.data.bed_bath} onChange={(value) => form.setData('bed_bath', value)} error={form.errors.bed_bath} />
                            </div>
                            <YesNo label="Physio completed and documented?" value={form.data.physio_completed} onChange={(value) => form.setData('physio_completed', value)} highlighted error={form.errors.physio_completed} />
                            <TextArea label="Personal care notes" hint="If neither shower nor bed bath was completed, explain why." value={form.data.personal_care_notes} onChange={(value) => form.setData('personal_care_notes', value)} placeholder="Add any relevant personal care details…" error={form.errors.personal_care_notes} />
                        </FormSection>
                    )}

                    {step === 1 && (
                        <FormSection icon={UtensilsCrossed} eyebrow="Section 2 of 5" title="Food & fluids" description="Document what was offered and consumed." highlighted>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <TextArea label="Breakfast" value={form.data.breakfast} onChange={(value) => form.setData('breakfast', value)} placeholder="What was offered and consumed?" error={form.errors.breakfast} compact />
                                <TextArea label="Lunch" value={form.data.lunch} onChange={(value) => form.setData('lunch', value)} placeholder="What was offered and consumed?" error={form.errors.lunch} compact />
                                <TextArea label="Dinner" value={form.data.dinner} onChange={(value) => form.setData('dinner', value)} placeholder="What was offered and consumed?" error={form.errors.dinner} compact />
                                <TextArea label="Snacks" value={form.data.snacks} onChange={(value) => form.setData('snacks', value)} placeholder="Include approximate amounts" error={form.errors.snacks} compact />
                            </div>
                            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                                <Field label="Total fluids">
                                    <div className="relative"><input type="number" min="0" max="20000" value={form.data.fluids_ml} onChange={(event) => form.setData('fluids_ml', event.target.value)} placeholder="0" className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3 pr-11 text-sm outline-none transition focus:border-[#79a896] focus:bg-white focus:ring-4 focus:ring-[#dcebe4]/70" /><span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#89958f]">mL</span></div>
                                    <ErrorText message={form.errors.fluids_ml} />
                                </Field>
                                <TextArea label="Fluid notes" value={form.data.fluids_notes} onChange={(value) => form.setData('fluids_notes', value)} placeholder="Types of drinks, prompts or concerns…" error={form.errors.fluids_notes} compact />
                            </div>
                            <TextArea label="Anything else" value={form.data.food_notes} onChange={(value) => form.setData('food_notes', value)} placeholder="Allergies, refusal, assistance or other observations…" error={form.errors.food_notes} />
                        </FormSection>
                    )}

                    {step === 2 && (
                        <FormSection icon={Droplets} eyebrow="Section 3 of 5" title="Bowel & urine" description="Record observations clearly and objectively." highlighted>
                            <YesNo label="Bowel opened during this shift?" value={form.data.bowel_opened} onChange={(value) => form.setData('bowel_opened', value)} error={form.errors.bowel_opened} />
                            {form.data.bowel_opened && (
                                <Field label="Bowel texture" hint="Bristol Stool Chart description">
                                    <CareSelect
                                        size="lg"
                                        label="Bowel texture"
                                        placeholder="Select texture"
                                        value={form.data.bowel_texture}
                                        onChange={(value) => form.setData('bowel_texture', value)}
                                        options={bowelTextures}
                                    />
                                    <ErrorText message={form.errors.bowel_texture} />
                                </Field>
                            )}
                            <TextArea label="Bowel notes" value={form.data.bowel_notes} onChange={(value) => form.setData('bowel_notes', value)} placeholder="Include time, amount or any concerns…" error={form.errors.bowel_notes} compact />
                            <Field label="Urine observation">
                                <ChoiceRow options={[['normal', 'Normal'], ['concern', 'Concern noted'], ['not-observed', 'Not observed']]} value={form.data.urine_status} onChange={(value) => form.setData('urine_status', value as ReportData['urine_status'])} />
                                <ErrorText message={form.errors.urine_status} />
                            </Field>
                            <TextArea label="Urine notes" value={form.data.urine_notes} onChange={(value) => form.setData('urine_notes', value)} placeholder="Add colour, frequency, discomfort or other observations if relevant…" error={form.errors.urine_notes} compact />
                        </FormSection>
                    )}

                    {step === 3 && (
                        <FormSection icon={MoonStar} eyebrow="Section 4 of 5" title="Overnight" description="Complete for night shifts or when rest was observed.">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Sleep from"><input type="time" value={form.data.sleep_from} onChange={(event) => form.setData('sleep_from', event.target.value)} className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3 text-sm outline-none focus:border-[#79a896] focus:ring-4 focus:ring-[#dcebe4]/70" /><ErrorText message={form.errors.sleep_from} /></Field>
                                <Field label="Sleep to"><input type="time" value={form.data.sleep_to} onChange={(event) => form.setData('sleep_to', event.target.value)} className="h-12 w-full rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3 text-sm outline-none focus:border-[#79a896] focus:ring-4 focus:ring-[#dcebe4]/70" /><ErrorText message={form.errors.sleep_to} /></Field>
                            </div>
                            <TextArea label="Sleep and awake observations" value={form.data.overnight_observations} onChange={(value) => form.setData('overnight_observations', value)} placeholder="For example: awake watching TV, restless or settled…" error={form.errors.overnight_observations} />
                            <TextArea label="Attendance between 10 pm and 6 am" hint="Include time, purpose and duration." value={form.data.overnight_attendance} onChange={(value) => form.setData('overnight_attendance', value)} placeholder="02:10 – repositioning and comfort check, 10 minutes…" error={form.errors.overnight_attendance} />
                        </FormSection>
                    )}

                    {step === 4 && (
                        <FormSection icon={ClipboardCheck} eyebrow="Section 5 of 5" title="Handover" description="Leave the next worker with a clear picture of the shift.">
                            <div className="rounded-2xl border border-[#dee6e1] bg-[#f8faf8] p-4 sm:p-5">
                                <YesNo label="Does anything need follow-up?" value={form.data.follow_up_required} onChange={(value) => form.setData('follow_up_required', Boolean(value))} error={form.errors.follow_up_required} />
                            </div>
                            <TextArea label="Handover notes" hint={form.data.follow_up_required ? 'Required because follow-up is selected.' : 'Record mood, activities, changes, concerns and useful context.'} value={form.data.handover_notes} onChange={(value) => form.setData('handover_notes', value)} placeholder="Give the next worker a concise, useful handover…" error={form.errors.handover_notes} large />
                            <div className="flex items-start gap-3 rounded-2xl border border-[#e4e1d6] bg-[#fffdf7] p-4 text-xs leading-5 text-[#706959]">
                                <Info className="mt-0.5 size-4 shrink-0 text-[#a6824f]" />
                                Submitting locks this record. Any later corrections must be recorded as an amendment so the original clinical record remains traceable.
                            </div>
                        </FormSection>
                    )}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e8ece9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#687871] transition hover:bg-[#f4f6f4] disabled:invisible">
                            <ChevronLeft className="size-4" /> Previous
                        </button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="button" onClick={() => submit('draft')} disabled={form.processing} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8e0db] bg-white px-5 text-sm font-semibold text-[#52645c] transition hover:bg-[#f8faf8] disabled:opacity-50"><Save className="size-4" /> Save draft</button>
                            {step < steps.length - 1 ? (
                                <button type="button" onClick={() => {
 setStep((current) => Math.min(steps.length - 1, current + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); 
}} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#285b4c] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,91,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204d40]">Continue <ArrowRight className="size-4" /></button>
                            ) : (
                                <button type="button" onClick={() => submit('submit')} disabled={form.processing} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#285b4c] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,91,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204d40] disabled:opacity-50"><ClipboardCheck className="size-4" /> Submit & lock</button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function FormSection({ icon: Icon, eyebrow, title, description, highlighted = false, children }: { icon: typeof BedDouble; eyebrow: string; title: string; description: string; highlighted?: boolean; children: React.ReactNode }) {
    return <div>
        <div className="mb-7 flex items-start gap-4">
            <div className={cn('grid size-11 shrink-0 place-items-center rounded-[15px]', highlighted ? 'bg-[#fff2c9] text-[#8f6b26]' : 'bg-[#e9f1ed] text-[#376d5a]')}><Icon className="size-[19px]" /></div>
            <div><p className="text-[10px] font-bold tracking-[0.1em] text-[#89958f] uppercase">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">{title}</h2><p className="mt-1 text-xs text-[#77857e]">{description}</p></div>
        </div>
        <div className="space-y-6">{children}</div>
    </div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#40534b]">{label}</span>{hint && <span className="mb-2 block text-[11px] leading-4 text-[#89948f]">{hint}</span>}{children}</label>;
}

function TextArea({ label, hint, value, onChange, placeholder, error, compact = false, large = false }: { label: string; hint?: string; value: string; onChange: (value: string) => void; placeholder: string; error?: string; compact?: boolean; large?: boolean }) {
    return <Field label={label} hint={hint}><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={large ? 7 : compact ? 3 : 4} className="w-full resize-none rounded-xl border border-[#dce3df] bg-[#fbfcfb] px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a7b0ab] focus:border-[#79a896] focus:bg-white focus:ring-4 focus:ring-[#dcebe4]/70" /><ErrorText message={error} /></Field>;
}

function YesNo({ label, value, onChange, error, highlighted = false }: { label: string; value: boolean | null; onChange: (value: boolean) => void; error?: string; highlighted?: boolean }) {
    return <Field label={label}><div className={cn('grid grid-cols-2 gap-2 rounded-2xl p-1.5', highlighted ? 'bg-[#fff7dc]' : 'bg-[#f3f6f3]')}><button type="button" onClick={() => onChange(true)} className={cn('h-11 rounded-xl text-xs font-semibold transition', value === true ? 'bg-white text-[#2e6955] shadow-sm ring-1 ring-[#cfe0d8]' : 'text-[#7d8a84] hover:text-[#485c53]')}>Yes</button><button type="button" onClick={() => onChange(false)} className={cn('h-11 rounded-xl text-xs font-semibold transition', value === false ? 'bg-white text-[#704e45] shadow-sm ring-1 ring-[#e4d7d2]' : 'text-[#7d8a84] hover:text-[#485c53]')}>No</button></div><ErrorText message={error} /></Field>;
}

function ChoiceRow({ options, value, onChange }: { options: string[][]; value: string; onChange: (value: string) => void }) {
    return <div className="flex flex-wrap gap-2">{options.map(([optionValue, label]) => <button key={optionValue} type="button" onClick={() => onChange(optionValue)} className={cn('h-11 rounded-xl border px-4 text-xs font-semibold transition', value === optionValue ? 'border-[#8fb4a5] bg-[#e8f1ed] text-[#2e6653]' : 'border-[#dce3df] bg-white text-[#75837d] hover:bg-[#f8faf8]')}>{label}</button>)}</div>;
}

function ErrorText({ message }: { message?: string }) {
    return message ? <p className="mt-1.5 text-[11px] font-medium text-[#b55f50]">{message}</p> : null;
}
