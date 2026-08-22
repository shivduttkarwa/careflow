import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    HeartHandshake,
    LoaderCircle,
    ShieldCheck,
    Sparkles,
    UserRoundPlus,
} from 'lucide-react';
import { useState } from 'react';
import CareDate from '@/components/care-date';
import InputError from '@/components/input-error';

const todayKey = () => {
    const now = new Date();

    return (
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0')
    );
};

export default function CreateParticipant() {
    const [dateOfBirth, setDateOfBirth] = useState('');

    return (
        <>
            <Head title="Add participant" />

            <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in">
                    <Link
                        href="/participants"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition hover:text-brand-700"
                    >
                        <ArrowLeft className="size-4" /> All participants
                    </Link>
                    <div className="mt-5 flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                            <UserRoundPlus className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.12em] text-ink-400 uppercase">
                                Participant setup
                            </p>
                            <h1 className="mt-1 text-[30px] font-bold tracking-[-0.03em] text-ink-900 sm:text-[36px]">
                                Add a participant
                            </h1>
                            <p className="mt-2 max-w-xl text-base leading-7 text-ink-500">
                                Create a clean participant profile before
                                starting their first care record.
                            </p>
                        </div>
                    </div>
                </header>

                <Form
                    action="/participants"
                    method="post"
                    className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
                >
                    {({ processing, errors }) => (
                        <>
                            <section className="animate-rise-in animation-delay-1 care-card p-5 sm:p-8">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <label className="block sm:col-span-2">
                                        <span className="care-label">
                                            Participant full name{' '}
                                            <span className="text-alert-600">
                                                *
                                            </span>
                                        </span>
                                        <div className="relative">
                                            <UserRoundPlus className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                                            <input
                                                name="name"
                                                required
                                                autoFocus
                                                placeholder="e.g. Taylor Morgan"
                                                className="care-field pr-3 pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </label>

                                    <label className="block">
                                        <span className="care-label">
                                            Preferred name{' '}
                                            <span className="font-normal text-ink-400">
                                                Optional
                                            </span>
                                        </span>
                                        <input
                                            name="preferred_name"
                                            placeholder="Name used day to day"
                                            className="care-field"
                                        />
                                        <InputError
                                            message={errors.preferred_name}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="care-label">
                                            Date of birth{' '}
                                            <span className="font-normal text-ink-400">
                                                Optional
                                            </span>
                                        </span>
                                        <CareDate
                                            size="lg"
                                            name="date_of_birth"
                                            label="Date of birth"
                                            placeholder="Select date of birth"
                                            value={dateOfBirth}
                                            onChange={setDateOfBirth}
                                            max={todayKey()}
                                            clearable
                                        />
                                        <InputError
                                            message={errors.date_of_birth}
                                        />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="care-label">
                                            Service or house{' '}
                                            <span className="font-normal text-ink-400">
                                                Optional
                                            </span>
                                        </span>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                                            <input
                                                name="home_name"
                                                placeholder="Defaults to Care service"
                                                className="care-field pr-3 pl-10"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.home_name}
                                        />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="care-label">
                                            Support preferences{' '}
                                            <span className="font-normal text-ink-400">
                                                Optional
                                            </span>
                                        </span>
                                        <textarea
                                            name="support_summary"
                                            rows={5}
                                            placeholder="Communication preferences, routines or important support notes…"
                                            className="care-textarea"
                                        />
                                        <InputError
                                            message={errors.support_summary}
                                        />
                                    </label>
                                </div>

                                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <Link
                                        href="/participants"
                                        className="btn-ghost"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn-primary group px-6"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="size-4 animate-spin" />{' '}
                                                Adding participant…
                                            </>
                                        ) : (
                                            <>
                                                Add participant and start record{' '}
                                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <aside className="animate-rise-in animation-delay-2 space-y-4">
                                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
                                    <div className="grid size-10 place-items-center rounded-xl bg-white text-brand-700 shadow-card">
                                        <HeartHandshake className="size-[18px]" />
                                    </div>
                                    <h2 className="mt-5 text-base font-semibold tracking-[-0.01em]">
                                        Ready for the care team
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-ink-600">
                                        The participant will be assigned to the
                                        support-worker team and available in new
                                        care records immediately.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-warn-100 bg-warn-50 p-6">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-warn-700">
                                        <Sparkles className="size-4" /> Keep it
                                        useful
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-ink-600">
                                        Add only the information staff need to
                                        provide safe, respectful support. More
                                        details can be added later.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2 px-2 text-[10px] leading-4 text-ink-400">
                                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-500" />{' '}
                                    Creation is recorded in the secure audit
                                    log.
                                </div>
                            </aside>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
