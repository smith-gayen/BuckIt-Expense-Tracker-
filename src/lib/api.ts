
const API_BASE = '/api';

export class ApiError extends Error {
    constructor(public status: number, public message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.error || 'An error occurred');
    }
    const data = await response.json();
    return data.data as T;
}

export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_BASE}${endpoint}`);
        return handleResponse<T>(response);
    },

    post: async <T>(endpoint: string, data: any): Promise<T> => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse<T>(response);
    },

    put: async <T>(endpoint: string, data: any): Promise<T> => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse<T>(response);
    },

    delete: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
        });
        return handleResponse<T>(response);
    },
};
