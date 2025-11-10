import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';

const jobSummary = [
    { label: 'Active Profiles', value: '12,845', helper: '+560 this week' },
    { label: 'Interviews Scheduled', value: '320', helper: 'Across 65 recruiters' },
    { label: 'Offers Extended', value: '148', helper: '+9.4% conversion' },
    { label: 'Skills Verified', value: '7,230', helper: 'Updated in last 30 days' },
];

const jobSeekers = [
    {
        name: 'Ananya Verma',
        specialization: 'Full Stack Developer',
        availability: 'Immediate',
        lastActive: '2024-07-30',
        status: 'Interviewing',
    },
    {
        name: 'Rahul Mishra',
        specialization: 'Mechanical Engineer',
        availability: '2 Weeks',
        lastActive: '2024-07-29',
        status: 'Offer Extended',
    },
    {
        name: 'Swati Gupta',
        specialization: 'Digital Marketer',
        availability: 'Immediate',
        lastActive: '2024-07-28',
        status: 'Profile Review',
    },
    {
        name: 'Karan Singh',
        specialization: 'Data Analyst',
        availability: 'Notice Period',
        lastActive: '2024-07-27',
        status: 'Interviewing',
    },
    {
        name: 'Heena Sharma',
        specialization: 'UI/UX Designer',
        availability: 'Immediate',
        lastActive: '2024-07-26',
        status: 'Shortlisted',
    },
];

const statusStyles: Record<string, string> = {
    Interviewing: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    'Offer Extended': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    'Profile Review': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
};

const JobSeeker = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Job Seekers'));
    }, [dispatch]);

    const cards = useMemo(() => jobSummary, []);

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Job Seeker Insights</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Track activation, engagement, and hiring outcomes for job seekers on the platform.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{card.helper}</span>
                    </article>
                ))}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Job Seekers</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">High-intent candidates ready for immediate action.</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Specialization</th>
                                    <th className="px-6 py-3">Availability</th>
                                    <th className="px-6 py-3">Last Active</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {jobSeekers.map((seeker) => (
                                    <tr key={seeker.name} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{seeker.name}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{seeker.specialization}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{seeker.availability}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{seeker.lastActive}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[seeker.status]}`}>
                                                {seeker.status}
                                            </span>
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

export default JobSeeker;
