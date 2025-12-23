import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { login as loginApi } from '../../api/admin/loginApi';
import IconGoogle from '../../components/Icon/IconGoogle';
import IconFacebook from '../../components/Icon/IconFacebook';
import IconApple from '../../components/Icon/IconApple';
import IconMail from '../../components/Icon/IconMail';
import IconMailDot from '../../components/Icon/IconMailDot';
import IconCheck from '../../components/Icon/IconCheck';
import IconEye from '../../components/Icon/IconEye';
import IconEyeOff from '../../components/Icon/IconEyeOff';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@gmail.com');
    const [password, setPassword] = useState('admin');
    const [agree, setAgree] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Login'));
    }, [dispatch]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!agree) {
            setError('Please accept the Terms of Use and Privacy Policy.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await loginApi({ email, password });

            if (!result?.success || !result.data) {
                const message = result?.message || 'Login failed. Please try again.';
                throw new Error(message);
            }

            const { token, user } = result.data;

            if (!token) {
                throw new Error('Login response did not include an access token.');
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));

            setSuccessMessage('Login successful! Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 800);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#eaf4ff]">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-10 pt-12 lg:flex-row lg:items-center lg:pb-16 lg:pt-18">
                <header className="absolute left-6 top-8 flex items-center gap-3">
                    <img src="/ShramikLogo.png" alt="Shramik" className="h-9 w-9" />
                    <div className="flex flex-col">
                        <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-400 bg-clip-text text-lg font-extrabold uppercase tracking-[0.4em] text-transparent">
                            SHRAMIK
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.5em] text-slate-500/80">Empowering Talent</span>
                    </div>
                </header>
                <section className="mt-12 w-full rounded-[28px] bg-white p-8 shadow-lg lg:mt-9 lg:max-w-xl lg:p-10">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
                        <p className="text-sm text-slate-500">Log in to continue managing your talent pipeline and personalized insights.</p>
                    </div>

                    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                        {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{successMessage}</p>}
                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                placeholder="example.email@gmail.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative mt-2">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter at least 8+ characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                                <span className="absolute inset-y-0 right-4 flex items-center text-slate-400">
                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="p-1 text-slate-400 transition hover:text-primary">
                                        {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                                    </button>
                                </span>
                            </div>
                        </div>
                        <label className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={() => setAgree((prev) => !prev)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>
                                By signing up, I agree with the{' '}
                                <Link to="#" className="font-semibold text-primary hover:underline">
                                    Terms of Use
                                </Link>{' '}
                                &{' '}
                                <Link to="#" className="font-semibold text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                        >
                            {loading ? 'Logging In...' : 'Log In'}
                        </button>
                    </form>

                    <div className="my-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {/* <span className="h-px flex-1 bg-slate-200" />
                        <span>OR</span>
                        <span className="h-px flex-1 bg-slate-200" /> */}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        {/* <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                            <IconGoogle className="h-4.5 w-4.5" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                            <IconFacebook className="h-4.5 w-4.5" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                            <IconApple className="h-4.5 w-4.5" />
                        </button> */}
                    </div>

                    {/* New to Shramik? section removed
                    <p className="mt-8 text-center text-sm text-slate-500">
                        New to Shramik?{' '}
                        <Link to="/auth/boxed-signup" className="font-semibold text-primary hover:underline">
                            Create an account
                        </Link>
                    </p>
                    */}
                </section>

                <aside className="mt-14 w-full max-w-md px-4 text-center lg:mt-0 lg:px-12 lg:text-left">
                    <h2 className="text-3xl font-semibold text-slate-900">
                        Come join us
                        <span className="ml-3 inline-block h-1 w-20 rounded-full bg-sky-400" />
                    </h2>
                    <ul className="mt-8 space-y-7 text-base text-slate-600">
                        <li className="flex items-start gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                                <IconCheck className="h-5 w-5" />
                            </span>
                            <p>Explore articles, tutorials, and guides on diverse subjects to grow your skills.</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-sm">
                                <IconMail className="h-5 w-5" />
                            </span>
                            <p>Learn at your own pace and access curated educational resources anytime.</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
                                <IconMailDot className="h-5 w-5" />
                            </span>
                            <p>Engage with a community of learners and recruiters to share insights.</p>
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default LoginBoxed;
