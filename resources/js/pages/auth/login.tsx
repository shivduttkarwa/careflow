import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    KeyRound,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type DemoAccount = {
    name: string;
    email: string;
    role: string;
    password: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    demoAccounts?: DemoAccount[];
};

const roleLabels: Record<string, string> = {
    manager: 'Manager',
    administrator: 'Administrator',
    support_worker: 'Support worker',
};

export default function Login({
    status,
    canResetPassword,
    demoAccounts = [],
}: Props) {
    const [email, setEmail] = useState(demoAccounts[0]?.email ?? '');
    const [password, setPassword] = useState(demoAccounts[0]?.password ?? '');

    const fillFrom = (account: DemoAccount) => {
        setEmail(account.email);
        setPassword(account.password);
    };

    return (
        <>
            <Head title="Sign in" />
            <PasskeyVerify />

            {status && (
                <div className="mb-5 rounded-lg border border-grow-200 bg-grow-50 px-4 py-3 text-xs font-medium text-grow-700">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <label className="block">
                            <span className="care-label">Email address</span>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="you@service.com.au"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    className="care-field bg-white pr-3 pl-10"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </label>

                        <label className="block">
                            <span className="care-label flex items-center justify-between">
                                Password
                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </span>
                            <div className="relative">
                                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-ink-400" />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    className="h-12 rounded-lg border-line bg-white pr-10 pl-10 shadow-none focus-visible:border-brand-500 focus-visible:ring-brand-100"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </label>

                        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-500">
                            <input
                                type="checkbox"
                                name="remember"
                                value="1"
                                className="size-4 rounded border-ink-200 accent-brand-700"
                            />
                            Keep me signed in on this device
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            data-test="login-button"
                            className="btn-primary group w-full"
                        >
                            {processing ? 'Signing in…' : 'Sign in securely'}
                            {!processing && (
                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                            )}
                        </button>
                    </>
                )}
            </Form>

            {demoAccounts.length > 0 && (
                <div className="mt-6 rounded-xl border border-line-soft bg-surface p-4">
                    <p className="text-[10px] font-bold tracking-[0.08em] text-ink-400 uppercase">
                        MVP demo accounts
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-ink-500">
                        Select an account to fill the form, then sign in.
                        Managers see every service; support workers see only the
                        participants they are assigned.
                    </p>

                    <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
                        {demoAccounts.map((account) => {
                            const active = account.email === email;
                            const isManager = account.role !== 'support_worker';

                            return (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => fillFrom(account)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                                        active
                                            ? 'border-brand-300 bg-white shadow-card'
                                            : 'border-transparent hover:border-line hover:bg-white'
                                    }`}
                                >
                                    <span
                                        className={`grid size-7 shrink-0 place-items-center rounded-lg text-white ${isManager ? 'bg-accent-600' : 'bg-brand-700'}`}
                                    >
                                        {isManager ? (
                                            <ShieldCheck className="size-3.5" />
                                        ) : (
                                            <UserRound className="size-3.5" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-semibold text-ink-900">
                                            {account.name}
                                        </span>
                                        <span className="block truncate text-[10px] text-ink-400">
                                            {account.email}
                                        </span>
                                    </span>
                                    <span className="pill-neutral shrink-0">
                                        {roleLabels[account.role] ??
                                            account.role}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to view your shift, handover and care records.',
};
