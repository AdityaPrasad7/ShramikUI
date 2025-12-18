import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import IconSend from '../../../../components/Icon/IconSend';
import IconRefresh from '../../../../components/Icon/IconRefresh';
import IconBell from '../../../../components/Icon/IconBell';
import Swal from 'sweetalert2';
import {
    getTokenStats,
    getNotificationHistory,
    sendNotification,
    type NotificationItem,
    type SendNotificationPayload,
} from '../../../../api/admin/notificationApi';

const statusStyles: Record<string, string> = {
    sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    sending: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
};

const recipientTypeLabels: Record<string, string> = {
    all: 'All Users',
    jobSeekers: 'Job Seekers',
    recruiters: 'Recruiters',
    specific: 'Specific Users',
    topic: 'Topic',
};

const PushNotifications = () => {
    const dispatch = useDispatch();

    // Form state
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [recipientType, setRecipientType] = useState<'all' | 'jobSeekers' | 'recruiters'>('all');

    // Data state
    const [tokenStats, setTokenStats] = useState<{
        total: number;
        byUserType: { JobSeeker: number; Recruiter: number };
        usersWithTokens: { JobSeeker: number; Recruiter: number };
    } | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    // UI state
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const historyContainerRef = useRef<HTMLDivElement | null>(null);

    // Format date for display
    const formatDateDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Fetch token stats
    const fetchTokenStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const res = await getTokenStats();
            if (res.success && res.data) {
                setTokenStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch token stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    // Fetch notification history
    const fetchNotificationHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        setCurrentPage(1);
        setHasMoreNotifications(true);
        try {
            const res = await getNotificationHistory({ page: 1, limit: 10 });
            if (res.success && res.data) {
                setNotifications(res.data);
                setHasMoreNotifications((res.meta?.page ?? 1) < (res.meta?.totalPages ?? 1));
            }
        } catch (error) {
            console.error('Failed to fetch notification history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    // Load more notifications
    const loadMoreNotifications = useCallback(async () => {
        if (isLoadingMore || !hasMoreNotifications) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const res = await getNotificationHistory({ page: nextPage, limit: 10 });

            if (res.success && res.data) {
                setNotifications((prev) => [...prev, ...res.data!]);
                setCurrentPage(nextPage);
                setHasMoreNotifications((res.meta?.page ?? 1) < (res.meta?.totalPages ?? 1));
            }
        } catch (error) {
            console.error('Failed to load more notifications:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoadingMore, hasMoreNotifications]);

    // Handle scroll for infinite loading
    const handleHistoryScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            const scrollThreshold = 50;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold) {
                loadMoreNotifications();
            }
        },
        [loadMoreNotifications]
    );

    // Send notification
    const handleSendNotification = async () => {
        if (!title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Title',
                text: 'Please enter a notification title.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
            return;
        }
        if (!body.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Body',
                text: 'Please enter notification body content.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
            return;
        }

        const targetCount =
            recipientType === 'all'
                ? tokenStats?.total ?? 0
                : recipientType === 'jobSeekers'
                    ? tokenStats?.byUserType.JobSeeker ?? 0
                    : tokenStats?.byUserType.Recruiter ?? 0;

        const result = await Swal.fire({
            title: 'Send Push Notification?',
            html: `
                <p class="text-sm text-slate-500">This will send notifications to approximately <strong>${targetCount}</strong> devices.</p>
                <p class="text-xs text-slate-400 mt-2">Notifications are sent immediately and cannot be undone.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send',
            confirmButtonColor: '#4361ee',
        });

        if (!result.isConfirmed) return;

        setIsSending(true);
        try {
            const payload: SendNotificationPayload = {
                title,
                body,
                recipientType,
            };

            if (imageUrl.trim()) payload.imageUrl = imageUrl;
            if (link.trim()) payload.link = link;

            const res = await sendNotification(payload);

            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Notification Sent!',
                    text: res.message,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
                // Reset form
                setTitle('');
                setBody('');
                setImageUrl('');
                setLink('');
                // Refresh history
                fetchNotificationHistory();
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        dispatch(setPageTitle('Push Notifications'));
        fetchTokenStats();
        fetchNotificationHistory();
    }, [dispatch, fetchTokenStats, fetchNotificationHistory]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Push Notifications</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Send push notifications to your app users.</p>
                </div>
                <button
                    type="button"
                    onClick={handleSendNotification}
                    disabled={isSending}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                >
                    {isSending ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </>
                    ) : (
                        <>
                            <IconSend className="h-4 w-4" />
                            Send Notification
                        </>
                    )}
                </button>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Compose Section */}
                <section className="panel space-y-5 lg:col-span-2">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compose Notification</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill in the details below to create your notification.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., New Job Opportunity!"
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Body <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                placeholder="Write your notification message here..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Action Link (Optional)</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recipients & Preview Section */}
                <section className="space-y-6">
                    {/* Recipients */}
                    <article className="panel space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recipients</h3>
                            <button type="button" onClick={fetchTokenStats} disabled={isLoadingStats} className="text-primary hover:text-primary/80">
                                <IconRefresh className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Send To</label>
                            <select
                                value={recipientType}
                                onChange={(e) => setRecipientType(e.target.value as 'all' | 'jobSeekers' | 'recruiters')}
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="all">All Users</option>
                                <option value="jobSeekers">Job Seekers Only</option>
                                <option value="recruiters">Recruiters Only</option>
                            </select>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                                        {isLoadingStats ? '—' : (tokenStats?.total ?? 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Total Devices</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-sky-600 dark:text-sky-400">
                                        {isLoadingStats ? '—' : (tokenStats?.byUserType.JobSeeker ?? 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Job Seekers</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                                        {isLoadingStats ? '—' : (tokenStats?.byUserType.Recruiter ?? 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Recruiters</p>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Preview */}
                    <article className="panel space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preview</h3>
                        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-start gap-3 p-4">
                                <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <IconBell className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-slate-900 dark:text-white">{title || 'Notification Title'}</p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{body || 'Your notification body will appear here...'}</p>
                                    {imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 h-20 flex items-center justify-center">
                                            <span className="text-xs text-slate-400">Image Preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                </section>
            </div>

            {/* Notification History */}
            <section className="panel space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification History</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View your past push notifications and their status.</p>
                    </div>
                    <button type="button" onClick={fetchNotificationHistory} className="text-primary hover:text-primary/80">
                        <IconRefresh className={`h-5 w-5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div
                    ref={historyContainerRef}
                    onScroll={handleHistoryScroll}
                    className="max-h-[400px] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-[700px] w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Notification</th>
                                    <th className="px-6 py-3">Recipients</th>
                                    <th className="px-6 py-3">Sent</th>
                                    <th className="px-6 py-3">Failed</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {isLoadingHistory ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Loading notifications...
                                        </td>
                                    </tr>
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No notifications found. Send your first notification!
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {notifications.map((notification) => (
                                            <tr key={notification._id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{notification.title}</p>
                                                        <p className="truncate text-xs text-slate-500 max-w-[200px]">{notification.body}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {recipientTypeLabels[notification.recipientType] || notification.recipientType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{notification.stats?.sent ?? 0}</td>
                                                <td className="px-6 py-4 text-rose-600 dark:text-rose-400">{notification.stats?.failed ?? 0}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                    {formatDateDisplay(notification.sentAt || notification.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[notification.status] || 'bg-slate-100 text-slate-600'}`}
                                                    >
                                                        {notification.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {isLoadingMore && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Loading more...
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {!hasMoreNotifications && notifications.length > 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-3 text-center text-xs text-slate-400">
                                                    No more notifications
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

export default PushNotifications;
