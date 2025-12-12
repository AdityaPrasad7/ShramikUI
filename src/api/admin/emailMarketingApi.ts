import axios from '../../utils/axios';

// Type definitions
export interface RecipientCountResponse {
    success: boolean;
    message: string;
    data?: {
        jobSeekerCount: number;
        recruiterCount: number;
        totalCount: number;
    };
}

export interface EmailPreviewResponse {
    success: boolean;
    message: string;
    data?: {
        subject: string;
        html: string;
    };
}

export interface SendEmailPayload {
    name?: string;
    subject: string;
    content: {
        title?: string;
        body: string;
        ctaText?: string;
        ctaLink?: string;
    };
    templateId?: string;
    recipientType: 'all' | 'job-seeker' | 'recruiter';
    filters?: {
        category?: string;
        status?: string;
        state?: string;
        city?: string;
    };
    scheduledAt?: string;
}

export interface CampaignItem {
    _id: string;
    name: string;
    subject: string;
    recipientType: string;
    stats: {
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        openedCount?: number;
        clickedCount?: number;
    };
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
}

export interface CampaignsResponse {
    success: boolean;
    message: string;
    data?: {
        campaigns: CampaignItem[];
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
    };
}

export interface TemplateItem {
    _id: string;
    name: string;
    category: string;
    subject: string;
    targetAudience?: string;
    isActive: boolean;
    createdAt: string;
}

export interface TemplatesResponse {
    success: boolean;
    message: string;
    data?: {
        templates: TemplateItem[];
    };
}

export interface TemplateCategory {
    value: string;
    label: string;
    description: string;
}

export interface TemplateCategoriesResponse {
    success: boolean;
    message: string;
    data?: {
        categories: TemplateCategory[];
    };
}

export interface RecipientQueryParams {
    recipientType: 'all' | 'job-seeker' | 'recruiter';
    category?: string;
    status?: string;
    state?: string;
    city?: string;
}

/**
 * Get recipient count based on filters
 */
export const getRecipientCount = async (params: RecipientQueryParams): Promise<RecipientCountResponse> => {
    const response = await axios.get<RecipientCountResponse>('/api/admin/email/recipients', {
        params,
    });
    return response.data;
};

/**
 * Preview email before sending
 */
export const previewEmail = async (payload: {
    subject?: string;
    content?: object;
    templateId?: string;
}): Promise<EmailPreviewResponse> => {
    const response = await axios.post<EmailPreviewResponse>('/api/admin/email/preview', payload);
    return response.data;
};

/**
 * Send bulk email campaign
 */
export const sendBulkEmail = async (payload: SendEmailPayload): Promise<{ success: boolean; message: string; data?: { campaign: { _id: string; status: string; totalRecipients?: number } } }> => {
    const response = await axios.post('/api/admin/email/send', payload);
    return response.data;
};

/**
 * Get campaign history
 */
export const getCampaigns = async (params?: { page?: number; limit?: number }): Promise<CampaignsResponse> => {
    const response = await axios.get<CampaignsResponse>('/api/admin/email/campaigns', {
        params,
    });
    return response.data;
};

/**
 * Get campaign by ID
 */
export const getCampaignById = async (id: string): Promise<{ success: boolean; message: string; data?: { campaign: CampaignItem } }> => {
    const response = await axios.get(`/api/admin/email/campaigns/${id}`);
    return response.data;
};

/**
 * Get all templates
 */
export const getTemplates = async (params?: { category?: string; targetAudience?: string; isActive?: boolean }): Promise<TemplatesResponse> => {
    const response = await axios.get<TemplatesResponse>('/api/admin/email/templates', {
        params,
    });
    return response.data;
};

/**
 * Get template categories
 */
export const getTemplateCategories = async (): Promise<TemplateCategoriesResponse> => {
    const response = await axios.get<TemplateCategoriesResponse>('/api/admin/email/templates/categories');
    return response.data;
};

/**
 * Create email template
 */
export const createTemplate = async (payload: {
    name: string;
    category?: string;
    subject: string;
    preheader?: string;
    content: object;
    targetAudience?: string;
}): Promise<{ success: boolean; message: string; data?: { template: TemplateItem } }> => {
    const response = await axios.post('/api/admin/email/templates', payload);
    return response.data;
};

/**
 * Delete template
 */
export const deleteTemplate = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/api/admin/email/templates/${id}`);
    return response.data;
};
