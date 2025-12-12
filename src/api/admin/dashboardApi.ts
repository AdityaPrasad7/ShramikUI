import axios from '../../utils/axios';

// Type definitions
export interface DashboardStatsResponse {
    success: boolean;
    message: string;
    data?: {
        stats: {
            totalUsers: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            totalRecruiters: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            activeJobs: {
                count: number;
                growth: number;
                growthLabel: string;
            };
        };
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface UserDistributionItem {
    category: string;
    count: number;
    label: string;
}

export interface UserDistributionResponse {
    success: boolean;
    message: string;
    data?: {
        userMix: UserDistributionItem[];
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface TransactionItem {
    _id: string;
    user: string;
    package: string;
    amount: string;
    coins: number;
    date: string;
    status: 'Completed' | 'Processing' | 'Failed';
}

export interface TransactionsResponse {
    success: boolean;
    message: string;
    data?: {
        transactions: TransactionItem[];
    };
    meta?: {
        pagination: {
            currentPage: number;
            totalPages: number;
            totalTransactions: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface DashboardQueryParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

/**
 * Get dashboard key metrics (total users, recruiters, active jobs)
 */
export const getDashboardStats = async (params?: DashboardQueryParams): Promise<DashboardStatsResponse> => {
    const response = await axios.get<DashboardStatsResponse>('/api/admin/dashboard/stats', {
        params,
    });
    return response.data;
};

/**
 * Get user distribution by category (for pie chart)
 */
export const getUserDistribution = async (params?: DashboardQueryParams): Promise<UserDistributionResponse> => {
    const response = await axios.get<UserDistributionResponse>('/api/admin/dashboard/user-distribution', {
        params,
    });
    return response.data;
};

/**
 * Get recent coin transactions
 */
export const getRecentTransactions = async (params?: DashboardQueryParams): Promise<TransactionsResponse> => {
    const response = await axios.get<TransactionsResponse>('/api/admin/dashboard/recent-transactions', {
        params,
    });
    return response.data;
};
