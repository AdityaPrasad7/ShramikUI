import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import {
    getRecruiterStats,
    getRecruiterActivity,
    type RecruiterActivityItem,
} from '../../../../api/admin/recruiterApi';

const statusStyles: Record<string, string> = {
    'Hiring Frenzy': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    'Active Shortlisting': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
    Interviewing: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    'New Openings': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Shortlisting: 'bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200',
};

interface StatsData {
    activeRecruiters: { count: number; growthLabel: string };
    openPositions: { count: number; subLabel: string };
    interviewsConducted: { count: number; growthLabel: string };
    hiresConfirmed: { count: number; growthLabel: string };
}

const Recruiter = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    // API data states
    const [isLoading, setIsLoading] = useState(true);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [recruiters, setRecruiters] = useState<RecruiterActivityItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreRecruiters, setHasMoreRecruiters] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    // Format number with commas
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-IN');
    };

    // Format date for display
    const formatDateDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await getRecruiterStats();
            if (res.success && res.data) {
                setStatsData(res.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    // Fetch recruiters
    const fetchRecruiters = useCallback(async () => {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMoreRecruiters(true);

        try {
            const res = await getRecruiterActivity({
                page: 1,
                limit: 10,
                search: debouncedSearch || undefined,
            });

            if (res.success && res.data) {
                setRecruiters(res.data.recruiters);
                setHasMoreRecruiters(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to fetch recruiters:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load recruiters. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    // Load more recruiters
    const loadMoreRecruiters = useCallback(async () => {
        if (isLoadingMore || !hasMoreRecruiters) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const res = await getRecruiterActivity({
                page: nextPage,
                limit: 10,
                search: debouncedSearch || undefined,
            });

            if (res.success && res.data) {
                setRecruiters((prev) => [...prev, ...res.data!.recruiters]);
                setCurrentPage(nextPage);
                setHasMoreRecruiters(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to load more recruiters:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoadingMore, hasMoreRecruiters, debouncedSearch]);

    // Handle scroll for infinite loading
    const handleTableScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            const scrollThreshold = 50;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold) {
                loadMoreRecruiters();
            }
        },
        [loadMoreRecruiters]
    );

    useEffect(() => {
        dispatch(setPageTitle('Recruiter Analytics'));
        fetchStats();
    }, [dispatch, fetchStats]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch recruiters when search changes
    useEffect(() => {
        fetchRecruiters();
    }, [debouncedSearch, fetchRecruiters]);

    const cards = useMemo(() => {
        if (!statsData) {
            return [
                { label: 'Active Recruiters', value: '—', helper: 'Loading...' },
                { label: 'Open Positions', value: '—', helper: 'Loading...' },
                { label: 'Interviews Conducted', value: '—', helper: 'Loading...' },
                { label: 'Hires Confirmed', value: '—', helper: 'Loading...' },
            ];
        }

        return [
            {
                label: 'Active Recruiters',
                value: formatNumber(statsData.activeRecruiters.count),
                helper: statsData.activeRecruiters.growthLabel,
            },
            {
                label: 'Open Positions',
                value: formatNumber(statsData.openPositions.count),
                helper: statsData.openPositions.subLabel,
            },
            {
                label: 'Interviews Conducted',
                value: formatNumber(statsData.interviewsConducted.count),
                helper: statsData.interviewsConducted.growthLabel,
            },
            {
                label: 'Hires Confirmed',
                value: formatNumber(statsData.hiresConfirmed.count),
                helper: statsData.hiresConfirmed.growthLabel,
            },
        ];
    }, [statsData]);

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
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by company, name, phone..."
                            className="w-72 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div
                    ref={tableContainerRef}
                    onScroll={handleTableScroll}
                    className="max-h-[500px] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Loading recruiters...
                                        </td>
                                    </tr>
                                ) : recruiters.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No recruiters found
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {recruiters.map((item) => (
                                            <tr
                                                key={item._id}
                                                className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.companyLogo ? (
                                                            <img
                                                                src={item.companyLogo}
                                                                alt={item.company}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                                {item.company.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-slate-900 dark:text-white">{item.company}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.recruiter}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.focusArea}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.interviews}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                    {formatDateDisplay(item.lastUpdated)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] || 'bg-slate-100 text-slate-600'
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {isLoadingMore && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                                fill="none"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            />
                                                        </svg>
                                                        Loading more...
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {!hasMoreRecruiters && recruiters.length > 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-3 text-center text-xs text-slate-400">
                                                    No more recruiters
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Recruiter;
