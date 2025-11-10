import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { IRootState } from '../../../store';
import IconSearch from '../../../components/Icon/IconSearch';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconUsersGroup from '../../../components/Icon/IconUsersGroup';
import IconUsers from '../../../components/Icon/IconUsers';
import IconClipboardText from '../../../components/Icon/IconClipboardText';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/airbnb.css';

type SummaryCard = {
    label: string;
    value: string;
    change: string;
    tone: 'positive' | 'neutral' | 'negative';
    Icon: ComponentType<{ className?: string }>;
    iconStyles: string;
};

type PurchaseRow = {
    user: string;
    package: string;
    amount: string;
    date: string;
    status: 'Completed' | 'Processing';
};

type FeedbackRow = {
    user: string;
    rating: string;
    category: string;
    message: string;
    date: string;
    sentiment: 'positive' | 'neutral' | 'negative';
};

const Index = () => {
    const dispatch = useDispatch();

    const [dateRange, setDateRange] = useState<Date[]>([]);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const dateRangeWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
    }, [dispatch]);

    useEffect(() => {
        if (!isDatePickerOpen) {
            return;
        }
        const handleClickOutside = (event: MouseEvent) => {
            if (dateRangeWrapperRef.current && !dateRangeWrapperRef.current.contains(event.target as Node)) {
                setDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerOpen]);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
        [],
    );

    const selectedRangeLabel = useMemo(() => {
        if (dateRange.length === 2) {
            return `${dateFormatter.format(dateRange[0])} - ${dateFormatter.format(dateRange[1])}`;
        }
        return 'Select Date Range';
    }, [dateRange, dateFormatter]);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const summaryCards: SummaryCard[] = [
        {
            label: 'Total Users',
            value: '15,450',
            change: '+10% from last month',
            tone: 'positive',
            Icon: IconUsersGroup,
            iconStyles: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
        },
        {
            label: 'Total Recruiters',
            value: '3,200',
            change: '+5% from last month',
            tone: 'positive',
            Icon: IconUsers,
            iconStyles: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
        },
        {
            label: 'Active Jobs',
            value: '1,850',
            change: 'Stable since last week',
            tone: 'neutral',
            Icon: IconClipboardText,
            iconStyles: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
        },
    ];

    const recentPurchases: PurchaseRow[] = [
        { user: 'Arjun Kumar', package: 'Starter Pack', amount: '₹ 250', date: '2024-07-28', status: 'Completed' },
        { user: 'Meera Devi', package: 'Pro Bundle', amount: '₹ 999', date: '2024-07-27', status: 'Completed' },
        { user: 'Sanjay Dutt', package: 'Basic Plan', amount: '₹ 150', date: '2024-07-27', status: 'Processing' },
        { user: 'Pooja Rani', package: 'Ultimate Deal', amount: '₹ 1999', date: '2024-07-26', status: 'Completed' },
        { user: 'Vikram Sharma', package: 'Starter Pack', amount: '₹ 250', date: '2024-07-26', status: 'Completed' },
    ];

    const recentFeedback: FeedbackRow[] = [
        {
            user: 'Priya Sharma',
            rating: '5/5',
            category: 'App Feature',
            message: 'Loved the new job matching algorithm!',
            date: '2024-07-28',
            sentiment: 'positive',
        },
        {
            user: 'Amit Singh',
            rating: '4/5',
            category: 'UI/UX',
            message: 'The navigation could be more intuitive.',
            date: '2024-07-27',
            sentiment: 'neutral',
        },
        {
            user: 'Sneha Kumari',
            rating: '3/5',
            category: 'Performance',
            message: 'App crashes occasionally on startup.',
            date: '2024-07-26',
            sentiment: 'negative',
        },
        {
            user: 'Rajesh Gupta',
            rating: '5/5',
            category: 'Support',
            message: 'Quick and helpful response from support team.',
            date: '2024-07-25',
            sentiment: 'positive',
        },
        {
            user: 'Divya Reddy',
            rating: '4/5',
            category: 'Content',
            message: 'More practice questions needed for certain specializations.',
            date: '2024-07-24',
            sentiment: 'neutral',
        },
    ];

    const userMixColors = useMemo(
        () => (isDark ? ['#4c8db8', '#2b6b83', '#736d8f'] : ['#3d7ba6', '#245a72', '#6f6a8a']),
        [isDark],
    );

    const userMixChart = useMemo(() => {
        const options: ApexOptions = {
            chart: {
                type: 'donut',
                height: 320,
                fontFamily: 'Inter, sans-serif',
            },
            stroke: {
                width: 6,
                colors: [isDark ? '#0f172a' : '#ffffff'],
            },
            dataLabels: {
                enabled: false,
            },
            colors: userMixColors,
            labels: ['ND (Non-Degree)', 'ITI (Industrial Training Institute)', 'Diploma'],
            legend: {
                show: false,
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `${Math.round(val)}%`,
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '72%',
                        labels: {
                            show: true,
                            name: {
                                show: false,
                                fontSize: '14px',
                                offsetY: 10,
                                color: isDark ? '#cbd5f5' : '#475569',
                            },
                            value: {
                                show: true,
                                fontSize: '30px',
                                fontWeight: 600,
                                offsetY: 0,
                                color: isDark ? '#f8fafc' : '#0f172a',
                                formatter: (val: string) => `${Math.round(Number(val))}%`,
                            },
                            total: {
                                show: false,
                            },
                        },
                    },
                },
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: {
                            height: 280,
                        },
                    },
                },
            ],
        };

        return {
            series: [45, 35, 20],
            options,
        };
    }, [isDark, userMixColors]);

    const userMixLegend = [
        { label: 'ND (Non-Degree)', color: userMixColors[0] },
        { label: 'ITI (Industrial Training Institute)', color: userMixColors[1] },
        { label: 'Diploma', color: userMixColors[2] },
    ];

    const statusStyles: Record<PurchaseRow['status'], string> = {
        Completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200',
        Processing: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200',
    };

    const sentimentStyles: Record<FeedbackRow['sentiment'], string> = {
        positive: 'bg-emerald-500/70',
        neutral: 'bg-amber-400/70',
        negative: 'bg-rose-500/70',
    };

    const changeToneClasses: Record<SummaryCard['tone'], string> = {
        positive: 'text-emerald-600 dark:text-emerald-300',
        neutral: 'text-slate-500 dark:text-slate-300',
        negative: 'text-rose-600 dark:text-rose-300',
    };

    return (
        <div className="space-y-12 pb-16 pt-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Dashboard</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Dashboard Overview</h1>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 sm:w-auto">
                        <IconSearch className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 sm:w-44"
                        />
                    </label>
                    <div ref={dateRangeWrapperRef} className="relative w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setDatePickerOpen((prev) => !prev)}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto sm:justify-start ${dateRange.length === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-600'}`}
                        >
                            <IconCalendar className="h-4 w-4" />
                            <span>{selectedRangeLabel}</span>
                        </button>
                        {isDatePickerOpen && (
                            <div className="absolute right-0 z-30 mt-3 w-[20rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <Flatpickr
                                    value={dateRange}
                                    options={{
                                        mode: 'range',
                                        inline: true,
                                        dateFormat: 'M d, Y',
                                        position: 'auto right',
                                        monthSelectorType: 'static',
                                    }}
                                    className="w-full border-b border-slate-200 dark:border-slate-700"
                                    onChange={(selectedDates) => {
                                        const pickedDates = selectedDates as Date[];
                                        setDateRange(pickedDates);
                                        if (pickedDates.length === 2) {
                                            setDatePickerOpen(false);
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between gap-2 px-4 pb-4">
                                    <button
                                        type="button"
                                        className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-primary"
                                        onClick={() => {
                                            setDateRange([]);
                                            setDatePickerOpen(false);
                                        }}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-primary/90"
                                        onClick={() => setDatePickerOpen(false)}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Key Metrics</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {summaryCards.map((card) => {
                        const ToneIcon = card.Icon;
                        return (
                            <article
                                key={card.label}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</span>
                                        <p className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                                        <span className={`text-sm font-medium ${changeToneClasses[card.tone]}`}>{card.change}</span>
                                    </div>
                                    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.iconStyles}`}>
                                        <ToneIcon className="h-5 w-5" />
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Trends</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Mix</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Distribution of users by education level.</p>
                            </div>
                        </header>
                        <div className="mt-8 flex justify-center">
                            <ReactApexChart series={userMixChart.series} options={userMixChart.options} type="donut" height={320} />
                        </div>
                        <footer className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                            {userMixLegend.map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </footer>
                    </article>

                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900 md:col-span-2 lg:col-span-2">
                        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Coin Purchases</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Latest transactions from your talent marketplace.</p>
                            </div>
                        </header>
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-[640px] divide-y divide-slate-200 text-left dark:divide-slate-700 md:min-w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/60">
                                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Package</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                    {recentPurchases.map((purchase) => (
                                        <tr
                                            key={purchase.user}
                                            className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
                                        >
                                            <td className="px-6 py-4 font-medium">{purchase.user}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{purchase.package}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{purchase.amount}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{purchase.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[purchase.status]}`}
                                                >
                                                    {purchase.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                    <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Feedback</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Latest comments shared by your talent community.</p>
                        </div>
                    </header>
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700 md:min-w-full">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Rating</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Message</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3 text-right">Sentiment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                    {recentFeedback.map((feedback) => (
                                        <tr key={`${feedback.user}-${feedback.date}`} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                            <td className="px-6 py-4 font-medium">{feedback.user}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{feedback.rating}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{feedback.category}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{feedback.message}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{feedback.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center justify-end gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${sentimentStyles[feedback.sentiment]}`} />
                                                    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">
                                                        {feedback.sentiment}
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
