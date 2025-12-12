import axios from '../../utils/axios';

// Type definitions
export interface JobSeekerStatsResponse {
    success: boolean;
    message: string;
    data?: {
        stats: {
            activeProfiles: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            interviewsScheduled: {
                count: number;
                subLabel: string;
            };
            offersExtended: {
                count: number;
                growth: number;
                growthLabel: string;
            };
            skillsVerified: {
                count: number;
                subLabel: string;
            };
        };
        dateRange: { startDate: string; endDate: string } | null;
    };
}

export interface JobSeekerItem {
    _id: string;
    name: string;
    profilePhoto?: string;
    specialization: string;
    skills: string[];
    availability: string;
    lastActive: string;
    status: string;
}

export interface TopJobSeekersResponse {
    success: boolean;
    message: string;
    data?: {
        jobSeekers: JobSeekerItem[];
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

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data?: {
        categories: string[];
    };
}

export interface JobSeekerQueryParams {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    category?: string;
}

/**
 * Get job seeker insights stats (Active Profiles, Interviews, Offers, Skills)
 */
export const getJobSeekerStats = async (params?: JobSeekerQueryParams): Promise<JobSeekerStatsResponse> => {
    const response = await axios.get<JobSeekerStatsResponse>('/api/admin/job-seekers/stats', {
        params,
    });
    return response.data;
};

/**
 * Get top job seekers with pagination and filtering
 */
export const getTopJobSeekers = async (params?: JobSeekerQueryParams): Promise<TopJobSeekersResponse> => {
    const response = await axios.get<TopJobSeekersResponse>('/api/admin/job-seekers/top', {
        params,
    });
    return response.data;
};

/**
 * Get list of categories for filter dropdown
 */
export const getJobSeekerCategories = async (): Promise<CategoriesResponse> => {
    const response = await axios.get<CategoriesResponse>('/api/admin/job-seekers/categories');
    return response.data;
};
