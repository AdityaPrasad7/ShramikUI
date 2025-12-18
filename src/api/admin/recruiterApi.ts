import axios from '../../utils/axios';

// Type definitions
export interface RecruiterStatsResponse {
    success: boolean;
    message: string;
    data?: {
        stats: {
            activeRecruiters: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            openPositions: {
                count: number;
                subLabel: string;
            };
            interviewsConducted: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            hiresConfirmed: {
                count: number;
                growth: number;
                growthLabel: string;
            };
        };
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface RecruiterActivityItem {
    _id: string;
    company: string;
    recruiter: string;
    companyLogo?: string;
    focusArea: string;
    interviews: number;
    lastUpdated: string;
    status: string;
}

export interface RecruiterActivityResponse {
    success: boolean;
    message: string;
    data?: {
        recruiters: RecruiterActivityItem[];
    };
    meta?: {
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface RecruiterQueryParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
}

/**
 * Get recruiter performance stats (Active, Open Positions, Interviews, Hires)
 */
export const getRecruiterStats = async (params?: RecruiterQueryParams): Promise<RecruiterStatsResponse> => {
    const response = await axios.get<RecruiterStatsResponse>('/api/admin/recruiters/stats', {
        params,
    });
    return response.data;
};

/**
 * Get recruiter activity snapshot with pagination
 */
export const getRecruiterActivity = async (params?: RecruiterQueryParams): Promise<RecruiterActivityResponse> => {
    const response = await axios.get<RecruiterActivityResponse>('/api/admin/recruiters/activity', {
        params,
    });
    return response.data;
};
