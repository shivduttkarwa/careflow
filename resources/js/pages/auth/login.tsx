import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
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
                            />{' '}
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

            <div className="mt-6 rounded-xl border border-line-soft bg-surface p-4">
                <p className="text-[10px] font-bold tracking-[0.08em] text-ink-400 uppercase">
                    MVP demo account
                </p>
                <p className="mt-1.5 text-xs leading-5 text-ink-500">
                    The support-worker credentials are pre-filled. Select “Sign
                    in securely” to explore the care workflow.
                </p>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to view your shift, handover and care records.',
};
