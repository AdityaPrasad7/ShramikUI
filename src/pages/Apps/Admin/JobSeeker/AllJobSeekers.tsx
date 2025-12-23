import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import {
    getAllJobSeekers,
    getJobSeekerCategories,
    blockJobSeeker,
    unblockJobSeeker,
    AllJobSeekersItem,
} from '../../../../api/admin/jobSeekerApi';

const AllJobSeekers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [jobSeekers, setJobSeekers] = useState<AllJobSeekersItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [blockedFilter, setBlockedFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20,
        hasNextPage: false,
    });

    useEffect(() => {
        dispatch(setPageTitle('All Job Seekers'));
        loadCategories();
    }, [dispatch]);

    const loadCategories = async () => {
        try {
            const response = await getJobSeekerCategories();
            if (response.success && response.data?.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const fetchJobSeekers = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await getAllJobSeekers({
                page,
                limit: 20,
                search: search || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                isBlocked: blockedFilter || undefined,
                category: categoryFilter !== 'All' ? categoryFilter : undefined,
            });
            if (response.success && response.data) {
                setJobSeekers(response.data.jobSeekers);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch job seekers:', error);
            Swal.fire('Error', 'Failed to load job seekers', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, blockedFilter, categoryFilter]);

    useEffect(() => {
        fetchJobSeekers(1);
    }, [fetchJobSeekers]);

    const handleBlockToggle = async (user: AllJobSeekersItem) => {
        const action = user.isBlocked ? 'unblock' : 'block';
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
            text: `Are you sure you want to ${action} ${user.name || user.phone}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: user.isBlocked ? '#10b981' : '#ef4444',
            confirmButtonText: `Yes, ${action}`,
        });

        if (result.isConfirmed) {
            try {
                if (user.isBlocked) {
                    await unblockJobSeeker(user._id);
                } else {
                    await blockJobSeeker(user._id);
                }
                Swal.fire('Success', `User ${action}ed successfully`, 'success');
                fetchJobSeekers(pagination.currentPage);
            } catch (error) {
                Swal.fire('Error', `Failed to ${action} user`, 'error');
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <button
                        onClick={() => navigate('/job-seeker')}
                        className="mb-2 text-sm text-primary hover:underline"
                    >
                        ← Back to Insights
                    </button>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">All Job Seekers</h1>
                    <p className="text-sm text-slate-500">
                        Manage all job seekers on the platform ({pagination.totalCount} total)
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="panel">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Name, phone, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Block Status</label>
                        <select
                            value={blockedFilter}
                            onChange={(e) => setBlockedFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="">All Users</option>
                            <option value="false">Active Only</option>
                            <option value="true">Blocked Only</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Coins</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : jobSeekers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                        No job seekers found
                                    </td>
                                </tr>
                            ) : (
                                jobSeekers.map((user) => (
                                    <tr key={user._id} className={user.isBlocked ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                                                    {user.profilePhoto ? (
                                                        <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                                                            {user.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{user.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{user.email || 'No email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.phone}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.category}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.coinBalance}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            {user.isBlocked ? (
                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                                                    {user.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleBlockToggle(user)}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${user.isBlocked
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-300'
                                                    }`}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
                        <div className="text-sm text-slate-500">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchJobSeekers(pagination.currentPage - 1)}
                                disabled={!pagination.currentPage || pagination.currentPage <= 1}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchJobSeekers(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllJobSeekers;
