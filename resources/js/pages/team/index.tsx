import { Form, Head, router } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    LoaderCircle,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    UserRound,
    UserRoundPlus,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CareSelect from '@/components/care-select';
import InputError from '@/components/input-error';

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_manager: boolean;
    participant_ids: number[];
    submitted_reports_count: number;
    last_report_date: string | null;
};

type Facility = {
    id: number;
    name: string;
    address: string | null;
    participants: { id: number; name: string }[];
};

type Props = { members: Member[]; facilities: Facility[] };

type Coverage = 'none' | 'partial' | 'all';

function coverageOf(facility: Facility, selected: number[]): Coverage {
    const covered = facility.participants.filter((participant) =>
        selected.includes(participant.id),
    ).length;

    if (covered === 0) {
        return 'none';
    }

    return covered === facility.participants.length ? 'all' : 'partial';
}

export default function TeamAccess({ members, facilities }: Props) {
    const [role, setRole] = useState('support_worker');
    const [newMemberParticipants, setNewMemberParticipants] = useState<
        number[]
    >([]);

    return (
        <>
            <Head title="Team access" />

            <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
                <header className="animate-rise-in">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-ink-400 uppercase">
                        <ShieldCheck className="size-3.5 text-brand-600" />{' '}
                        Manager only
                    </div>
                    <h1 className="text-[30px] font-bold tracking-[-0.03em] text-ink-900 sm:text-[36px]">
                        Team access
                    </h1>
                    <p className="mt-2 max-w-2xl text-base leading-7 text-ink-500">
                        Accounts are created here — staff cannot sign themselves
                        up. Give a support worker a whole facility, or pick
                        individual participants within one.
                    </p>
                </header>

                <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="animate-rise-in animation-delay-1 space-y-4">
                        {members.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                facilities={facilities}
                            />
                        ))}
                    </section>

                    <aside className="animate-rise-in animation-delay-2">
                        <Form
                            action="/team"
                            method="post"
                            resetOnSuccess
                            onSuccess={() => {
                                setRole('support_worker');
                                setNewMemberParticipants([]);
                            }}
                            className="care-card p-5 sm:p-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                                        <UserRoundPlus className="size-5" />
                                    </div>
                                    <h2 className="mt-4 text-base font-semibold tracking-[-0.025em]">
                                        Add a team member
                                    </h2>
                                    <p className="mt-1.5 text-xs leading-5 text-ink-500">
                                        They can sign in straight away with the
                                        password you set.
                                    </p>

                                    <div className="mt-5 space-y-4">
                                        <label className="block">
                                            <span className="care-label">
                                                Full name
                                            </span>
                                            <input
                                                name="name"
                                                required
                                                placeholder="e.g. Jordan Fielding"
                                                className="care-field"
                                            />
                                            <InputError message={errors.name} />
                                        </label>

                                        <label className="block">
                                            <span className="care-label">
                                                Email address
                                            </span>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="name@service.com.au"
                                                    className="care-field pl-10"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="care-label">
                                                Role
                                            </span>
                                            <CareSelect
                                                size="lg"
                                                name="role"
                                                label="Role"
                                                value={role}
                                                onChange={setRole}
                                                options={[
                                                    {
                                                        value: 'support_worker',
                                                        label: 'Support worker',
                                                        hint: 'Sees only assigned facilities',
                                                    },
                                                    {
                                                        value: 'manager',
                                                        label: 'Manager',
                                                        hint: 'Full access to every facility',
                                                    },
                                                ]}
                                            />
                                            <InputError message={errors.role} />
                                        </label>

                                        <label className="block">
                                            <span className="care-label">
                                                Temporary password
                                            </span>
                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    required
                                                    autoComplete="new-password"
                                                    className="care-field pl-10"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="care-label">
                                                Confirm password
                                            </span>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                autoComplete="new-password"
                                                className="care-field"
                                            />
                                        </label>

                                        {role === 'support_worker' &&
                                            facilities.length > 0 && (
                                                <fieldset>
                                                    <legend className="care-label">
                                                        Facility access
                                                    </legend>
                                                    <div className="max-h-72 overflow-y-auto rounded-xl border border-line bg-surface-soft p-2.5">
                                                        <FacilityPicker
                                                            facilities={
                                                                facilities
                                                            }
                                                            selected={
                                                                newMemberParticipants
                                                            }
                                                            onChange={
                                                                setNewMemberParticipants
                                                            }
                                                            compact
                                                        />
                                                    </div>
                                                    {newMemberParticipants.map(
                                                        (id) => (
                                                            <input
                                                                key={id}
                                                                type="hidden"
                                                                name="participants[]"
                                                                value={id}
                                                            />
                                                        ),
                                                    )}
                                                </fieldset>
                                            )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn-primary mt-6 w-full"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="size-4 animate-spin" />{' '}
                                                Creating account…
                                            </>
                                        ) : (
                                            'Create account'
                                        )}
                                    </button>

                                    <p className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-ink-400">
                                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
                                        Account creation and every access change
                                        is written to the audit log.
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

