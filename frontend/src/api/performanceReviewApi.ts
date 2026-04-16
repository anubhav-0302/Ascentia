import { apiClient } from './apiClient';

export const performanceReviewApi = {
  // Create a simple performance review (no cycle/goal required)
  createReview: async (employeeId: number, rating: number, feedback: string, type: string = 'General') => {
    const response = await apiClient.post('/performance/reviews/simple', {
      employeeId,
      rating,
      feedback,
      type
    });
    return response;
  },

  // Get all reviews for an employee
  getEmployeeReviews: async (employeeId: number) => {
    const response = await apiClient.get(`/performance/reviews/employee/${employeeId}`);
    return response;
  }
};
