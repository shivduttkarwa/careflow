import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
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

export default function Login({ status, canResetPassword, demoAccounts = [] }: Props) {
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

            {status && <div className="mb-5 rounded-xl border border-[#cfe0d7] bg-[#edf5f0] px-4 py-3 text-xs font-medium text-[#32634f]">{status}</div>}

            <Form {...store.form()} resetOnSuccess={['password']} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold text-[#40534b]">Email address</span>
                            <div className="relative"><Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#89958f]" /><input id="email" type="email" name="email" required autoFocus autoComplete="email" placeholder="you@service.com.au" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8e1db] bg-white pr-3 pl-10 text-sm outline-none transition placeholder:text-[#a8b1ad] focus:border-[#7ba695] focus:ring-4 focus:ring-[#d8e9e1]/70" /></div>
                            <InputError message={errors.email} />
                        </label>

                        <label className="block">
                            <span className="mb-2 flex items-center justify-between text-xs font-semibold text-[#40534b]">Password{canResetPassword && <Link href={request()} className="font-medium text-[#47725f] hover:text-[#285442]">Forgot password?</Link>}</span>
                            <div className="relative"><KeyRound className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-[#89958f]" /><PasswordInput id="password" name="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl border-[#d8e1db] bg-white pr-10 pl-10 shadow-none focus-visible:border-[#7ba695] focus-visible:ring-[#d8e9e1]/70" /></div>
                            <InputError message={errors.password} />
                        </label>

                        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#6f7d76]"><input type="checkbox" name="remember" value="1" className="size-4 rounded border-[#cbd6d0] accent-[#2e6652]" /> Keep me signed in on this device</label>

                        <button type="submit" disabled={processing} data-test="login-button" className="group flex h-13 w-full items-center justify-center gap-2 rounded-[15px] bg-[#285b4c] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(40,91,76,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#204d40] hover:shadow-[0_14px_28px_rgba(40,91,76,0.24)] disabled:opacity-60">
                            {processing ? 'Signing in…' : 'Sign in securely'}
                            {!processing && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
                        </button>
                    </>
                )}
            </Form>

            {demoAccounts.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[#dfe5e1] bg-[#f8faf8] p-4">
                    <p className="text-[10px] font-bold tracking-[0.08em] text-[#839089] uppercase">MVP demo accounts</p>
                    <p className="mt-1.5 text-xs leading-5 text-[#64736c]">
                        Select an account to fill the form, then sign in. Managers see every facility; support workers see
                        only what they are assigned.
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
                                    className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                                        active
                                            ? 'border-[#a9c4b9] bg-white shadow-[0_4px_12px_rgba(40,91,76,0.07)]'
                                            : 'border-transparent hover:border-[#dde5e0] hover:bg-white'
                                    }`}
                                >
                                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-white ${isManager ? 'bg-[#4c6e8a]' : 'bg-[#386B5A]'}`}>
                                        {isManager ? <ShieldCheck className="size-3.5" /> : <UserRound className="size-3.5" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-semibold text-[#31463f]">{account.name}</span>
                                        <span className="block truncate text-[10px] text-[#8b9791]">{account.email}</span>
                                    </span>
                                    <span className="shrink-0 rounded-full bg-[#eef2ef] px-2 py-0.5 text-[9px] font-bold tracking-[0.05em] text-[#76837d] uppercase">
                                        {roleLabels[account.role] ?? account.role}
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
