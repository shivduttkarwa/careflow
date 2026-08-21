import { Form, Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    LoaderCircle,
    Lock,
    Mail,
    ShieldCheck,
    UserRound,
    UserRoundPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import CareSelect from '@/components/care-select';
import InputError from '@/components/input-error';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_manager: boolean;
    patient_ids: number[];
    submitted_reports_count: number;
    last_report_date: string | null;
};

type PatientOption = { id: number; name: string; home: string };

type Props = { members: Member[]; patients: PatientOption[] };

const fieldClass =
    'h-12 w-full rounded-xl border border-[#d8e1db] bg-[#fbfcfb] px-3.5 text-sm outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:bg-white focus:ring-4 focus:ring-[#d8e9e1]/70';

export default function TeamAccess({ members, patients }: Props) {
    const [role, setRole] = useState('support_worker');

    return (
        <>
            <Head title="Team access" />

            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-[#77867f] uppercase">
                        <ShieldCheck className="size-3.5 text-[#467864]" /> Manager only
                    </div>
                    <h1 className="text-[30px] font-semibold tracking-[-0.045em] sm:text-[36px]">Team access</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718079]">
                        Accounts are created here — staff cannot sign themselves up. Each support worker only sees the
                        patients you give them access to.
                    </p>
                </header>

                <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="animate-rise-in animation-delay-1 space-y-4">
                        {members.map((member) => (
                            <MemberCard key={member.id} member={member} patients={patients} />
                        ))}
                    </section>

                    <aside className="animate-rise-in animation-delay-2">
                        <Form
                            action="/team"
                            method="post"
                            resetOnSuccess
                            onSuccess={() => setRole('support_worker')}
                            className="rounded-[26px] border border-[#dce4df] bg-white p-5 shadow-[0_10px_35px_rgba(32,55,46,0.045)] sm:p-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid size-11 place-items-center rounded-[15px] bg-[#dfece5] text-[#285b4c]">
                                        <UserRoundPlus className="size-5" />
                                    </div>
                                    <h2 className="mt-4 text-base font-semibold tracking-[-0.025em]">Add a team member</h2>
                                    <p className="mt-1.5 text-xs leading-5 text-[#7b8a83]">
                                        They can sign in straight away with the password you set.
                                    </p>

                                    <div className="mt-5 space-y-4">
                                        <label className="block">
                                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Full name</span>
                                            <input name="name" required placeholder="e.g. Jordan Fielding" className={fieldClass} />
                                            <InputError message={errors.name} />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Email address</span>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#89958f]" />
                                                <input type="email" name="email" required placeholder="name@service.com.au" className={`${fieldClass} pl-10`} />
                                            </div>
                                            <InputError message={errors.email} />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Role</span>
                                            <CareSelect
                                                size="lg"
                                                name="role"
                                                label="Role"
                                                value={role}
                                                onChange={setRole}
                                                options={[
                                                    { value: 'support_worker', label: 'Support worker', hint: 'Sees only assigned patients' },
                                                    { value: 'manager', label: 'Manager', hint: 'Full access to every record' },
                                                ]}
                                            />
                                            <InputError message={errors.role} />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Temporary password</span>
                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#89958f]" />
                                                <input type="password" name="password" required autoComplete="new-password" className={`${fieldClass} pl-10`} />
                                            </div>
                                            <InputError message={errors.password} />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Confirm password</span>
                                            <input type="password" name="password_confirmation" required autoComplete="new-password" className={fieldClass} />
                                        </label>

                                        {patients.length > 0 && (
                                            <fieldset>
                                                <legend className="mb-2 text-xs font-semibold text-[#40534b]">Patient access</legend>
                                                <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-[#e2e8e4] bg-[#fbfcfb] p-2.5">
                                                    {patients.map((patient) => (
                                                        <label key={patient.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition hover:bg-white">
                                                            <input type="checkbox" name="patients[]" value={patient.id} className="size-4 accent-[#2f6250]" />
                                                            <span className="font-medium text-[#41564d]">{patient.name}</span>
                                                            <span className="ml-auto text-[10px] text-[#8b9791]">{patient.home}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </fieldset>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#285b4c] text-sm font-semibold text-white shadow-[0_9px_22px_rgba(40,91,76,0.2)] transition hover:-translate-y-0.5 hover:bg-[#204d40] disabled:translate-y-0 disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="size-4 animate-spin" /> Creating account…
                                            </>
                                        ) : (
                                            'Create account'
                                        )}
                                    </button>

                                    <p className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-[#8b9791]">
                                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#5d8475]" />
                                        Account creation and every access change is written to the audit log.
                                    </p>
                                </>
                            )}
                        </Form>
                    </aside>
                </div>
            </div>
        </>
    );
}

function MemberCard({ member, patients }: { member: Member; patients: PatientOption[] }) {
    const [selected, setSelected] = useState<number[]>(member.patient_ids);
    const [saving, setSaving] = useState(false);

    const dirty =
        selected.length !== member.patient_ids.length ||
        selected.some((id) => !member.patient_ids.includes(id));

    const toggle = (id: number) =>
        setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

    const save = () => {
        setSaving(true);
        router.put(
            `/team/${member.id}/assignments`,
            { patients: selected },
            { preserveScroll: true, onFinish: () => setSaving(false) },
        );
    };

    const initials = member.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <article className="rounded-[24px] border border-[#dce4df] bg-white p-5 shadow-[0_8px_28px_rgba(31,55,46,0.04)] sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className={`grid size-11 shrink-0 place-items-center rounded-[15px] text-xs font-bold text-white ${member.is_manager ? 'bg-[#4c6e8a]' : 'bg-[#386B5A]'}`}>
                    {initials}
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{member.name}</h2>
                    <p className="mt-0.5 truncate text-[11px] text-[#829089]">{member.email}</p>
                </div>
                <span className="ml-auto rounded-full bg-[#f0f3f0] px-2.5 py-1 text-[9px] font-bold tracking-[0.05em] text-[#76837d] uppercase">
                    {member.is_manager ? 'Manager' : 'Support worker'}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#7e8b85]">
                <span>
                    <span className="font-semibold text-[#42574e]">{member.submitted_reports_count}</span> submitted records
                </span>
                <span>·</span>
                <span>{member.last_report_date ? `Last note ${member.last_report_date}` : 'No notes yet'}</span>
            </div>

            {member.is_manager ? (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#f4f7f5] px-3.5 py-3 text-[11px] text-[#67766f]">
                    <Users className="size-3.5 shrink-0 text-[#7e8f87]" /> Managers can see every patient across all homes.
                </p>
            ) : (
                <div className="mt-4 border-t border-[#eef1ef] pt-4">
                    <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.08em] text-[#77867f] uppercase">
                        <UserRound className="size-3.5 text-[#688078]" /> Patient access
                    </div>

                    {patients.length === 0 ? (
                        <p className="text-xs text-[#8b9791]">Add a patient before granting access.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {patients.map((patient) => {
                                const active = selected.includes(patient.id);

                                return (
                                    <button
                                        key={patient.id}
                                        type="button"
                                        onClick={() => toggle(patient.id)}
                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                                            active
                                                ? 'border-[#a9c4b9] bg-[#e8f0ec] text-[#2f6250]'
                                                : 'border-[#e0e6e2] bg-white text-[#8b9791] hover:border-[#c3d2cb]'
                                        }`}
                                    >
                                        {active && <CheckCircle2 className="size-3.5" />}
                                        {patient.name}
                                        <span className="font-normal opacity-70">{patient.home}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {dirty && (
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={save}
                                disabled={saving}
                                className="flex h-10 items-center gap-2 rounded-xl bg-[#285b4c] px-4 text-xs font-semibold text-white transition hover:bg-[#204d40] disabled:opacity-60"
                            >
                                {saving ? <LoaderCircle className="size-3.5 animate-spin" /> : null} Save access
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelected(member.patient_ids)}
                                className="text-[11px] font-semibold text-[#7e8a85] hover:text-[#41564d]"
                            >
                                Undo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
