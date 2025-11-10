import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconMail from '../../../components/Icon/IconMail';

const EmailMarketing = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Email Marketing'));
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Bulk Email Marketing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review the final preview before sending to your audience.</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                    Send Email
                </button>
            </header>

            <section className="panel space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email Content</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">See how your email will appear to recipients.</p>
                </div>

                <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <IconMail fill className="h-4 w-4" />
                        </span>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">New Feature Update</span>
                            <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400">Exciting New Features Are Here!</h3>
                        </div>
                    </div>
                    <div className="space-y-6 px-6 py-6 text-sm text-slate-600 dark:text-slate-300">
                        <div className="space-y-3">
                            <p>Dear Valued Community Member,</p>
                            <p>
                                We&apos;re thrilled to announce a major update to our platform, designed to enhance your experience and streamline your workflow.
                                Get ready for powerful new tools that will transform how you manage your projects.
                            </p>
                            <div className="space-y-1">
                                <p>Highlights include:</p>
                                <ul className="list-disc space-y-1 pl-5">
                                    <li>Enhanced dashboard analytics for deeper insights.</li>
                                    <li>Seamless integration with your favorite apps.</li>
                                    <li>Intuitive drag-and-drop interface for quicker edits.</li>
                                    <li>24/7 priority support for all your needs.</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                            Explore Updates
                        </button>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Thank you for being an essential part of our growing community. We appreciate your continued support!
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
};

export default EmailMarketing;

