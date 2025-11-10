import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';

const recruiterSummary = [
    { label: 'Active Recruiters', value: '860', helper: '+45 onboarded this month' },
    { label: 'Open Positions', value: '3,420', helper: 'Across 214 companies' },
    { label: 'Interviews Conducted', value: '1,980', helper: '+12% week-over-week' },
    { label: 'Hires Confirmed', value: '642', helper: 'Placement success rate 33%' },
];

const recruiterActivity = [
    {
        company: 'BrightTech Solutions',
        recruiter: 'Neeraj Kapoor',
        focus: 'Software Engineering',
        interviews: 28,
        updatedAt: '2024-07-30',
        status: 'Hiring Frenzy',
    },
    {
        company: 'FutureBuild Infra',
        recruiter: 'Sanya Mehta',
        focus: 'Civil Engineering',
        interviews: 12,
        updatedAt: '2024-07-29',
        status: 'Active Shortlisting',
    },
    {
        company: 'CarePlus Hospitals',
        recruiter: 'Dr. Ravi Rao',
        focus: 'Healthcare & Nursing',
        interviews: 19,
        updatedAt: '2024-07-28',
        status: 'Interviewing',
    },
    {
        company: 'EcoRide Mobility',
        recruiter: 'Anita Joshi',
        focus: 'Automobile Trades',
        interviews: 15,
        updatedAt: '2024-07-27',
        status: 'New Openings',
    },
    {
        company: 'SkillBridge Consulting',
        recruiter: 'Vikram Tyagi',
        focus: 'Management Roles',
        interviews: 22,
        updatedAt: '2024-07-26',
        status: 'Shortlisting',
    },
];

const statusStyles: Record<string, string> = {
    'Hiring Frenzy': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    'Active Shortlisting': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
    Interviewing: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    'New Openings': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Shortlisting: 'bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200',
};

const Recruiter = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Recruiter Analytics'));
    }, [dispatch]);

    const cards = useMemo(() => recruiterSummary, []);

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Recruiter Performance</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Monitor recruiter engagement, interview pipeline, and hiring velocity across the marketplace.
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
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recruiter Activity Snapshot</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recent highlights from our most engaged recruiters.</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Recruiter</th>
                                    <th className="px-6 py-3">Focus Area</th>
                                    <th className="px-6 py-3">Interviews</th>
                                    <th className="px-6 py-3">Last Updated</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {recruiterActivity.map((item) => (
                                    <tr key={item.company} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.company}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.recruiter}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.focus}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.interviews}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.updatedAt}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                                                {item.status}
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

export default Recruiter;
