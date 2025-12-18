import axios from '../../utils/axios';

// ==================== TYPE DEFINITIONS ====================

export interface TokenStatsResponse {
    success: boolean;
    message: string;
    data?: {
        total: number;
        byUserType: {
            JobSeeker: number;
            Recruiter: number;
        };
        usersWithTokens: {
            JobSeeker: number;
            Recruiter: number;
        };
    };
}

export interface NotificationItem {
    _id: string;
    title: string;
    body: string;
    imageUrl?: string;
    link?: string;
    recipientType: 'all' | 'jobSeekers' | 'recruiters' | 'specific' | 'topic';
    topic?: string;
    status: 'sending' | 'sent' | 'failed' | 'scheduled';
    isScheduled: boolean;
    scheduledAt?: string;
    sentAt?: string;
    createdAt: string;
    stats?: {
        totalRecipients: number;
        sent: number;
        failed: number;
    };
}

export interface NotificationHistoryResponse {
    success: boolean;
    message: string;
    data?: NotificationItem[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface SendNotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    link?: string;
    data?: Record<string, string>;
    recipientType: 'all' | 'jobSeekers' | 'recruiters' | 'specific' | 'topic';
    recipients?: Array<{ userId: string; userType: 'JobSeeker' | 'Recruiter' }>;
    topic?: string;
    scheduledAt?: string;
}

export interface SendNotificationResponse {
    success: boolean;
    message: string;
    data?: {
        notification: NotificationItem;
        result?: {
            success: boolean;
            successCount?: number;
            failureCount?: number;
        };
    };
}

// ==================== API FUNCTIONS ====================

/**
 * Get FCM token statistics
 */
export const getTokenStats = async (): Promise<TokenStatsResponse> => {
    const response = await axios.get<TokenStatsResponse>('/api/notifications/token-stats');
    return response.data;
};

/**
 * Get notification history with pagination
 */
export const getNotificationHistory = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    recipientType?: string;
    adminOnly?: boolean;
}): Promise<NotificationHistoryResponse> => {
    const response = await axios.get<NotificationHistoryResponse>('/api/notifications/history', {
        params: {
            ...params,
            adminOnly: params?.adminOnly ?? true, // Default to admin-sent only
        },
    });
    return response.data;
};

/**
 * Send push notification
 */
export const sendNotification = async (payload: SendNotificationPayload): Promise<SendNotificationResponse> => {
    const response = await axios.post<SendNotificationResponse>('/api/notifications/send', payload);
    return response.data;
};

/**
 * Send notification to specific user
 */
export const sendNotificationToUser = async (payload: {
    userId: string;
    userType: 'JobSeeker' | 'Recruiter';
    title: string;
    body: string;
    imageUrl?: string;
    link?: string;
    data?: Record<string, string>;
}): Promise<SendNotificationResponse> => {
    const response = await axios.post<SendNotificationResponse>('/api/notifications/send-to-user', payload);
    return response.data;
};

/**
 * Delete a notification by ID
 */
export const deleteNotification = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/api/notifications/${id}`);
    return response.data;
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (id: string): Promise<{ success: boolean; message: string; data?: NotificationItem }> => {
    const response = await axios.get(`/api/notifications/${id}`);
    return response.data;
};
