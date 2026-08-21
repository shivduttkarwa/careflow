import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

const EMPTY_VALUE = '__care_select_empty__';

export type CareSelectOption = {
    value: string;
    label: string;
    hint?: string;
    disabled?: boolean;
};

type Size = 'sm' | 'md' | 'lg';

type Props = {
    value: string;
    onChange: (value: string) => void;
    options: CareSelectOption[];
    placeholder?: string;
    icon?: ComponentType<{ className?: string }>;
    size?: Size;
    name?: string;
    id?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    contentClassName?: string;
};

const triggerSizes: Record<Size, string> = {
    sm: 'h-10 px-3 text-xs',
    md: 'h-11 px-3.5 text-xs',
    lg: 'h-12 px-3.5 text-sm',
};

const iconSpacing: Record<Size, string> = {
    sm: 'pl-9',
    md: 'pl-10',
    lg: 'pl-10',
};

const toInner = (value: string) => (value === '' ? EMPTY_VALUE : value);

export default function CareSelect({
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
    size = 'md',
    name,
    id,
    label,
    disabled = false,
    className,
    contentClassName,
}: Props) {
    return (
        <SelectPrimitive.Root
            value={toInner(value)}
            onValueChange={(next) => onChange(next === EMPTY_VALUE ? '' : next)}
            disabled={disabled}
        >
            <div className={cn('relative', className)}>
                {Icon && (
                    <Icon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-[#87938d]" />
                )}
                <SelectPrimitive.Trigger
                    id={id}
                    aria-label={label}
                    className={cn(
                        'group flex w-full items-center justify-between gap-2 rounded-xl border border-[#dce3df] bg-[#fafbfa] font-medium text-[#43554d] transition outline-none',
                        'hover:border-[#bed0c7] hover:bg-white',
                        'focus-visible:border-[#7ba695] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#dcebe4]/70',
                        'data-[state=open]:border-[#7ba695] data-[state=open]:bg-white data-[state=open]:ring-4 data-[state=open]:ring-[#dcebe4]/70',
                        'disabled:cursor-not-allowed disabled:opacity-55 data-[placeholder]:text-[#8b968f]',
                        triggerSizes[size],
                        Icon && iconSpacing[size],
                    )}
                >
                    <span className="truncate text-left">
                        <SelectPrimitive.Value placeholder={placeholder} />
                    </span>
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="size-4 shrink-0 text-[#8b968f] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
            </div>

            {name && <input type="hidden" name={name} value={value} />}

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={8}
                    align="start"
                    collisionPadding={12}
                    className={cn(
                        'z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[max(var(--radix-select-trigger-width),11rem)] overflow-hidden rounded-2xl border border-[#dbe3de] bg-white p-1.5 shadow-[0_24px_55px_-20px_rgba(20,45,37,0.5)]',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                        'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
                        contentClassName,
                    )}
                >
                    <SelectPrimitive.ScrollUpButton className="flex h-5 items-center justify-center text-[#8b968f]">
                        <ChevronUp className="size-3.5" />
                    </SelectPrimitive.ScrollUpButton>
                    <SelectPrimitive.Viewport className="space-y-0.5">
                        {options.map((option) => (
                            <SelectPrimitive.Item
                                key={option.value}
                                value={toInner(option.value)}
                                disabled={option.disabled}
                                className={cn(
                                    'relative flex cursor-pointer items-center rounded-xl py-2.5 pr-9 pl-3 text-xs font-medium text-[#4d5f57] transition outline-none select-none',
                                    'data-highlighted:bg-[#eef3f0] data-highlighted:text-[#22493c]',
                                    'data-[state=checked]:bg-[#e6efea] data-[state=checked]:font-semibold data-[state=checked]:text-[#2a6250]',
                                    'data-disabled:pointer-events-none data-disabled:opacity-45',
                                )}
                            >
                                <span className="min-w-0">
                                    <SelectPrimitive.ItemText>
                                        {option.label}
                                    </SelectPrimitive.ItemText>
                                    {option.hint && (
                                        <span className="mt-0.5 block truncate text-[11px] font-normal text-[#8a958f]">
                                            {option.hint}
                                        </span>
                                    )}
                                </span>
                                <SelectPrimitive.ItemIndicator className="absolute right-3">
                                    <Check className="size-3.5 text-[#3f7c67]" />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>
                    <SelectPrimitive.ScrollDownButton className="flex h-5 items-center justify-center text-[#8b968f]">
                        <ChevronDown className="size-3.5" />
                    </SelectPrimitive.ScrollDownButton>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
