import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

type View = 'days' | 'months' | 'years';

type Props = {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    placeholder?: string;
    size?: Size;
    name?: string;
    id?: string;
    label?: string;
    clearable?: boolean;
    disabled?: boolean;
    className?: string;
};

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const SHORT_MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const triggerSizes: Record<Size, string> = {
    sm: 'h-10 pl-9 text-xs',
    md: 'h-11 pl-10 text-xs',
    lg: 'h-12 pl-10 text-sm',
};

const pad = (value: number) => String(value).padStart(2, '0');

const toKey = (date: Date) =>
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate());

/** Built as a local date — new Date('2026-08-21') parses as UTC and can land on the wrong day. */
const fromKey = (key: string) => {
    const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(key);

    if (!parts) {
        return null;
    }

    const date = new Date(
        Number(parts[1]),
        Number(parts[2]) - 1,
        Number(parts[3]),
    );

    return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const addMonths = (date: Date, months: number) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);

const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const monthGrid = (month: Date) => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = addDays(first, -((first.getDay() + 6) % 7));

    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
};

export default function CareDate({
    value,
    onChange,
    min,
    max,
    placeholder = 'Select date',
    size = 'md',
    name,
    id,
    label,
    clearable = false,
    disabled = false,
    className,
}: Props) {
    const selected = fromKey(value);
    const today = new Date();
    const todayKey = toKey(today);

    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>('days');
    const [month, setMonth] = useState(() => selected ?? today);
    const [focused, setFocused] = useState(() => selected ?? today);
    const focusedRef = useRef<HTMLButtonElement>(null);

    const toggle = (next: boolean) => {
        if (next) {
            const start = fromKey(value) ?? new Date();

            setView('days');
            setMonth(start);
            setFocused(start);
        }

        setOpen(next);
    };

    useEffect(() => {
        if (open && view === 'days') {
            focusedRef.current?.focus();
        }
    }, [open, view, focused]);

    const days = useMemo(() => monthGrid(month), [month]);

    const outOfRange = (date: Date) => {
        const key = toKey(date);

        return (
            (min !== undefined && min !== '' && key < min) ||
            (max !== undefined && max !== '' && key > max)
        );
    };

    const commit = (date: Date) => {
        if (outOfRange(date)) {
            return;
        }

        onChange(toKey(date));
        setOpen(false);
    };

    const moveFocus = (next: Date) => {
        setFocused(next);

        if (
            next.getMonth() !== month.getMonth() ||
            next.getFullYear() !== month.getFullYear()
        ) {
            setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
        }
    };

    const onGridKeyDown = (event: React.KeyboardEvent) => {
        const steps: Record<string, number> = {
            ArrowLeft: -1,
            ArrowRight: 1,
            ArrowUp: -7,
            ArrowDown: 7,
        };

        if (steps[event.key] !== undefined) {
            event.preventDefault();
            moveFocus(addDays(focused, steps[event.key]));

            return;
        }

        if (event.key === 'PageUp' || event.key === 'PageDown') {
            event.preventDefault();
            const shifted = addMonths(focused, event.key === 'PageUp' ? -1 : 1);
            moveFocus(
                new Date(
                    shifted.getFullYear(),
                    shifted.getMonth(),
                    Math.min(focused.getDate(), daysInMonth(shifted)),
                ),
            );

            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            commit(focused);
        }
    };

    const stepMonth = (direction: number) => {
        const jump = view === 'days' ? 1 : view === 'months' ? 12 : 144;

        setMonth(addMonths(month, direction * jump));
    };

    const yearsStart = Math.floor(month.getFullYear() / 12) * 12;

    const navLabel =
        view === 'days' ? 'month' : view === 'months' ? 'year' : 'years';

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={toggle}>
            <div className={cn('relative', className)}>
                <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-ink-400" />
                <PopoverPrimitive.Trigger asChild>
                    <button
                        type="button"
                        id={id}
                        aria-label={label}
                        disabled={disabled}
                        className={cn(
                            'flex w-full items-center rounded-xl border border-line bg-surface-soft pr-3 text-left font-medium text-ink-700 transition outline-none',
                            'hover:border-brand-300 hover:bg-white',
                            'focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-100/70',
                            'data-[state=open]:border-brand-500 data-[state=open]:bg-white data-[state=open]:ring-4 data-[state=open]:ring-brand-100/70',
                            'disabled:cursor-not-allowed disabled:opacity-55',
                            triggerSizes[size],
                            clearable && value !== '' && 'pr-9',
                        )}
                    >
                        <span
                            className={cn(
                                'truncate',
                                selected === null && 'text-ink-400',
                            )}
                        >
                            {selected === null
                                ? placeholder
                                : selected.getDate() +
                                  ' ' +
                                  SHORT_MONTHS[selected.getMonth()] +
                                  ' ' +
                                  selected.getFullYear()}
                        </span>
                    </button>
                </PopoverPrimitive.Trigger>
                {clearable && value !== '' && (
                    <button
                        type="button"
                        aria-label="Clear date"
                        onClick={() => onChange('')}
                        className="absolute top-1/2 right-2.5 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-ink-300 transition hover:bg-ink-50 hover:text-ink-600"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            {name && <input type="hidden" name={name} value={value} />}

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    align="start"
                    sideOffset={8}
                    collisionPadding={12}
                    className={cn(
                        'z-50 w-[300px] rounded-2xl border border-line bg-white p-3 shadow-[0_24px_55px_-20px_rgba(13,59,76,0.45)]',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                        'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
                    )}
                >
                    <div className="mb-2 flex items-center justify-between gap-1">
                        <NavButton
                            label={'Previous ' + navLabel}
                            onClick={() => stepMonth(-1)}
                        >
                            <ChevronLeft className="size-4" />
                        </NavButton>
                        <button
                            type="button"
                            onClick={() =>
                                setView(
                                    view === 'days'
                                        ? 'months'
                                        : view === 'months'
                                          ? 'years'
                                          : 'days',
                                )
                            }
                            className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-ink-800 transition hover:bg-ink-50"
                        >
                            {view === 'days' &&
                                MONTHS[month.getMonth()] +
                                    ' ' +
                                    month.getFullYear()}
                            {view === 'months' && month.getFullYear()}
                            {view === 'years' &&
                                yearsStart + ' – ' + (yearsStart + 11)}
                        </button>
                        <NavButton
                            label={'Next ' + navLabel}
                            onClick={() => stepMonth(1)}
                        >
                            <ChevronRight className="size-4" />
                        </NavButton>
                    </div>

                    {view === 'days' && (
                        <>
                            <div className="grid grid-cols-7 gap-0.5 pb-1">
                                {WEEKDAYS.map((day) => (
                                    <span
                                        key={day}
                                        className="grid h-7 place-items-center text-[10px] font-bold tracking-[0.04em] text-ink-300 uppercase"
                                    >
                                        {day.charAt(0)}
                                    </span>
                                ))}
                            </div>
                            <div
                                key={
                                    month.getFullYear() + '-' + month.getMonth()
                                }
                                onKeyDown={onGridKeyDown}
                                className="grid animate-in grid-cols-7 gap-0.5 duration-150 fade-in-0"
                            >
                                {days.map((day) => {
                                    const key = toKey(day);
                                    const isSelected =
                                        selected !== null &&
                                        key === toKey(selected);
                                    const isFocused = key === toKey(focused);
                                    const isOutside =
                                        day.getMonth() !== month.getMonth();
                                    const isDisabled = outOfRange(day);

                                    return (
                                        <button
                                            key={key}
                                            ref={
                                                isFocused
                                                    ? focusedRef
                                                    : undefined
                                            }
                                            type="button"
                                            tabIndex={isFocused ? 0 : -1}
                                            disabled={isDisabled}
                                            aria-label={
                                                day.getDate() +
                                                ' ' +
                                                MONTHS[day.getMonth()] +
                                                ' ' +
                                                day.getFullYear()
                                            }
                                            aria-current={
                                                key === todayKey
                                                    ? 'date'
                                                    : undefined
                                            }
                                            onClick={() => commit(day)}
                                            onFocus={() => setFocused(day)}
                                            className={cn(
                                                'grid h-9 place-items-center rounded-[10px] text-xs font-medium transition outline-none',
                                                'hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-brand-500',
                                                isOutside
                                                    ? 'text-ink-300'
                                                    : 'text-ink-700',
                                                key === todayKey &&
                                                    !isSelected &&
                                                    'font-bold text-brand-700 ring-1 ring-brand-200 ring-inset',
                                                isSelected &&
                                                    'bg-brand-700 font-semibold text-white shadow-[0_6px_14px_-6px_rgba(17,94,116,0.9)] hover:bg-brand-800',
                                                isDisabled &&
                                                    'pointer-events-none opacity-35',
                                            )}
                                        >
                                            {day.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {view === 'months' && (
                        <div className="grid animate-in grid-cols-3 gap-1 duration-150 fade-in-0">
                            {SHORT_MONTHS.map((shortMonth, index) => (
                                <PanelButton
                                    key={shortMonth}
                                    active={index === month.getMonth()}
                                    onClick={() => {
                                        setMonth(
                                            new Date(
                                                month.getFullYear(),
                                                index,
                                                1,
                                            ),
                                        );
                                        setView('days');
                                    }}
                                >
                                    {shortMonth}
                                </PanelButton>
                            ))}
                        </div>
                    )}

                    {view === 'years' && (
                        <div className="grid animate-in grid-cols-3 gap-1 duration-150 fade-in-0">
                            {Array.from(
                                { length: 12 },
                                (_, index) => yearsStart + index,
                            ).map((year) => (
                                <PanelButton
                                    key={year}
                                    active={year === month.getFullYear()}
                                    onClick={() => {
                                        setMonth(
                                            new Date(year, month.getMonth(), 1),
                                        );
                                        setView('months');
                                    }}
                                >
                                    {year}
                                </PanelButton>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-ink-50 pt-2">
                        <button
                            type="button"
                            onClick={() => commit(new Date())}
                            disabled={outOfRange(today)}
                            className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
                        >
                            Today
                        </button>
                        {clearable && value !== '' && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-ink-400 transition hover:bg-ink-50 hover:text-ink-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
}

function NavButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-ink-800"
        >
            {children}
        </button>
    );
}

function PanelButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'h-11 rounded-xl text-xs font-medium transition',
                active
                    ? 'bg-brand-700 font-semibold text-white'
                    : 'text-ink-700 hover:bg-ink-50',
            )}
        >
            {children}
        </button>
    );
}
