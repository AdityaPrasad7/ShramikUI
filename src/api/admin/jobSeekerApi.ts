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
    search?: string;
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

export interface AllJobSeekersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    isBlocked?: string;
    category?: string;
}

export interface AllJobSeekersItem {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    gender?: string;
    category: string;
    specialization: string;
    status: string;
    isBlocked: boolean;
    profilePhoto?: string;
    coinBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface AllJobSeekersResponse {
    success: boolean;
    message: string;
    data?: {
        jobSeekers: AllJobSeekersItem[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

/**
 * Get all job seekers with comprehensive filters
 */
export const getAllJobSeekers = async (params?: AllJobSeekersQueryParams): Promise<AllJobSeekersResponse> => {
    const response = await axios.get<AllJobSeekersResponse>('/api/admin/job-seekers/all', {
        params,
    });
    return response.data;
};

/**
 * Block a job seeker
 */
export const blockJobSeeker = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`/api/admin/job-seekers/${id}/block`);
    return response.data;
};

/**
 * Unblock a job seeker
 */
export const unblockJobSeeker = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(`/api/admin/job-seekers/${id}/unblock`);
    return response.data;
};
