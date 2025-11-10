import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconArrowForward from '../../../components/Icon/IconArrowForward';
import IconSettings from '../../../components/Icon/IconSettings';
import IconInbox from '../../../components/Icon/IconInbox';
import IconMessageDots from '../../../components/Icon/IconMessageDots';
import IconLoader from '../../../components/Icon/IconLoader';
import IconChecks from '../../../components/Icon/IconChecks';

type FeedbackItem = {
    user: string;
    role: string;
    rating: string;
    categories: string[];
    message: string;
    date: string;
    status: 'New' | 'In Progress' | 'Resolved';
};

const feedbackItems: FeedbackItem[] = [
    {
        user: 'Neha Sharma',
        role: 'Recruiter',
        rating: '5/5',
        categories: ['Feature Request', 'Usability'],
        message: 'The new job posting feature is fantastic! Can we have templates?',
        date: '2024-07-20',
        status: 'New',
    },
    {
        user: 'Rahul Singh',
        role: 'Candidate',
        rating: '3/5',
        categories: ['Bug Report', 'Login'],
        message: 'I am unable to log in since yesterday using my Google account.',
        date: '2024-07-19',
        status: 'In Progress',
    },
    {
        user: 'Priya Devi',
        role: 'Recruiter',
        rating: '4/5',
        categories: ['Suggestion', 'Dashboard'],
        message: 'Could you add more detailed analytics for candidate engagement?',
        date: '2024-07-18',
        status: 'New',
    },
    {
        user: 'Amit Kumar',
        role: 'Candidate',
        rating: '5/5',
        categories: ['Praise'],
        message: 'Excellent platform! Found a job within a week of applying.',
        date: '2024-07-17',
        status: 'Resolved',
    },
    {
        user: 'Divya Patel',
        role: 'Recruiter',
        rating: '2/5',
        categories: ['Usability', 'Navigation'],
        message: 'Finding specific candidate profiles feels clunky on mobile.',
        date: '2024-07-16',
        status: 'New',
    },
    {
        user: 'Pankaj Sharma',
        role: 'Candidate',
        rating: '1/5',
        categories: ['Bug Report', 'Profile'],
        message: 'My profile won’t save updates after I add certifications.',
        date: '2024-07-15',
        status: 'New',
    },
    {
        user: 'Priya Kumar',
        role: 'Recruiter',
        rating: '4/5',
        categories: ['Support', 'Feature Request'],
        message: 'Need better support for bulk messaging candidates.',
        date: '2024-07-14',
        status: 'New',
    },
];

const statusStyles: Record<FeedbackItem['status'], string> = {
    New: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
};

const Feedback = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Feedback'));
    }, [dispatch]);

    const overviewStats = useMemo(
        () => [
            { label: 'Total Feedback', value: '124', delta: '+12 this week', icon: IconInbox, iconStyles: 'bg-primary/10 text-primary' },
            { label: 'New', value: '48', delta: 'Needs review', icon: IconMessageDots, iconStyles: 'bg-sky-500/10 text-sky-500' },
            { label: 'In Progress', value: '18', delta: 'Currently tracked', icon: IconLoader, iconStyles: 'bg-amber-500/10 text-amber-500' },
            { label: 'Resolved', value: '58', delta: 'Closed in the last month', icon: IconChecks, iconStyles: 'bg-emerald-500/10 text-emerald-500' },
        ],
        [],
    );

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Feedback Overview</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    View and manage user feedback from recruiters and candidates.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{stat.label}</p>
                                    <div className="mt-3 flex items-end gap-4">
                                        <span className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</span>
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.delta}</span>
                                    </div>
                                </div>
                                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${stat.iconStyles}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Feedback</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View and manage the latest user feedback.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <IconSettings className="h-4 w-4" />
                            <span>Filters</span>
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                            <span className="text-lg leading-none">+</span>
                            <span>Add Feedback</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-[960px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Rating</th>
                                    <th className="px-6 py-3">Categories</th>
                                    <th className="px-6 py-3">Message Snippet</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {feedbackItems.map((item) => (
                                    <tr key={`${item.user}-${item.date}`} className="text-slate-700 dark:text-slate-200">
                                        <td className="px-6 py-4 font-medium">{item.user}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.role}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.rating}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {item.categories.map((category) => (
                                                    <span
                                                        key={category}
                                                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.message}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                                            >
                                                View Details
                                                <IconArrowForward className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Feedback;

