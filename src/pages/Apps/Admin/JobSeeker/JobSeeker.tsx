import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import {
    getJobSeekerStats,
    getTopJobSeekers,
    getJobSeekerCategories,
    type JobSeekerItem,
} from '../../../../api/admin/jobSeekerApi';

const statusStyles: Record<string, string> = {
    Interviewing: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    'Offer Extended': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    'Profile Review': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
};

interface StatsData {
    activeProfiles: { count: number; growthLabel: string };
    interviewsScheduled: { count: number; subLabel: string };
    offersExtended: { count: number; growthLabel: string };
    skillsVerified: { count: number; subLabel: string };
}

const JobSeeker = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [categories, setCategories] = useState<string[]>(['All']);

    // API data states
    const [isLoading, setIsLoading] = useState(true);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [jobSeekers, setJobSeekers] = useState<JobSeekerItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreJobSeekers, setHasMoreJobSeekers] = useState(true);
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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await getJobSeekerCategories();
            if (res.success && res.data) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await getJobSeekerStats();
            if (res.success && res.data) {
                setStatsData(res.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    // Fetch job seekers
    const fetchJobSeekers = useCallback(async (resetList = true) => {
        if (resetList) {
            setIsLoading(true);
            setCurrentPage(1);
            setHasMoreJobSeekers(true);
        }

        try {
            const res = await getTopJobSeekers({
                page: resetList ? 1 : currentPage,
                limit: 10,
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                search: debouncedSearch || undefined,
            });

            if (res.success && res.data) {
                if (resetList) {
                    setJobSeekers(res.data.jobSeekers);
                } else {
                    setJobSeekers((prev) => [...prev, ...res.data!.jobSeekers]);
                }
                setHasMoreJobSeekers(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to fetch job seekers:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load job seekers. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, currentPage, debouncedSearch]);

    // Load more job seekers
    const loadMoreJobSeekers = useCallback(async () => {
        if (isLoadingMore || !hasMoreJobSeekers) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const res = await getTopJobSeekers({
                page: nextPage,
                limit: 10,
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                search: debouncedSearch || undefined,
            });

            if (res.success && res.data) {
                setJobSeekers((prev) => [...prev, ...res.data!.jobSeekers]);
                setCurrentPage(nextPage);
                setHasMoreJobSeekers(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to load more job seekers:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [selectedCategory, currentPage, isLoadingMore, hasMoreJobSeekers, debouncedSearch]);

    // Handle scroll for infinite loading
    const handleTableScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            const scrollThreshold = 50;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold) {
                loadMoreJobSeekers();
            }
        },
        [loadMoreJobSeekers]
    );

    useEffect(() => {
        dispatch(setPageTitle('Job Seekers'));
        fetchCategories();
        fetchStats();
    }, [dispatch, fetchCategories, fetchStats]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch job seekers when category or search changes
    useEffect(() => {
        fetchJobSeekers(true);
    }, [selectedCategory, debouncedSearch]);

    const cards = useMemo(() => {
        if (!statsData) {
            return [
                { label: 'Active Profiles', value: '—', helper: 'Loading...' },
                { label: 'Interviews Scheduled', value: '—', helper: 'Loading...' },
                { label: 'Offers Extended', value: '—', helper: 'Loading...' },
                { label: 'Skills Verified', value: '—', helper: 'Loading...' },
            ];
        }

        return [
            {
                label: 'Active Profiles',
                value: formatNumber(statsData.activeProfiles.count),
                helper: statsData.activeProfiles.growthLabel,
                onClick: () => navigate('/job-seeker/all'),
                clickable: true,
            },
            {
                label: 'Interviews Scheduled',
                value: formatNumber(statsData.interviewsScheduled.count),
                helper: statsData.interviewsScheduled.subLabel,
            },
            {
                label: 'Offers Extended',
                value: formatNumber(statsData.offersExtended.count),
                helper: statsData.offersExtended.growthLabel,
            },
            {
                label: 'Skills Verified',
                value: formatNumber(statsData.skillsVerified.count),
                helper: statsData.skillsVerified.subLabel,
            },
        ];
    }, [statsData, navigate]);

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
                        onClick={card.onClick}
                        className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${card.clickable ? 'cursor-pointer hover:border-primary' : ''}`}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{card.helper}</span>
                        {card.clickable && <span className="block mt-1 text-xs text-primary">Click to view all →</span>}
                    </article>
                ))}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Job Seekers</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">High-intent candidates ready for immediate action.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, phone, email..."
                                className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-600 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat === 'Non-Degree Holder'
                                            ? 'ND (Non-Degree)'
                                            : cat === 'ITI Holder'
                                                ? 'ITI (Industrial Training Institute)'
                                                : cat === 'Diploma Holder'
                                                    ? 'Diploma'
                                                    : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div
                    ref={tableContainerRef}
                    onScroll={handleTableScroll}
                    className="max-h-[500px] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Specialization</th>
                                    <th className="px-6 py-3">Availability</th>
                                    <th className="px-6 py-3">Last Active</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Loading job seekers...
                                        </td>
                                    </tr>
                                ) : jobSeekers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No job seekers found
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {jobSeekers.map((seeker) => (
                                            <tr
                                                key={seeker._id}
                                                className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {seeker.profilePhoto ? (
                                                            <img
                                                                src={seeker.profilePhoto}
                                                                alt={seeker.name}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                                {seeker.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-slate-900 dark:text-white">{seeker.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{seeker.specialization}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{seeker.availability}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                    {formatDateDisplay(seeker.lastActive)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[seeker.status] || 'bg-slate-100 text-slate-600'
                                                            }`}
                                                    >
                                                        {seeker.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {isLoadingMore && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
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
                                        {!hasMoreJobSeekers && jobSeekers.length > 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-3 text-center text-xs text-slate-400">
                                                    No more job seekers
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

export default JobSeeker;
