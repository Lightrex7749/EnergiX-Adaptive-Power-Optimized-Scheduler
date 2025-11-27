/**
 * API Communication Module
 * Handles all backend API calls
 */

// Backend URL configuration for standalone HTML
const API_BASE_URL = 'https://scheduler-app-9.preview.emergentagent.com';

const API = {
    /**
     * Run scheduling algorithm
     */
    async runScheduler(algorithm, processes, quantum = 2, threshold = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    algorithm,
                    processes,
                    quantum: parseInt(quantum),
                    threshold: threshold ? parseFloat(threshold) : null
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Compare all algorithms
     */
    async compareAlgorithms(processes, quantum = 2) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    processes,
                    quantum: parseInt(quantum)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error' };
        }
    }
};
