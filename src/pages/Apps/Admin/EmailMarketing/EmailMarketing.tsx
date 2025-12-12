import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import IconMail from '../../../../components/Icon/IconMail';
import IconSend from '../../../../components/Icon/IconSend';
import IconRefresh from '../../../../components/Icon/IconRefresh';
import Swal from 'sweetalert2';
import {
    getRecipientCount,
    sendBulkEmail,
    getCampaigns,
    getTemplateCategories,
    type CampaignItem,
    type TemplateCategory,
} from '../../../../api/admin/emailMarketingApi';

const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    sending: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200',
};

const EmailMarketing = () => {
    const dispatch = useDispatch();

    // Form state
    const [campaignName, setCampaignName] = useState('');
    const [subject, setSubject] = useState('');
    const [recipientType, setRecipientType] = useState<'all' | 'job-seeker' | 'recruiter'>('all');
    const [emailBody, setEmailBody] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');

    // Data state
    const [recipientCount, setRecipientCount] = useState({ jobSeekerCount: 0, recruiterCount: 0, totalCount: 0 });
    const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // UI state
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreCampaigns, setHasMoreCampaigns] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const campaignsContainerRef = useRef<HTMLDivElement | null>(null);

    // Format date for display
    const formatDateDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Fetch recipient count
    const fetchRecipientCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            const res = await getRecipientCount({ recipientType });
            if (res.success && res.data) {
                setRecipientCount(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch recipient count:', error);
        } finally {
            setIsLoadingCount(false);
        }
    }, [recipientType]);

    // Fetch campaigns
    const fetchCampaigns = useCallback(async () => {
        setIsLoadingCampaigns(true);
        setCurrentPage(1);
        setHasMoreCampaigns(true);
        try {
            const res = await getCampaigns({ page: 1, limit: 10 });
            if (res.success && res.data) {
                setCampaigns(res.data.campaigns);
                setHasMoreCampaigns(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setIsLoadingCampaigns(false);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await getTemplateCategories();
            if (res.success && res.data) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    // Load more campaigns
    const loadMoreCampaigns = useCallback(async () => {
        if (isLoadingMore || !hasMoreCampaigns) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const res = await getCampaigns({ page: nextPage, limit: 10 });

            if (res.success && res.data) {
                setCampaigns((prev) => [...prev, ...res.data!.campaigns]);
                setCurrentPage(nextPage);
                setHasMoreCampaigns(res.meta?.pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error('Failed to load more campaigns:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoadingMore, hasMoreCampaigns]);

    // Handle scroll for infinite loading
    const handleCampaignsScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            const scrollThreshold = 50;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < scrollThreshold) {
                loadMoreCampaigns();
            }
        },
        [loadMoreCampaigns]
    );

    // Send email
    const handleSendEmail = async () => {
        if (!subject.trim()) {
            Swal.fire({ icon: 'warning', title: 'Missing Subject', text: 'Please enter an email subject.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            return;
        }
        if (!emailBody.trim()) {
            Swal.fire({ icon: 'warning', title: 'Missing Content', text: 'Please enter email body content.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            return;
        }

        const result = await Swal.fire({
            title: 'Send Email Campaign?',
            html: `
                <p class="text-sm text-slate-500">This will send emails to <strong>${recipientCount.totalCount}</strong> recipients.</p>
                <p class="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send',
            confirmButtonColor: '#4361ee',
        });

        if (!result.isConfirmed) return;

        setIsSending(true);
        try {
            const res = await sendBulkEmail({
                name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
                subject,
                content: {
                    body: emailBody,
                    ctaText: ctaText || undefined,
                    ctaLink: ctaLink || undefined,
                },
                recipientType,
            });

            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Email Sent!',
                    text: res.message,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
                // Reset form
                setCampaignName('');
                setSubject('');
                setEmailBody('');
                setCtaText('');
                setCtaLink('');
                // Refresh campaigns
                fetchCampaigns();
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send email campaign';
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
        dispatch(setPageTitle('Email Marketing'));
        fetchCategories();
        fetchCampaigns();
    }, [dispatch, fetchCategories, fetchCampaigns]);

    useEffect(() => {
        fetchRecipientCount();
    }, [fetchRecipientCount]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Bulk Email Marketing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Compose and send bulk emails to your audience.</p>
                </div>
                <button
                    type="button"
                    onClick={handleSendEmail}
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
                            Send Email
                        </>
                    )}
                </button>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Compose Section */}
                <section className="panel space-y-5 lg:col-span-2">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compose Email</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill in the details below to create your campaign.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Campaign Name</label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="e.g., December Newsletter"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Subject Line <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Exciting News from Shramik!"
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Body <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                rows={6}
                                placeholder="Write your email content here..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">CTA Button Text</label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    placeholder="e.g., Learn More"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">CTA Button Link</label>
                                <input
                                    type="url"
                                    value={ctaLink}
                                    onChange={(e) => setCtaLink(e.target.value)}
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
                            <button
                                type="button"
                                onClick={fetchRecipientCount}
                                disabled={isLoadingCount}
                                className="text-primary hover:text-primary/80"
                            >
                                <IconRefresh className={`h-4 w-4 ${isLoadingCount ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Send To</label>
                            <select
                                value={recipientType}
                                onChange={(e) => setRecipientType(e.target.value as 'all' | 'job-seeker' | 'recruiter')}
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="all">All Users</option>
                                <option value="job-seeker">Job Seekers Only</option>
                                <option value="recruiter">Recruiters Only</option>
                            </select>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                                        {isLoadingCount ? '—' : recipientCount.totalCount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Total</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-sky-600 dark:text-sky-400">
                                        {isLoadingCount ? '—' : recipientCount.jobSeekerCount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Job Seekers</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                                        {isLoadingCount ? '—' : recipientCount.recruiterCount.toLocaleString()}
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
                            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <IconMail fill className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                        {subject || 'Your Subject Line'}
                                    </p>
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto p-4 text-sm text-slate-600 dark:text-slate-300">
                                <p className="whitespace-pre-wrap">{emailBody || 'Your email content will appear here...'}</p>
                                {ctaText && (
                                    <button
                                        type="button"
                                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        {ctaText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                </section>
            </div>

            {/* Campaign History */}
            <section className="panel space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Campaign History</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View your past email campaigns and their performance.</p>
                    </div>
                    <button type="button" onClick={fetchCampaigns} className="text-primary hover:text-primary/80">
                        <IconRefresh className={`h-5 w-5 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div
                    ref={campaignsContainerRef}
                    onScroll={handleCampaignsScroll}
                    className="max-h-[400px] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-[700px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Campaign</th>
                                    <th className="px-6 py-3">Recipients</th>
                                    <th className="px-6 py-3">Sent</th>
                                    <th className="px-6 py-3">Failed</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {isLoadingCampaigns ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Loading campaigns...
                                        </td>
                                    </tr>
                                ) : campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No campaigns found. Send your first email campaign!
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {campaigns.map((campaign) => (
                                            <tr key={campaign._id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{campaign.name}</p>
                                                        <p className="truncate text-xs text-slate-500">{campaign.subject}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{campaign.stats.totalRecipients}</td>
                                                <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{campaign.stats.sentCount || 0}</td>
                                                <td className="px-6 py-4 text-rose-600 dark:text-rose-400">{campaign.stats.failedCount || 0}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{formatDateDisplay(campaign.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[campaign.status] || 'bg-slate-100 text-slate-600'}`}>
                                                        {campaign.status}
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
                                        {!hasMoreCampaigns && campaigns.length > 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-3 text-center text-xs text-slate-400">
                                                    No more campaigns
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

export default EmailMarketing;
