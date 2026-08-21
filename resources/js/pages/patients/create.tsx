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

    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
};

export default function CreatePatient() {
    const [dateOfBirth, setDateOfBirth] = useState('');

    return (
        <>
            <Head title="Add patient" />

            <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in">
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667870] transition hover:text-[#2c5748]">
                        <ArrowLeft className="size-4" /> Back to overview
                    </Link>
                    <div className="mt-5 flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-[#dfece5] text-[#285b4c]">
                            <UserRoundPlus className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.12em] text-[#74847c] uppercase">Patient setup</p>
                            <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">Add a patient</h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#718079]">Create a clean patient profile before starting their first care record.</p>
                        </div>
                    </div>
                </header>

                <Form action="/patients" method="post" className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {({ processing, errors }) => (
                        <>
                            <section className="animate-rise-in animation-delay-1 rounded-[26px] border border-[#dce4df] bg-white p-5 shadow-[0_10px_35px_rgba(32,55,46,0.045)] sm:p-8">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <label className="block sm:col-span-2">
                                        <span className="mb-2 block text-xs font-semibold text-[#40534b]">Patient full name <span className="text-[#b35f50]">*</span></span>
                                        <div className="relative">
                                            <UserRoundPlus className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#89958f]" />
                                            <input name="name" required autoFocus placeholder="e.g. Taylor Morgan" className="h-12 w-full rounded-xl border border-[#d8e1db] bg-[#fbfcfb] pr-3 pl-10 text-sm outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#d8e9e1]/70" />
                                        </div>
                                        <InputError message={errors.name} />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-xs font-semibold text-[#40534b]">Preferred name <span className="font-normal text-[#89958f]">Optional</span></span>
                                        <input name="preferred_name" placeholder="Name used day to day" className="h-12 w-full rounded-xl border border-[#d8e1db] bg-[#fbfcfb] px-3.5 text-sm outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#d8e9e1]/70" />
                                        <InputError message={errors.preferred_name} />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-xs font-semibold text-[#40534b]">Date of birth <span className="font-normal text-[#89958f]">Optional</span></span>
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
                                        <InputError message={errors.date_of_birth} />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="mb-2 block text-xs font-semibold text-[#40534b]">Service or home <span className="font-normal text-[#89958f]">Optional</span></span>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#89958f]" />
                                            <input name="home_name" placeholder="Defaults to Care service" className="h-12 w-full rounded-xl border border-[#d8e1db] bg-[#fbfcfb] pr-3 pl-10 text-sm outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#d8e9e1]/70" />
                                        </div>
                                        <InputError message={errors.home_name} />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="mb-2 block text-xs font-semibold text-[#40534b]">Support preferences <span className="font-normal text-[#89958f]">Optional</span></span>
                                        <textarea name="support_summary" rows={5} placeholder="Communication preferences, routines or important support notes…" className="w-full resize-none rounded-xl border border-[#d8e1db] bg-[#fbfcfb] px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#d8e9e1]/70" />
                                        <InputError message={errors.support_summary} />
                                    </label>
                                </div>

                                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e7ebe8] pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <Link href="/dashboard" className="flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-[#687770] transition hover:bg-[#f1f4f1]">Cancel</Link>
                                    <button type="submit" disabled={processing} className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#285b4c] px-6 text-sm font-semibold text-white shadow-[0_9px_22px_rgba(40,91,76,0.2)] transition hover:-translate-y-0.5 hover:bg-[#204d40] disabled:translate-y-0 disabled:opacity-60">
                                        {processing ? <><LoaderCircle className="size-4 animate-spin" /> Adding patient…</> : <>Add patient and start note <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></>}
                                    </button>
                                </div>
                            </section>

                            <aside className="animate-rise-in animation-delay-2 space-y-4">
                                <div className="rounded-[24px] border border-[#dbe5df] bg-[#eaf2ee] p-6">
                                    <div className="grid size-10 place-items-center rounded-[14px] bg-white/80 text-[#32624f]"><HeartHandshake className="size-[18px]" /></div>
                                    <h2 className="mt-5 text-base font-semibold tracking-[-0.025em]">Ready for the care team</h2>
                                    <p className="mt-2 text-xs leading-5 text-[#607269]">The patient will be assigned to the support-worker team and available in new daily notes immediately.</p>
                                </div>
                                <div className="rounded-[24px] border border-[#e5e0d4] bg-[#fffdf8] p-6">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#655a45]"><Sparkles className="size-4 text-[#ae8147]" /> Keep it useful</div>
                                    <p className="mt-3 text-xs leading-5 text-[#7b725f]">Add only the information staff need to provide safe, respectful support. More details can be added later.</p>
                                </div>
                                <div className="flex items-start gap-2 px-2 text-[10px] leading-4 text-[#8b9791]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#5d8475]" /> Creation is recorded in the secure audit log.</div>
                            </aside>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
