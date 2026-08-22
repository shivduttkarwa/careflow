import { Head, Link, useForm } from '@inertiajs/react';
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
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import CareDate from '@/components/care-date';
import CareSelect from '@/components/care-select';
import { cn } from '@/lib/utils';

type Participant = {
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
    participant_id: number;
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
    participants: Participant[];
    selectedParticipant: Participant;
    shift: Shift | null;
};

const shiftTypes = [
    { value: 'day', label: 'Day shift', hint: 'Morning through afternoon' },
    {
        value: 'evening',
        label: 'Evening shift',
        hint: 'Afternoon through late evening',
    },
    { value: 'night', label: 'Night shift', hint: 'Overnight cover' },
];

const bowelTextures = [
    {
        value: 'Type 1 – separate hard lumps',
        label: 'Type 1 – separate hard lumps',
    },
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
    { label: 'Elimination', icon: Droplets },
    { label: 'Overnight', icon: MoonStar },
    { label: 'Handover', icon: ClipboardCheck },
];

const today = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function ReportForm({
    report,
    participants,
    selectedParticipant,
    shift,
}: Props) {
    const [step, setStep] = useState(0);
    const form = useForm<ReportData>({
        participant_id: report?.participant_id ?? selectedParticipant.id,
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

    const activeParticipant =
        participants.find(
            (participant) => participant.id === form.data.participant_id,
        ) ?? selectedParticipant;
    const activeShift =
        activeParticipant.id === selectedParticipant.id ? shift : null;

    const changeParticipant = (participantId: number) => {
        form.setData((current) => ({
            ...current,
            participant_id: participantId,
            shift_id:
                participantId === selectedParticipant.id
                    ? (report?.shift_id ?? shift?.id ?? null)
                    : null,
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

        return Math.round(
            (checks.filter(Boolean).length / checks.length) * 100,
        );
    }, [form.data]);

    const submit = (intent: 'draft' | 'submit') => {
        if (
            intent === 'submit' &&
            !window.confirm(
                'Submit and lock this care record? You will not be able to edit it afterwards.',
            )
        ) {
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

    const goToStep = (next: number) => {
        setStep(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head title={report ? 'Continue care record' : 'New care record'} />

            <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
                <div className="animate-rise-in flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="grid size-10 place-items-center rounded-lg border border-line bg-white text-ink-500 transition hover:bg-surface"
                            aria-label="Back to overview"
                        >
                            <ArrowLeft className="size-[18px]" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-[-0.02em] text-ink-900 sm:text-2xl">
                                Daily Care Needs Record
                            </h1>
                            <p className="mt-1 text-sm text-ink-500">
                                Complete for each shift to ensure accurate care
                                tracking.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => submit('draft')}
                            disabled={form.processing}
                            className="btn-secondary h-11 text-[13px]"
                        >
                            <Save className="size-4" /> Save draft
                        </button>
                        <button
                            type="button"
                            onClick={() => submit('submit')}
                            disabled={form.processing}
                            className="btn-primary h-11 text-[13px]"
                        >
                            <ClipboardCheck className="size-4" /> Submit record
                        </button>
                    </div>
                </div>

                <section className="animate-rise-in animation-delay-1 care-card mt-6 overflow-hidden">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="grid size-12 place-items-center rounded-2xl text-sm font-bold text-white transition-colors"
                                style={{
                                    backgroundColor:
                                        activeParticipant.accent_colour,
                                }}
                            >
                                {activeParticipant.initials}
                            </div>
                            <div>
                                <p className="text-base font-semibold tracking-[-0.01em]">
                                    {activeParticipant.full_name}
                                </p>
                                <p className="mt-1 text-xs text-ink-400">
                                    {activeParticipant.home}
                                    {activeShift
                                        ? ` · ${activeShift.label}`
                                        : ''}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            {participants.length > 1 && (
                                <CareSelect
                                    size="sm"
                                    label="Participant"
                                    value={String(form.data.participant_id)}
                                    onChange={(value) =>
                                        changeParticipant(Number(value))
                                    }
                                    options={participants.map(
                                        (participant) => ({
                                            value: String(participant.id),
                                            label: participant.display_name,
                                            hint: participant.home,
                                        }),
                                    )}
                                    className="col-span-2 sm:w-[190px]"
                                />
                            )}
                            <CareDate
                                size="sm"
                                label="Record date"
                                value={form.data.report_date}
                                onChange={(value) =>
                                    form.setData('report_date', value)
                                }
                                max={today()}
                                className="sm:w-[150px]"
                            />
                            <CareSelect
                                size="sm"
                                label="Shift type"
                                value={form.data.shift_type}
                                onChange={(value) =>
                                    form.setData(
                                        'shift_type',
                                        value as ReportData['shift_type'],
                                    )
                                }
                                options={shiftTypes}
                                className="sm:w-[150px]"
                            />
                        </div>
                    </div>
                    <div className="h-1 bg-line-soft">
                        <div
                            className="h-full bg-brand-600 transition-[width] duration-500"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </section>

                <nav
                    className="animate-rise-in animation-delay-1 mt-6 overflow-x-auto pb-2"
                    aria-label="Record sections"
                >
                    <ol className="flex min-w-max items-start gap-0">
                        {steps.map((item, index) => {
                            const done = step > index;
                            const active = step === index;

                            return (
                                <li
                                    key={item.label}
                                    className="flex items-start"
                                >
                                    {index > 0 && (
                                        <span
                                            className={cn(
                                                'mt-5 h-0.5 w-10 sm:w-16',
                                                done || active
                                                    ? 'bg-brand-400'
                                                    : 'bg-line',
                                            )}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        className="flex w-24 flex-col items-center gap-2 px-1 sm:w-28"
                                    >
                                        <span
                                            className={cn(
                                                'grid size-10 place-items-center rounded-full border-2 text-sm font-bold transition',
                                                done
                                                    ? 'border-brand-700 bg-brand-700 text-white'
                                                    : active
                                                      ? 'border-brand-700 bg-white text-brand-700 ring-4 ring-brand-100'
                                                      : 'border-line bg-white text-ink-300',
                                            )}
                                        >
                                            {done ? (
                                                <Check className="size-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-center text-[11px] leading-4 font-semibold',
                                                active
                                                    ? 'text-brand-800'
                                                    : done
                                                      ? 'text-ink-600'
                                                      : 'text-ink-400',
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <section className="animate-rise-in care-card mt-3 p-5 sm:p-8">
                    {step === 0 && (
                        <FormSection
                            index={1}
                            icon={ShowerHead}
                            title="Personal care & physiotherapy"
                            description="Record the care completed during this shift."
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <YesNo
                                    label="Shower completed?"
                                    value={form.data.shower_taken}
                                    onChange={(value) =>
                                        form.setData('shower_taken', value)
                                    }
                                    error={form.errors.shower_taken}
                                />
                                <YesNo
                                    label="Bed bath completed?"
                                    value={form.data.bed_bath}
                                    onChange={(value) =>
                                        form.setData('bed_bath', value)
                                    }
                                    error={form.errors.bed_bath}
                                />
                            </div>
                            <YesNo
                                label="Physio completed and documented?"
                                value={form.data.physio_completed}
                                onChange={(value) =>
                                    form.setData('physio_completed', value)
                                }
                                highlighted
                                error={form.errors.physio_completed}
                            />
                            <TextArea
                                label="Personal care notes"
                                hint="If neither shower nor bed bath was completed, explain why."
                                value={form.data.personal_care_notes}
                                onChange={(value) =>
                                    form.setData('personal_care_notes', value)
                                }
                                placeholder="Add any relevant personal care details…"
                                error={form.errors.personal_care_notes}
                            />
                        </FormSection>
                    )}

                    {step === 1 && (
                        <FormSection
                            index={2}
                            icon={UtensilsCrossed}
                            title="Food & fluid intake"
                            description="Document what was offered and consumed."
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <TextArea
                                    label="Breakfast"
                                    value={form.data.breakfast}
                                    onChange={(value) =>
                                        form.setData('breakfast', value)
                                    }
                                    placeholder="What was offered and consumed?"
                                    error={form.errors.breakfast}
                                    compact
                                />
                                <TextArea
                                    label="Lunch"
                                    value={form.data.lunch}
                                    onChange={(value) =>
                                        form.setData('lunch', value)
                                    }
                                    placeholder="What was offered and consumed?"
                                    error={form.errors.lunch}
                                    compact
                                />
                                <TextArea
                                    label="Dinner"
                                    value={form.data.dinner}
                                    onChange={(value) =>
                                        form.setData('dinner', value)
                                    }
                                    placeholder="What was offered and consumed?"
                                    error={form.errors.dinner}
                                    compact
                                />
                                <TextArea
                                    label="Snacks"
                                    value={form.data.snacks}
                                    onChange={(value) =>
                                        form.setData('snacks', value)
                                    }
                                    placeholder="Include approximate amounts"
                                    error={form.errors.snacks}
                                    compact
                                />
                            </div>
                            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                                <Field label="Total fluids">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20000"
                                            value={form.data.fluids_ml}
                                            onChange={(event) =>
                                                form.setData(
                                                    'fluids_ml',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            className="care-field pr-11"
                                        />
                                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-ink-400">
                                            mL
                                        </span>
                                    </div>
                                    <ErrorText
                                        message={form.errors.fluids_ml}
                                    />
                                </Field>
                                <TextArea
                                    label="Fluid notes"
                                    value={form.data.fluids_notes}
                                    onChange={(value) =>
                                        form.setData('fluids_notes', value)
                                    }
                                    placeholder="Types of drinks, prompts or concerns…"
                                    error={form.errors.fluids_notes}
                                    compact
                                />
                            </div>
                            <TextArea
                                label="Anything else"
                                value={form.data.food_notes}
                                onChange={(value) =>
                                    form.setData('food_notes', value)
                                }
                                placeholder="Allergies, refusal, assistance or other observations…"
                                error={form.errors.food_notes}
                            />
                        </FormSection>
                    )}

                    {step === 2 && (
                        <FormSection
                            index={3}
                            icon={Droplets}
                            title="Elimination"
                            description="Record observations clearly and objectively."
                        >
                            <YesNo
                                label="Bowel opened during this shift?"
                                value={form.data.bowel_opened}
                                onChange={(value) =>
                                    form.setData('bowel_opened', value)
                                }
                                error={form.errors.bowel_opened}
                            />
                            {form.data.bowel_opened && (
                                <Field
                                    label="Bowel texture"
                                    hint="Bristol Stool Chart description"
                                >
                                    <CareSelect
                                        size="lg"
                                        label="Bowel texture"
                                        placeholder="Select texture"
                                        value={form.data.bowel_texture}
                                        onChange={(value) =>
                                            form.setData('bowel_texture', value)
                                        }
                                        options={bowelTextures}
                                    />
                                    <ErrorText
                                        message={form.errors.bowel_texture}
                                    />
                                </Field>
                            )}
                            <TextArea
                                label="Bowel notes"
                                value={form.data.bowel_notes}
                                onChange={(value) =>
                                    form.setData('bowel_notes', value)
                                }
                                placeholder="Include time, amount or any concerns…"
                                error={form.errors.bowel_notes}
                                compact
                            />
                            <Field label="Urine observation">
                                <ChoiceRow
                                    options={[
                                        ['normal', 'Normal'],
                                        ['concern', 'Concern noted'],
                                        ['not-observed', 'Not observed'],
                                    ]}
                                    value={form.data.urine_status}
                                    onChange={(value) =>
                                        form.setData(
                                            'urine_status',
                                            value as ReportData['urine_status'],
                                        )
                                    }
                                />
                                <ErrorText message={form.errors.urine_status} />
                            </Field>
                            <TextArea
                                label="Urine notes"
                                value={form.data.urine_notes}
                                onChange={(value) =>
                                    form.setData('urine_notes', value)
                                }
                                placeholder="Add colour, frequency, discomfort or other observations if relevant…"
                                error={form.errors.urine_notes}
                                compact
                            />
                        </FormSection>
                    )}

                    {step === 3 && (
                        <FormSection
                            index={4}
                            icon={MoonStar}
                            title="Overnight care"
                            description="Complete for night shifts or when rest was observed."
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Sleep from">
                                    <input
                                        type="time"
                                        value={form.data.sleep_from}
                                        onChange={(event) =>
                                            form.setData(
                                                'sleep_from',
                                                event.target.value,
                                            )
                                        }
                                        className="care-field"
                                    />
                                    <ErrorText
                                        message={form.errors.sleep_from}
                                    />
                                </Field>
                                <Field label="Sleep to">
                                    <input
                                        type="time"
                                        value={form.data.sleep_to}
                                        onChange={(event) =>
                                            form.setData(
                                                'sleep_to',
                                                event.target.value,
                                            )
                                        }
                                        className="care-field"
                                    />
                                    <ErrorText message={form.errors.sleep_to} />
                                </Field>
                            </div>
                            <TextArea
                                label="Sleep and awake observations"
                                value={form.data.overnight_observations}
                                onChange={(value) =>
                                    form.setData(
                                        'overnight_observations',
                                        value,
                                    )
                                }
                                placeholder="For example: awake watching TV, restless or settled…"
                                error={form.errors.overnight_observations}
                            />
                            <TextArea
                                label="Attendance between 10 pm and 6 am"
                                hint="Include time, purpose and duration."
                                value={form.data.overnight_attendance}
                                onChange={(value) =>
                                    form.setData('overnight_attendance', value)
                                }
                                placeholder="02:10 – repositioning and comfort check, 10 minutes…"
                                error={form.errors.overnight_attendance}
                            />
                        </FormSection>
                    )}

                    {step === 4 && (
                        <FormSection
                            index={5}
                            icon={ClipboardCheck}
                            title="Handover & sign-off"
                            description="Leave the next worker with a clear picture of the shift."
                        >
                            <div className="rounded-xl border border-line-soft bg-surface p-4 sm:p-5">
                                <YesNo
                                    label="Does anything need follow-up?"
                                    value={form.data.follow_up_required}
                                    onChange={(value) =>
                                        form.setData(
                                            'follow_up_required',
                                            Boolean(value),
                                        )
                                    }
                                    error={form.errors.follow_up_required}
                                />
                            </div>
                            <TextArea
                                label="Handover notes"
                                hint={
                                    form.data.follow_up_required
                                        ? 'Required because follow-up is selected.'
                                        : 'Record mood, activities, changes, concerns and useful context.'
                                }
                                value={form.data.handover_notes}
                                onChange={(value) =>
                                    form.setData('handover_notes', value)
                                }
                                placeholder="Give the next worker a concise, useful handover…"
                                error={form.errors.handover_notes}
                                large
                            />
                            <div className="flex items-start gap-3 rounded-xl border border-warn-100 bg-warn-50 p-4 text-sm leading-6 text-ink-600">
                                <Info className="mt-0.5 size-4 shrink-0 text-warn-700" />
                                Submitting locks this record. Any later
                                corrections must be recorded as an amendment so
                                the original clinical record remains traceable.
                            </div>
                        </FormSection>
                    )}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => goToStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className="btn-ghost disabled:invisible"
                        >
                            <ChevronLeft className="size-4" /> Previous
                        </button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => submit('draft')}
                                disabled={form.processing}
                                className="btn-secondary"
                            >
                                <Save className="size-4" /> Save draft
                            </button>
                            {step < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => goToStep(step + 1)}
                                    className="btn-primary px-6"
                                >
                                    Continue <ArrowRight className="size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => submit('submit')}
                                    disabled={form.processing}
                                    className="btn-primary px-6"
                                >
                                    <ClipboardCheck className="size-4" /> Submit
                                    &amp; lock
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-ink-300">
                    <ShieldCheck className="size-3.5" /> Drafts are saved
                    securely and every change is logged
                </p>
            </div>
        </>
    );
}

function FormSection({
    index,
    icon: Icon,
    title,
    description,
    children,
}: {
    index: number;
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-7 flex items-start gap-3 border-b border-line-soft pb-5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                    {index}
                </span>
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
                        <Icon className="size-5 shrink-0 text-brand-700" />
                        {title}
                    </h2>
                    <p className="mt-1 text-xs text-ink-400">{description}</p>
                </div>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="care-label">{label}</span>
            {hint && (
                <span className="mb-2 block text-xs leading-4 text-ink-400">
                    {hint}
                </span>
            )}
            {children}
        </label>
    );
}

function TextArea({
    label,
    hint,
    value,
    onChange,
    placeholder,
    error,
    compact = false,
    large = false,
}: {
    label: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string;
    compact?: boolean;
    large?: boolean;
}) {
    return (
        <Field label={label} hint={hint}>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={large ? 7 : compact ? 3 : 4}
                className="care-textarea"
            />
            <ErrorText message={error} />
        </Field>
    );
}

function YesNo({
    label,
    value,
    onChange,
    error,
    highlighted = false,
}: {
    label: string;
    value: boolean | null;
    onChange: (value: boolean) => void;
    error?: string;
    highlighted?: boolean;
}) {
    return (
        <Field label={label}>
            <div
                className={cn(
                    'grid grid-cols-2 gap-2 rounded-xl p-1.5',
                    highlighted ? 'bg-grow-50' : 'bg-ink-50',
                )}
            >
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={cn(
                        'h-11 rounded-lg text-sm font-semibold transition',
                        value === true
                            ? 'bg-white text-grow-700 shadow-card ring-1 ring-grow-200'
                            : 'text-ink-500 hover:text-ink-800',
                    )}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={cn(
                        'h-11 rounded-lg text-sm font-semibold transition',
                        value === false
                            ? 'bg-white text-alert-700 shadow-card ring-1 ring-alert-100'
                            : 'text-ink-500 hover:text-ink-800',
                    )}
                >
                    No
                </button>
            </div>
            <ErrorText message={error} />
        </Field>
    );
}

function ChoiceRow({
    options,
    value,
    onChange,
}: {
    options: string[][];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(([optionValue, label]) => (
                <button
                    key={optionValue}
                    type="button"
                    onClick={() => onChange(optionValue)}
                    className={cn(
                        'h-11 rounded-lg border px-4 text-sm font-semibold transition',
                        value === optionValue
                            ? 'border-brand-400 bg-brand-50 text-brand-800'
                            : 'border-line bg-white text-ink-500 hover:bg-surface',
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

function ErrorText({ message }: { message?: string }) {
    return message ? (
        <p className="mt-1.5 text-xs font-medium text-alert-600">{message}</p>
    ) : null;
}
