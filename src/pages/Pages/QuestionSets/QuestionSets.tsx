import { useMemo } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconSearch from '../../../components/Icon/IconSearch';
import IconChevronDown from '../../../components/Icon/IconCaretDown';
import IconEye from '../../../components/Icon/IconEye';
import IconEdit from '../../../components/Icon/IconEdit';
import IconShare from '../../../components/Icon/IconShare';
import { Link } from 'react-router-dom';

type QuestionSet = {
    name: string;
    category: string;
    specializations: string[];
    questions: number;
    updatedAt: string;
};

const questionSets: QuestionSet[] = [
    {
        name: 'Basic Electrical Concepts',
        category: 'ITI',
        specializations: ['Electrician', 'HVAC Technician'],
        questions: 25,
        updatedAt: '2023-11-15',
    },
    {
        name: 'Advanced Plumbing Systems',
        category: 'Diploma',
        specializations: ['Plumber', 'Pipefitter'],
        questions: 30,
        updatedAt: '2023-10-28',
    },
    {
        name: 'Construction Site Safety',
        category: 'Non-Degree',
        specializations: ['Construction Laborer', 'Supervisor'],
        questions: 20,
        updatedAt: '2023-12-01',
    },
    {
        name: 'Welding Techniques & Safety',
        category: 'ITI',
        specializations: ['Welder'],
        questions: 40,
        updatedAt: '2023-09-20',
    },
    {
        name: 'Customer Service Etiquette',
        category: 'Non-Degree',
        specializations: ['All'],
        questions: 15,
        updatedAt: '2024-01-05',
    },
    {
        name: 'Automotive Diagnostics',
        category: 'ITI',
        specializations: ['Automobile Mechanic'],
        questions: 35,
        updatedAt: '2023-08-10',
    },
];

const QuestionSets = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Question Sets'));
    }, [dispatch]);

    const tableData = useMemo(() => questionSets, []);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Question Sets</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage and organize question sets used across assessments.</p>
                </div>
                <Link
                    to="/question-sets/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                    Create Question Set
                </Link>
            </header>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                        <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <IconSearch className="h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
                            />
                        </label>
                        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md lg:grid-cols-3">
                            <button
                                type="button"
                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <span>All Categories</span>
                                <IconChevronDown className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:col-span-1 lg:col-span-2"
                            >
                                <span>All Specializations</span>
                                <IconChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-[960px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Specializations</th>
                                    <th className="px-6 py-3">Questions</th>
                                    <th className="px-6 py-3">Last Updated</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {tableData.map((set) => (
                                    <tr key={set.name} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{set.name}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{set.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {set.specializations.map((spec) => (
                                                    <span
                                                        key={`${set.name}-${spec}`}
                                                        className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{set.questions}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{set.updatedAt}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-3 text-slate-400">
                                                <button type="button" className="transition hover:text-primary">
                                                    <IconEdit className="h-4 w-4" />
                                                </button>
                                                <button type="button" className="transition hover:text-primary">
                                                    <IconEye className="h-4 w-4" />
                                                </button>
                                                <button type="button" className="transition hover:text-primary">
                                                    <IconShare className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-700 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <button type="button" className="px-3 py-1.5 text-sm font-semibold text-white bg-primary">
                                1
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                2
                            </button>
                        </div>
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                    <span>Showing 1 - 6 of 12 question sets</span>
                </div>
            </section>
        </div>
    );
};

export default QuestionSets;