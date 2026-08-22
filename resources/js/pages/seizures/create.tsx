import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Clock3,
    HeartPulse,
    Info,
    ShieldCheck,
} from 'lucide-react';
import CareDate from '@/components/care-date';
import { cn } from '@/lib/utils';

type Participant = {
    id: number;
    display_name: string;
    full_name: string;
    initials: string;
    home: string;
    accent_colour: string;
};

type EventData = {
    participant_id: number;
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

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

export default function SeizureCreate({
    participant,
    reportId,
    observerName,
}: {
    participant: Participant;
    reportId: number | null;
    observerName: string;
}) {
    const form = useForm<EventData>({
        participant_id: participant.id,
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

    const toggle = (
        field:
            | 'awareness'
            | 'facial_expressions'
            | 'body_movements'
            | 'automatic_movements'
            | 'speech'
            | 'after_effects',
        value: string,
    ) => {
        const values = form.data[field];
        form.setData(
            field,
            values.includes(value)
                ? values.filter((item) => item !== value)
                : [...values, value],
        );
    };

    const cancelHref = reportId ? `/reports/${reportId}/edit` : '/dashboard';

    return (
        <>
            <Head title="Seizure observation chart" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/seizures');
                }}
                className="mx-auto max-w-[1240px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9"
            >
                <header className="animate-rise-in flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={cancelHref}
                            className="grid size-10 place-items-center rounded-lg border border-line bg-white text-ink-500 transition hover:bg-surface"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="size-[18px]" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-[-0.02em] text-ink-900 sm:text-2xl">
                                Seizure observation chart
                            </h1>
                            <p className="mt-1 text-sm text-ink-500">
                                Complete this form immediately following a
                                seizure event.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={cancelHref}
                            className="btn-secondary h-11 text-[13px]"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn-primary h-11 text-[13px]"
                        >
                            <HeartPulse className="size-4" /> Save observation
                        </button>
                    </div>
                </header>

                <section className="animate-rise-in animation-delay-1 care-card mt-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="grid size-12 place-items-center rounded-2xl text-sm font-bold text-white"
                            style={{
                                backgroundColor: participant.accent_colour,
                            }}
                        >
                            {participant.initials}
                        </div>
                        <div>
                            <p className="text-base font-semibold">
                                {participant.full_name}
                            </p>
                            <p className="mt-1 text-xs text-ink-400">
                                {participant.home}
                            </p>
                        </div>
                    </div>
                    <div>
                        <span className="mb-2 block text-[10px] font-bold tracking-[0.08em] text-ink-400 uppercase">
                            Time of onset
                        </span>
                        <div className="flex gap-2">
                            <CareDate
                                label="Event date"
                                value={form.data.occurred_at.slice(0, 10)}
                                onChange={(value) =>
                                    form.setData(
                                        'occurred_at',
                                        value +
                                            'T' +
                                            (form.data.occurred_at.slice(
                                                11,
                                                16,
                                            ) || '00:00'),
                                    )
                                }
                                max={localDateTime().slice(0, 10)}
                                className="w-[148px]"
                            />
                            <div className="relative">
                                <Clock3 className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-ink-400" />
                                <input
                                    type="time"
                                    aria-label="Event time"
                                    value={form.data.occurred_at.slice(11, 16)}
                                    onChange={(event) =>
                                        form.setData(
                                            'occurred_at',
                                            (form.data.occurred_at.slice(
                                                0,
                                                10,
                                            ) || localDateTime().slice(0, 10)) +
                                                'T' +
                                                (event.target.value || '00:00'),
                                        )
                                    }
                                    className="care-field h-11 w-[136px] pr-2 pl-9 text-xs font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="animate-rise-in animation-delay-2 mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
                    <div className="space-y-5">
                        <EventCard title="During seizure observations">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Observation
                                    label="Awareness"
                                    values={[
                                        'Confused',
                                        'Responds to voice',
                                        'Not responsive',
                                    ]}
                                    selected={form.data.awareness}
                                    onToggle={(value) =>
                                        toggle('awareness', value)
                                    }
                                />
                                <Observation
                                    label="Facial expressions"
                                    values={[
                                        'Staring or blank',
                                        'Twitching',
                                        'Pupils dilated',
                                    ]}
                                    selected={form.data.facial_expressions}
                                    onToggle={(value) =>
                                        toggle('facial_expressions', value)
                                    }
                                />
                            </div>
                        </EventCard>

                        <EventCard title="Movement & speech">
                            <div className="grid gap-6 sm:grid-cols-3">
                                <Observation
                                    label="Body movement"
                                    values={['Whole body', 'Legs', 'Arms']}
                                    selected={form.data.body_movements}
                                    onToggle={(value) =>
                                        toggle('body_movements', value)
                                    }
                                />
                                <Observation
                                    label="Automatic movement"
                                    values={[
                                        'Walking / wandering',
                                        'Hands clapping / rubbing',
                                        'Chewing',
                                    ]}
                                    selected={form.data.automatic_movements}
                                    onToggle={(value) =>
                                        toggle('automatic_movements', value)
                                    }
                                />
                                <Observation
                                    label="Speech"
                                    values={[
                                        'Incoherent',
                                        'Unable to talk normally',
                                        'Mixing up words',
                                        'Unable to talk',
                                    ]}
                                    selected={form.data.speech}
                                    onToggle={(value) =>
                                        toggle('speech', value)
                                    }
                                />
                            </div>
                        </EventCard>
                    </div>

                    <div className="space-y-5">
                        <EventCard title="Metrics">
                            <NumberField
                                label="Seizure duration"
                                suffix="seconds"
                                value={form.data.seizure_duration_seconds}
                                onChange={(value) =>
                                    form.setData(
                                        'seizure_duration_seconds',
                                        value,
                                    )
                                }
                                error={form.errors.seizure_duration_seconds}
                                required
                            />
                            <NumberField
                                label="Recovery period"
                                suffix="minutes"
                                value={form.data.recovery_duration_minutes}
                                onChange={(value) =>
                                    form.setData(
                                        'recovery_duration_minutes',
                                        value,
                                    )
                                }
                                error={form.errors.recovery_duration_minutes}
                            />
                            <Choice
                                label="Incontinence"
                                options={[
                                    ['none', 'None'],
                                    ['bowel', 'Bowel'],
                                    ['urine', 'Urine'],
                                    ['both', 'Both'],
                                ]}
                                value={form.data.incontinence}
                                onChange={(value) =>
                                    form.setData('incontinence', value)
                                }
                            />
                        </EventCard>

                        <EventCard title="After seizure">
                            <Observation
                                label="Recovery state"
                                values={[
                                    'Fully aware',
                                    'Responds normally',
                                    'Confused',
                                    'Tired',
                                    'Sleep',
                                    'Agitated / irritable',
                                ]}
                                selected={form.data.after_effects}
                                onToggle={(value) =>
                                    toggle('after_effects', value)
                                }
                            />
                        </EventCard>
                    </div>
                </div>

                <section className="animate-rise-in animation-delay-3 care-card mt-5 p-5 sm:p-7">
                    <h2 className="border-b border-line-soft pb-4 text-lg font-semibold tracking-[-0.02em] text-brand-800">
                        Incident &amp; sign-off
                    </h2>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                            <Toggle
                                label="Did the person fall?"
                                value={form.data.fell}
                                onChange={(value) =>
                                    form.setData('fell', value)
                                }
                            />
                            <Toggle
                                label="Was the person injured?"
                                value={form.data.injured}
                                onChange={(value) =>
                                    form.setData('injured', value)
                                }
                            />
                            <Toggle
                                label="Was QAS called?"
                                value={form.data.qas_called}
                                onChange={(value) =>
                                    form.setData('qas_called', value)
                                }
                            />
                            <Toggle
                                label="Incident report completed?"
                                value={form.data.incident_report_completed}
                                onChange={(value) =>
                                    form.setData(
                                        'incident_report_completed',
                                        value,
                                    )
                                }
                                neutral
                            />
                        </div>

                        <div className="space-y-5">
                            {form.data.fell && (
                                <TextArea
                                    label="Fall details"
                                    value={form.data.fall_notes}
                                    onChange={(value) =>
                                        form.setData('fall_notes', value)
                                    }
                                    placeholder="Describe the fall and immediate response…"
                                    error={form.errors.fall_notes}
                                />
                            )}
                            {form.data.injured && (
                                <TextArea
                                    label="Injury details"
                                    value={form.data.injury_notes}
                                    onChange={(value) =>
                                        form.setData('injury_notes', value)
                                    }
                                    placeholder="Describe the injury and treatment provided…"
                                    error={form.errors.injury_notes}
                                />
                            )}
                            <label className="block">
                                <span className="care-label">
                                    Observer name
                                </span>
                                <input
                                    value={form.data.observer_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'observer_name',
                                            event.target.value,
                                        )
                                    }
                                    className="care-field"
                                />
                                {form.errors.observer_name && (
                                    <p className="mt-1 text-xs text-alert-600">
                                        {form.errors.observer_name}
                                    </p>
                                )}
                            </label>
                            <div className="flex items-start gap-3 rounded-xl border border-warn-100 bg-warn-50 p-4 text-sm leading-6 text-ink-600">
                                <Info className="mt-0.5 size-4 shrink-0 text-warn-700" />
                                If a fall occurred, complete the organisation’s
                                incident report and bruise chart according to
                                policy.
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={cancelHref} className="btn-ghost">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn-primary px-6"
                        >
                            <HeartPulse className="size-4" /> Save observation
                        </button>
                    </div>
                </section>

                <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-ink-300">
                    <ShieldCheck className="size-3.5" /> Clinical events are
                    permanent records and every change is logged
                </p>
            </form>
        </>
    );
}

function EventCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="care-card p-5 sm:p-6">
            <h2 className="border-b border-line-soft pb-4 text-lg font-semibold tracking-[-0.02em] text-brand-800">
                {title}
            </h2>
            <div className="mt-5 space-y-5">{children}</div>
        </section>
    );
}

function Observation({
    label,
    values,
    selected,
    onToggle,
}: {
    label: string;
    values: string[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <fieldset>
            <legend className="mb-2.5 text-sm font-semibold text-ink-700">
                {label}
            </legend>
            <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                    const active = selected.includes(value);

                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onToggle(value)}
                            className={cn(
                                'flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition',
                                active
                                    ? 'border-brand-400 bg-brand-50 text-brand-800'
                                    : 'border-line bg-surface-soft text-ink-500 hover:bg-surface',
                            )}
                        >
                            {active && <Check className="size-3.5" />}
                            {value}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

function Toggle({
    label,
    value,
    onChange,
    neutral = false,
}: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    neutral?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => onChange(!value)}
            className={cn(
                'flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition',
                value && !neutral
                    ? 'border-alert-100 bg-alert-50 text-alert-700'
                    : 'border-line bg-surface-soft text-ink-700 hover:bg-surface',
            )}
        >
            {label}
            <span
                className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition',
                    value
                        ? neutral
                            ? 'bg-brand-600'
                            : 'bg-alert-500'
                        : 'bg-ink-200',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all',
                        value ? 'left-[22px]' : 'left-0.5',
                    )}
                />
            </span>
        </button>
    );
}

function Choice({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[][];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <fieldset>
            <legend className="mb-2.5 text-sm font-semibold text-ink-700">
                {label}
            </legend>
            <div className="flex flex-wrap gap-2">
                {options.map(([key, text]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={cn(
                            'h-10 rounded-lg border px-4 text-xs font-semibold transition',
                            value === key
                                ? 'border-brand-400 bg-brand-50 text-brand-800'
                                : 'border-line bg-white text-ink-500 hover:bg-surface',
                        )}
                    >
                        {text}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}

function NumberField({
    label,
    suffix,
    value,
    onChange,
    error,
    required = false,
}: {
    label: string;
    suffix: string;
    value: string | number;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="care-label">
                {label}
                {required && <span className="text-alert-600"> *</span>}
            </span>
            <div className="relative">
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="care-field pr-20"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-ink-400">
                    {suffix}
                </span>
            </div>
            {error && <p className="mt-1 text-xs text-alert-600">{error}</p>}
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
    placeholder,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string;
}) {
    return (
        <label className="block">
            <span className="care-label">{label}</span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className="care-textarea"
            />
            {error && <p className="mt-1 text-xs text-alert-600">{error}</p>}
        </label>
    );
}