function FacilityPicker({
    facilities,
    selected,
    onChange,
    compact = false,
}: {
    facilities: Facility[];
    selected: number[];
    onChange: (next: number[]) => void;
    compact?: boolean;
}) {
    const toggleParticipant = (id: number) =>
        onChange(
            selected.includes(id)
                ? selected.filter((value) => value !== id)
                : [...selected, id],
        );

    const toggleFacility = (facility: Facility) => {
        const ids = facility.participants.map((participant) => participant.id);

        onChange(
            coverageOf(facility, selected) === 'all'
                ? selected.filter((id) => !ids.includes(id))
                : [...selected.filter((id) => !ids.includes(id)), ...ids],
        );
    };

    return (
        <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
            {facilities.map((facility) => {
                const coverage = coverageOf(facility, selected);

                return (
                    <div
                        key={facility.id}
                        className={`rounded-xl border transition ${
                            coverage === 'none'
                                ? 'border-line bg-white'
                                : 'border-brand-200 bg-brand-50'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => toggleFacility(facility)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                        >
                            <span
                                className={`grid size-7 shrink-0 place-items-center rounded-lg transition ${
                                    coverage === 'all'
                                        ? 'bg-brand-700 text-white'
                                        : coverage === 'partial'
                                          ? 'bg-brand-100 text-brand-800'
                                          : 'bg-ink-100 text-ink-400'
                                }`}
                            >
                                <Building2 className="size-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-ink-900">
                                    {facility.name}
                                </span>
                                {!compact && facility.address && (
                                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-400">
                                        <MapPin className="size-2.5 shrink-0" />
                                        <span className="truncate">
                                            {facility.address}
                                        </span>
                                    </span>
                                )}
                            </span>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.05em] uppercase ${
                                    coverage === 'all'
                                        ? 'bg-grow-100 text-grow-700'
                                        : coverage === 'partial'
                                          ? 'bg-warn-100 text-warn-700'
                                          : 'bg-ink-100 text-ink-400'
                                }`}
                            >
                                {coverage === 'all'
                                    ? 'Full facility'
                                    : coverage === 'partial'
                                      ? `${facility.participants.filter((participant) => selected.includes(participant.id)).length}/${facility.participants.length}`
                                      : 'No access'}
                            </span>
                        </button>

                        <div className="flex flex-wrap gap-1.5 border-t border-line-soft px-3 py-2.5">
                            {facility.participants.map((participant) => {
                                const active = selected.includes(
                                    participant.id,
                                );

                                return (
                                    <button
                                        key={participant.id}
                                        type="button"
                                        onClick={() =>
                                            toggleParticipant(participant.id)
                                        }
                                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                            active
                                                ? 'border-brand-400 bg-white text-brand-800'
                                                : 'border-line bg-white text-ink-400 hover:border-brand-200'
                                        }`}
                                    >
                                        {active && (
                                            <CheckCircle2 className="size-3" />
                                        )}
                                        {participant.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MemberCard({
    member,
    facilities,
}: {
    member: Member;
    facilities: Facility[];
}) {
    const [selected, setSelected] = useState<number[]>(member.participant_ids);
    const [saving, setSaving] = useState(false);

    const dirty =
        selected.length !== member.participant_ids.length ||
        selected.some((id) => !member.participant_ids.includes(id));

    const savedFacilities = useMemo(
        () =>
            facilities
                .map((facility) => ({
                    facility,
                    coverage: coverageOf(facility, member.participant_ids),
                }))
                .filter(({ coverage }) => coverage !== 'none'),
        [facilities, member.participant_ids],
    );

    const save = () => {
        setSaving(true);
        router.put(
            `/team/${member.id}/assignments`,
            { participants: selected },
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
        <article className="care-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
                <div
                    className={`grid size-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white ${member.is_manager ? 'bg-accent-600' : 'bg-brand-700'}`}
                >
                    {initials}
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{member.name}</h2>
                    <p className="mt-0.5 truncate text-[11px] text-ink-400">
                        {member.email}
                    </p>
                </div>
                <span className="pill-neutral ml-auto">
                    {member.is_manager ? 'Manager' : 'Support worker'}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-400">
                <span>
                    <span className="font-semibold text-ink-700">
                        {member.submitted_reports_count}
                    </span>{' '}
                    submitted records
                </span>
                <span>·</span>
                <span>
                    {member.last_report_date
                        ? `Last record ${member.last_report_date}`
                        : 'No records yet'}
                </span>
                {!member.is_manager && (
                    <>
                        <span>·</span>
                        <span>
                            {savedFacilities.length === 0
                                ? 'No facility'
                                : `${savedFacilities.length} of ${facilities.length} facilities`}
                        </span>
                    </>
                )}
            </div>

            {member.is_manager ? (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3.5 py-3 text-[11px] text-ink-500">
                    <Users className="size-3.5 shrink-0 text-ink-400" />{' '}
                    Managers can see every participant across all facilities.
                </p>
            ) : (
                <div className="mt-4 border-t border-line-soft pt-4">
                    <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.08em] text-ink-400 uppercase">
                        <UserRound className="size-3.5 text-brand-600" />{' '}
                        Facility &amp; participant access
                    </div>

                    {facilities.length === 0 ? (
                        <p className="text-xs text-ink-400">
                            Add a participant before granting access.
                        </p>
                    ) : (
                        <FacilityPicker
                            facilities={facilities}
                            selected={selected}
                            onChange={setSelected}
                        />
                    )}

                    {dirty && (
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={save}
                                disabled={saving}
                                className="btn-primary h-10 px-4 text-xs"
                            >
                                {saving ? (
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                ) : null}{' '}
                                Save access
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelected(member.participant_ids)
                                }
                                className="text-[11px] font-semibold text-ink-400 hover:text-ink-700"
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
