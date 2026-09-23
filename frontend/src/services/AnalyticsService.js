import axiosClient from "../api/axiosClient";

const errorHandler = (error) => {
    console.error('AnalyticsService error', error?.response?.data || error.message);
    throw error?.response?.data || { message: 'Failed to load analytics' };
};

export const getAdminOverview = async () => {
    try {
        const res = await axiosClient.get('/analytics/admin-overview');
        return res.data?.data;
    } catch (error) {
        throw errorHandler(error);
    }
};

export const getEmployeeOverview = async (employeeId) => {
    try {
        const res = await axiosClient.get(`/analytics/employee/${employeeId}`);
        return res.data?.data;
    } catch (error) {
        throw errorHandler(error);
    }
};

